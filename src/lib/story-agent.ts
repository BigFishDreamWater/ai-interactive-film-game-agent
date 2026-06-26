/**
 * Multi-agent story design pipeline.
 *
 * The story step used to be a single deterministic template. It is now driven
 * by three collaborating agents:
 *   - Writer:  asks DeepSeek to draft a StoryGraph tailored to the brief,
 *              genre and character cards (deterministic template on failure).
 *   - Critic:  reviews the draft. Always runs a rule-based structural pass and,
 *              when DeepSeek is available, augments it with an LLM critique.
 *   - Reviser: asks DeepSeek to revise the draft using the critique, looping
 *              draft -> critique -> revise until there are no high-severity
 *              issues or the iteration budget is spent.
 *
 * The whole pipeline degrades gracefully to the deterministic MVP story when no
 * DeepSeek key is configured, so existing tests and offline demos keep working.
 */

import type { CharacterCard, GameDesignSpec, Project, StoryGraph, StoryNode, StoryVariable } from "@/domain/types";
import { listLibraryAssets } from "@/lib/asset-library";
import { generateStoryGraph } from "@/lib/agents";
import { callDeepSeekChat, hasDeepSeekApiKey, type DeepSeekChatMessage } from "@/lib/deepseek-client";

export type StoryAgentRole = "writer" | "critic" | "reviser";
export type StoryAgentProvider = "deepseek" | "fallback";
export type StoryAgentStepStatus = "completed" | "fallback" | "skipped";

export interface StoryAgentEvent {
  role: StoryAgentRole;
  provider: StoryAgentProvider;
  status: StoryAgentStepStatus;
  startedAt: number;
  finishedAt: number;
  summary: string;
}

export type StoryCritiqueSeverity = "high" | "medium" | "low";
export type StoryCritiqueCategory = "consistency" | "branching" | "variables" | "pacing" | "assets";

export interface StoryCritiqueIssue {
  severity: StoryCritiqueSeverity;
  category: StoryCritiqueCategory;
  message: string;
  nodeId?: string;
}

export interface StoryCritique {
  summary: string;
  issues: StoryCritiqueIssue[];
}

export interface StoryAgentResult {
  storyGraph: StoryGraph;
  provider: StoryAgentProvider;
  iterations: number;
  events: StoryAgentEvent[];
  critique?: StoryCritique;
}

export interface StoryAgentInput {
  project: Project;
  design: GameDesignSpec;
  characters: CharacterCard[];
  maxIterations?: number;
  signal?: AbortSignal;
}

interface StoryDraftResult {
  storyGraph: StoryGraph | null;
  provider: StoryAgentProvider;
  rawText?: string;
  error?: string;
}

const defaultMaxIterations = 2;

/**
 * Runs the writer -> critic -> reviser story design pipeline and returns the
 * final story graph plus a trace of every agent role that participated.
 */
export async function runStoryMultiAgent(input: StoryAgentInput): Promise<StoryAgentResult> {
  const events: StoryAgentEvent[] = [];
  const maxIterations = input.maxIterations ?? defaultMaxIterations;

  const draft = await runWriterAgent(input, events);
  let storyGraph = draft.storyGraph ?? generateStoryGraph(input.project, input.design, input.characters);
  let iterations = 0;
  let critique: StoryCritique | undefined;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    critique = await runCriticAgent(input, storyGraph, events);

    const highIssues = critique.issues.filter((issue) => issue.severity === "high");

    if (highIssues.length === 0) {
      break;
    }

    const revision = await runReviserAgent(input, storyGraph, critique, events);

    if (revision.storyGraph) {
      storyGraph = revision.storyGraph;
      iterations += 1;
    } else {
      break;
    }
  }

  return {
    storyGraph,
    provider: draft.provider,
    iterations,
    events,
    critique
  };
}

/**
 * Writer agent: drafts a tailored StoryGraph with DeepSeek, falling back to the
 * deterministic template when the model is unavailable or output is invalid.
 */
async function runWriterAgent(input: StoryAgentInput, events: StoryAgentEvent[]): Promise<StoryDraftResult> {
  const startedAt = Date.now();

  if (!hasDeepSeekApiKey()) {
    events.push(writerEvent("fallback", "Skipped DeepSeek writer; using deterministic story template.", startedAt));
    return { storyGraph: null, provider: "fallback", error: "Missing DeepSeek API key." };
  }

  const result = await callDeepSeekChat(buildWriterMessages(input), {
    temperature: 0.7,
    responseFormat: "json_object",
    signal: input.signal
  });

  if (result.status !== "ok") {
    events.push(writerEvent("fallback", `DeepSeek writer failed: ${result.error}`, startedAt));
    return { storyGraph: null, provider: "fallback", error: result.error };
  }

  const storyGraph = sanitizeStoryGraph(result.content, input);

  if (!storyGraph) {
    events.push(writerEvent("fallback", "DeepSeek writer output failed validation; using deterministic template.", startedAt));
    return { storyGraph: null, provider: "fallback", rawText: result.content, error: "Sanitization failed." };
  }

  events.push(writerEvent("deepseek", `DeepSeek writer drafted ${storyGraph.nodes.length} story nodes.`, startedAt));
  return { storyGraph, provider: "deepseek", rawText: result.content };
}

/**
 * Critic agent: always runs a rule-based structural review and augments it with
 * a DeepSeek critique when a key is configured.
 */
async function runCriticAgent(input: StoryAgentInput, storyGraph: StoryGraph, events: StoryAgentEvent[]): Promise<StoryCritique> {
  const startedAt = Date.now();
  const ruleBased = runRuleBasedCritique(storyGraph, input.characters);

  if (!hasDeepSeekApiKey()) {
    events.push(criticEvent("fallback", `Rule-based critic found ${ruleBased.issues.length} issue(s).`, startedAt));
    return ruleBased;
  }

  const result = await callDeepSeekChat(buildCriticMessages(input, storyGraph), {
    temperature: 0.3,
    responseFormat: "json_object",
    signal: input.signal
  });

  if (result.status !== "ok") {
    events.push(criticEvent("fallback", `DeepSeek critic failed: ${result.error}; using rule-based review.`, startedAt));
    return ruleBased;
  }

  const llmCritique = parseCritiqueContent(result.content);

  if (!llmCritique) {
    events.push(criticEvent("fallback", "DeepSeek critic returned invalid JSON; using rule-based review.", startedAt));
    return ruleBased;
  }

  const combined: StoryCritique = {
    summary: llmCritique.summary || ruleBased.summary,
    issues: dedupeIssues([...ruleBased.issues, ...llmCritique.issues])
  };

  events.push(criticEvent("deepseek", `Critic reviewed the draft: ${combined.issues.length} issue(s).`, startedAt));
  return combined;
}

/**
 * Reviser agent: asks DeepSeek to revise the draft using the critique. Skipped
 * when there is no key or when the previous critic found no high-severity issues.
 */
async function runReviserAgent(
  input: StoryAgentInput,
  storyGraph: StoryGraph,
  critique: StoryCritique,
  events: StoryAgentEvent[]
): Promise<StoryDraftResult> {
  const startedAt = Date.now();

  if (!hasDeepSeekApiKey()) {
    events.push(reviserEvent("fallback", "Skipped DeepSeek reviser; no API key.", startedAt));
    return { storyGraph: null, provider: "fallback" };
  }

  const result = await callDeepSeekChat(buildReviserMessages(input, storyGraph, critique), {
    temperature: 0.5,
    responseFormat: "json_object",
    signal: input.signal
  });

  if (result.status !== "ok") {
    events.push(reviserEvent("fallback", `DeepSeek reviser failed: ${result.error}; keeping current draft.`, startedAt));
    return { storyGraph: null, provider: "fallback", error: result.error };
  }

  const revised = sanitizeStoryGraph(result.content, input);

  if (!revised) {
    events.push(reviserEvent("fallback", "DeepSeek reviser output failed validation; keeping current draft.", startedAt));
    return { storyGraph: null, provider: "fallback", rawText: result.content, error: "Sanitization failed." };
  }

  events.push(reviserEvent("deepseek", `DeepSeek reviser produced a revised draft with ${revised.nodes.length} nodes.`, startedAt));
  return { storyGraph: revised, provider: "deepseek", rawText: result.content };
}

/**
 * Sanitises a raw DeepSeek story payload into a build-check-safe StoryGraph.
 * Returns null when the payload cannot be shaped into a playable graph.
 */
export function sanitizeStoryGraph(raw: string, input: StoryAgentInput): StoryGraph | null {
  const parsed = parseJsonObject(raw);

  if (!parsed || !Array.isArray(parsed.nodes)) {
    return null;
  }

  const validBackgrounds = validBackgroundAssetIds();
  const characterIds = new Set(input.characters.map((character) => character.id));
  const rawNodes = parsed.nodes as unknown[];
  const seenIds = new Set<string>();
  const nodes: StoryNode[] = [];

  rawNodes.forEach((entry, index) => {
    const node = sanitizeNode(entry, index, validBackgrounds, characterIds, seenIds);

    if (node) {
      nodes.push(node);
    }
  });

  if (nodes.length === 0) {
    return null;
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const endingIds = nodes.filter((node) => node.type === "ending").map((node) => node.id);
  const fallbackTargetId = endingIds[0] ?? nodes[nodes.length - 1].id;

  nodes.forEach((node) => {
    node.choices.forEach((choice) => {
      if (!nodeIds.has(choice.nextNodeId)) {
        choice.nextNodeId = fallbackTargetId;
      }
    });
  });

  if (!endingIds[0]) {
    const lastNode = nodes[nodes.length - 1];
    lastNode.type = "ending";
    lastNode.choices = [];
  }

  const variables = sanitizeVariables(parsed.variables, nodes);
  const startNodeId = typeof parsed.startNodeId === "string" && nodeIds.has(parsed.startNodeId) ? parsed.startNodeId : nodes[0].id;

  return {
    projectId: input.project.id,
    startNodeId,
    variables,
    nodes
  };
}

/**
 * Runs a deterministic structural review of a story graph so the critic always
 * has a baseline even without DeepSeek.
 */
export function runRuleBasedCritique(storyGraph: StoryGraph, characters: CharacterCard[]): StoryCritique {
  const issues: StoryCritiqueIssue[] = [];
  const nodeIds = new Set(storyGraph.nodes.map((node) => node.id));
  const variableNames = new Set(storyGraph.variables.map((variable) => variable.name));
  const characterIds = new Set([...characters.map((character) => character.id), "player"]);
  const validBackgrounds = new Set(validBackgroundAssetIds());

  const duplicateIds = findDuplicateNodeIds(storyGraph);
  duplicateIds.forEach((nodeId) => {
    issues.push({ severity: "high", category: "branching", message: `Duplicate story node id: ${nodeId}`, nodeId });
  });

  if (!nodeIds.has(storyGraph.startNodeId)) {
    issues.push({ severity: "high", category: "branching", message: `Start node not found: ${storyGraph.startNodeId}` });
  }

  if (!storyGraph.nodes.some((node) => node.type === "ending")) {
    issues.push({ severity: "high", category: "branching", message: "At least one ending node is required." });
  }

  const reachable = new Set<string>([storyGraph.startNodeId]);

  storyGraph.nodes.forEach((node) => {
    if (node.backgroundAssetId && !validBackgrounds.has(node.backgroundAssetId)) {
      issues.push({ severity: "high", category: "assets", message: `Unknown background asset: ${node.backgroundAssetId}`, nodeId: node.id });
    }

    node.characters.forEach((characterId) => {
      if (!characterIds.has(characterId)) {
        issues.push({ severity: "low", category: "consistency", message: `Node references unknown character: ${characterId}`, nodeId: node.id });
      }
    });

    node.beats.forEach((beat) => {
      if (beat.speaker && !characterIds.has(beat.speaker)) {
        issues.push({ severity: "low", category: "consistency", message: `Beat references unknown speaker: ${beat.speaker}`, nodeId: node.id });
      }
    });

    node.choices.forEach((choice) => {
      if (!nodeIds.has(choice.nextNodeId)) {
        issues.push({ severity: "high", category: "branching", message: `Choice target not found: ${choice.nextNodeId}`, nodeId: node.id });
      } else {
        reachable.add(choice.nextNodeId);
      }

      choice.effects.forEach((effect) => {
        if (!variableNames.has(effect.var)) {
          issues.push({ severity: "high", category: "variables", message: `Choice effect references undefined variable: ${effect.var}`, nodeId: node.id });
        }
      });
    });
  });

  storyGraph.nodes.forEach((node) => {
    if (node.id !== storyGraph.startNodeId && !reachable.has(node.id)) {
      issues.push({ severity: "medium", category: "pacing", message: `Orphan node is never reachable: ${node.id}`, nodeId: node.id });
    }
  });

  const highCount = issues.filter((issue) => issue.severity === "high").length;
  const summary = highCount === 0 ? "Story graph passes structural review." : `Structural review found ${highCount} high-severity issue(s).`;

  return { summary, issues };
}

/**
 * Parses and validates the JSON critique payload returned by the DeepSeek critic.
 */
export function parseCritiqueContent(raw: string): StoryCritique | null {
  const parsed = parseJsonObject(raw);

  if (!parsed) {
    return null;
  }

  const issues = Array.isArray(parsed.issues) ? (parsed.issues as unknown[]).filter(isCritiqueIssue) : [];

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "DeepSeek critic reviewed the draft.",
    issues
  };
}

/**
 * Builds the DeepSeek messages for the writer agent.
 */
export function buildWriterMessages(input: StoryAgentInput): DeepSeekChatMessage[] {
  const { project, design, characters } = input;
  const backgrounds = validBackgroundAssetIds().join(", ");
  const characterRoster = characters
    .map((character) => `${character.id} (${character.name}, ${character.role}, ${character.speechStyle})`)
    .join("; ");

  return [
    {
      role: "system",
      content:
        "You are the Writer agent for a cinematic dialogue game. Produce a playable StoryGraph as JSON only, matching the given schema exactly."
    },
    {
      role: "user",
      content: [
        "Write a branching story tailored to the brief below.",
        `Content boundary: ${design.contentBoundary}`,
        `Target ${design.sceneCount} scene nodes and ${design.endingCount} ending nodes.`,
        `Available backgroundAssetIds: ${backgrounds}.`,
        `Characters (use these ids in beats.speaker and node.characters): ${characterRoster}.`,
        "Schema: {\"projectId\":string,\"startNodeId\":string,\"variables\":[{\"name\":string,\"type\":\"number|boolean|string\",\"default\":any}],\"nodes\":[{\"id\":string,\"type\":\"scene|ending\",\"title\":string,\"backgroundAssetId\":string,\"characters\":[string],\"objective\":string,\"beats\":[{\"speaker\":string,\"text\":string}],\"choices\":[{\"id\":string,\"text\":string,\"effects\":[{\"var\":string,\"op\":\"+=|-=|set\",\"value\":any}],\"nextNodeId\":string}]}]}.",
        "Rules: use only the listed backgroundAssetIds; every choice.nextNodeId must reference an existing node id; every effect.var must be declared in variables; include at least one ending node (choices:[]); node ids must be unique; keep dialogue in Chinese unless the brief is English.",
        `Project title: ${project.title}`,
        `Genre: ${project.genre}`,
        `Style: ${project.style}`,
        `Brief: ${project.brief}`
      ].join("\n")
    }
  ];
}

/**
 * Builds the DeepSeek messages for the critic agent.
 */
export function buildCriticMessages(input: StoryAgentInput, storyGraph: StoryGraph): DeepSeekChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are the Critic agent for a cinematic dialogue game. Review the story graph and return JSON only."
    },
    {
      role: "user",
      content: [
        "Review this StoryGraph for consistency, branching, variable usage, pacing and asset validity.",
        "Return JSON exactly like: {\"summary\":string,\"issues\":[{\"severity\":\"high|medium|low\",\"category\":\"consistency|branching|variables|pacing|assets\",\"message\":string,\"nodeId\":string}]}.",
        `Project brief: ${input.project.brief}`,
        `Story graph: ${JSON.stringify(storyGraph)}`
      ].join("\n")
    }
  ];
}

/**
 * Builds the DeepSeek messages for the reviser agent.
 */
export function buildReviserMessages(input: StoryAgentInput, storyGraph: StoryGraph, critique: StoryCritique): DeepSeekChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are the Reviser agent for a cinematic dialogue game. Return a revised StoryGraph as JSON only, matching the original schema."
    },
    {
      role: "user",
      content: [
        "Revise the draft StoryGraph to fix every critique issue. Keep the same schema and the same constraints (valid backgroundAssetIds, connected choices, declared variables, at least one ending, unique node ids).",
        `Critique summary: ${critique.summary}`,
        `Issues: ${JSON.stringify(critique.issues)}`,
        `Available backgroundAssetIds: ${validBackgroundAssetIds().join(", ")}.`,
        `Draft: ${JSON.stringify(storyGraph)}`
      ].join("\n")
    }
  ];
}

/**
 * Sanitises a single story node from raw LLM output into a valid StoryNode.
 */
function sanitizeNode(
  entry: unknown,
  index: number,
  validBackgrounds: string[],
  characterIds: Set<string>,
  seenIds: Set<string>
): StoryNode | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const raw = entry as Record<string, unknown>;
  const baseId = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : `scene_${index + 1}`;
  const id = dedupeNodeId(baseId, seenIds);
  const type = raw.type === "ending" || raw.type === "start" ? (raw.type as StoryNode["type"]) : "scene";
  const title = typeof raw.title === "string" ? raw.title : id;
  const backgroundAssetId = resolveBackgroundAssetId(raw.backgroundAssetId, index, validBackgrounds);
  const characters = Array.isArray(raw.characters) ? (raw.characters as unknown[]).filter((value): value is string => typeof value === "string" && characterIds.has(value)) : [];
  const objective = typeof raw.objective === "string" ? raw.objective : title;
  const beats = Array.isArray(raw.beats) ? (raw.beats as unknown[]).map(sanitizeBeat).filter((beat): beat is NonNullable<typeof beat> => Boolean(beat)) : [];
  const choices = type === "ending" ? [] : sanitizeChoices(raw.choices);

  return { id, type, title, backgroundAssetId, characters, objective, beats, choices };
}

/**
 * Coerces a raw beat into a { speaker, text } pair.
 */
function sanitizeBeat(beat: unknown): { speaker: string; text: string } | null {
  if (!beat || typeof beat !== "object") {
    return null;
  }

  const raw = beat as Record<string, unknown>;

  if (typeof raw.text !== "string" || raw.text.length === 0) {
    return null;
  }

  return { speaker: typeof raw.speaker === "string" ? raw.speaker : "player", text: raw.text };
}

/**
 * Sanitises a raw choices array into valid StoryChoice objects.
 */
function sanitizeChoices(raw: unknown): StoryNode["choices"] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return (raw as unknown[])
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
    .map((entry, index) => ({
      id: typeof entry.id === "string" ? entry.id : `choice_${index + 1}`,
      text: typeof entry.text === "string" ? entry.text : "Continue.",
      effects: Array.isArray(entry.effects) ? (entry.effects as unknown[]).map(sanitizeEffect).filter((effect): effect is NonNullable<typeof effect> => Boolean(effect)) : [],
      nextNodeId: typeof entry.nextNodeId === "string" ? entry.nextNodeId : ""
    }));
}

/**
 * Coerces a raw effect into a valid ChoiceEffect, inferring the operator.
 */
function sanitizeEffect(value: unknown): { var: string; op: "+=" | "-=" | "set"; value: number | boolean | string } | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const effect = value as Record<string, unknown>;

  if (typeof effect.var !== "string" || effect.var.length === 0) {
    return null;
  }

  const effectValue = effect.value;

  if (typeof effectValue !== "number" && typeof effectValue !== "boolean" && typeof effectValue !== "string") {
    return null;
  }

  const op = effect.op === "+=" || effect.op === "-=" ? effect.op : "set";

  return { var: effect.var, op, value: effectValue };
}

/**
 * Merges declared variables with any variables referenced by choice effects.
 */
function sanitizeVariables(raw: unknown, nodes: StoryNode[]): StoryVariable[] {
  const declared = new Map<string, StoryVariable>();

  if (Array.isArray(raw)) {
    (raw as unknown[]).forEach((entry) => {
      if (!entry || typeof entry !== "object") {
        return;
      }

      const variable = entry as Record<string, unknown>;

      if (typeof variable.name === "string" && variable.name.length > 0) {
        declared.set(variable.name, {
          name: variable.name,
          type: variable.type === "number" || variable.type === "boolean" ? variable.type : "string",
          default: coerceVariableDefault(variable.default, variable.type)
        });
      }
    });
  }

  nodes.forEach((node) => {
    node.choices.forEach((choice) => {
      choice.effects.forEach((effect) => {
        if (!declared.has(effect.var)) {
          declared.set(effect.var, inferVariable(effect.var, effect.value));
        }
      });
    });
  });

  return Array.from(declared.values());
}

/**
 * Returns the valid built-in background asset ids the writer may reference.
 */
function validBackgroundAssetIds(): string[] {
  return listLibraryAssets("background").map((asset) => asset.assetId);
}

/**
 * Clamps a raw background asset id to a valid library background.
 */
function resolveBackgroundAssetId(raw: unknown, index: number, validBackgrounds: string[]): string {
  if (typeof raw === "string" && validBackgrounds.includes(raw)) {
    return raw;
  }

  if (validBackgrounds.length === 0) {
    return "";
  }

  return validBackgrounds[index % validBackgrounds.length];
}

/**
 * Ensures a node id is unique within the sanitised graph by suffixing duplicates.
 */
function dedupeNodeId(baseId: string, seenIds: Set<string>): string {
  if (!seenIds.has(baseId)) {
    seenIds.add(baseId);
    return baseId;
  }

  let counter = 2;
  let candidate = `${baseId}_${counter}`;

  while (seenIds.has(candidate)) {
    counter += 1;
    candidate = `${baseId}_${counter}`;
  }

  seenIds.add(candidate);
  return candidate;
}

/**
 * Finds repeated story node ids that would create invalid branches.
 */
function findDuplicateNodeIds(storyGraph: StoryGraph): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  storyGraph.nodes.forEach((node) => {
    if (seen.has(node.id)) {
      duplicates.add(node.id);
      return;
    }

    seen.add(node.id);
  });

  return Array.from(duplicates);
}

/**
 * Type-guards a raw object into a StoryCritiqueIssue.
 */
function isCritiqueIssue(value: unknown): value is StoryCritiqueIssue {
  if (!value || typeof value !== "object") {
    return false;
  }

  const issue = value as Record<string, unknown>;
  const severity = issue.severity;
  const category = issue.category;

  return (
    (severity === "high" || severity === "medium" || severity === "low") &&
    (category === "consistency" || category === "branching" || category === "variables" || category === "pacing" || category === "assets") &&
    typeof issue.message === "string"
  );
}

/**
 * Deduplicates critique issues by message so rule-based and LLM findings do not double-count.
 */
function dedupeIssues(issues: StoryCritiqueIssue[]): StoryCritiqueIssue[] {
  const seen = new Set<string>();
  const result: StoryCritiqueIssue[] = [];

  issues.forEach((issue) => {
    const key = `${issue.severity}:${issue.category}:${issue.message}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(issue);
    }
  });

  return result;
}

/**
 * Infers a StoryVariable declaration from an effect value.
 */
function inferVariable(name: string, value: number | boolean | string): StoryVariable {
  if (typeof value === "number") {
    return { name, type: "number", default: 0 };
  }

  if (typeof value === "boolean") {
    return { name, type: "boolean", default: false };
  }

  return { name, type: "string", default: "" };
}

/**
 * Returns the default value for a variable type.
 */
function defaultForType(type: unknown): number | boolean | string {
  if (type === "number") {
    return 0;
  }

  if (type === "boolean") {
    return false;
  }

  return "";
}

/**
 * Coerces a raw variable default into a valid primitive, falling back to the type default.
 */
function coerceVariableDefault(value: unknown, type: unknown): number | boolean | string {
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return value;
  }

  return defaultForType(type);
}

/**
 * Parses a JSON object from a string, returning null instead of throwing.
 */
function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(raw);

    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Records a writer agent trace event.
 */
function writerEvent(provider: StoryAgentProvider, summary: string, startedAt: number): StoryAgentEvent {
  return { role: "writer", provider, status: provider === "deepseek" ? "completed" : "fallback", startedAt, finishedAt: Date.now(), summary };
}

/**
 * Records a critic agent trace event.
 */
function criticEvent(provider: StoryAgentProvider, summary: string, startedAt: number): StoryAgentEvent {
  return { role: "critic", provider, status: "completed", startedAt, finishedAt: Date.now(), summary };
}

/**
 * Records a reviser agent trace event.
 */
function reviserEvent(provider: StoryAgentProvider, summary: string, startedAt: number): StoryAgentEvent {
  return { role: "reviser", provider, status: provider === "deepseek" ? "completed" : "skipped", startedAt, finishedAt: Date.now(), summary };
}
