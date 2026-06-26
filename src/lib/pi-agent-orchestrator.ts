import type { AgentTool, AgentToolResult } from "@earendil-works/pi-agent-core";
import { Type } from "typebox";
import type { AssetItem, CharacterCard, GameDesignSpec, Project, StoryGraph } from "@/domain/types";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets } from "@/lib/asset-planner";
import { createFallbackPlan, planProjectGenerationSteps, type AgentPlan } from "@/lib/deepseek-planner";
import { runStoryMultiAgent, type StoryAgentResult } from "@/lib/story-agent";

export type ProjectGenerationStep = "design" | "characters" | "story" | "assets";

export interface PiAgentTraceEvent {
  toolName: string;
  toolCallId: string;
  status: "completed" | "failed";
  startedAt: number;
  finishedAt: number;
}

export interface ProjectGenerationAgentInput {
  project: Project;
  steps?: ProjectGenerationStep[];
}

export interface ProjectGenerationAgentResult {
  provider: "@earendil-works/pi-agent-core";
  plan: AgentPlan;
  design: GameDesignSpec;
  characters: CharacterCard[];
  storyGraph: StoryGraph;
  assets: AssetItem[];
  trace: PiAgentTraceEvent[];
  storyAgent?: StoryAgentResult;
}

interface ProjectGenerationWorkingState {
  design?: GameDesignSpec;
  characters?: CharacterCard[];
  storyGraph?: StoryGraph;
  assets?: AssetItem[];
  storyAgent?: StoryAgentResult;
}

type ProjectGenerationPiTool = AgentTool<typeof generationToolParameters, ProjectGenerationToolDetails>;
type ProjectGenerationToolDetails =
  | { artifact: "design"; projectId: string; design: GameDesignSpec }
  | { artifact: "characters"; projectId: string; characters: CharacterCard[] }
  | { artifact: "story"; projectId: string; storyGraph: StoryGraph }
  | { artifact: "assets"; projectId: string; assets: AssetItem[] };

const generationToolParameters = Type.Object({});
const defaultGenerationSteps: ProjectGenerationStep[] = ["design", "characters", "story", "assets"];

/**
 * Creates the Pi Agent Core tools used by the browser-game generation workflow.
 */
export function createProjectGenerationPiTools(
  project: Project,
  state: ProjectGenerationWorkingState = {}
): ProjectGenerationPiTool[] {
  return [
    {
      name: "design.generate",
      label: "Generate Design",
      description: "Create the design specification from the project brief.",
      parameters: generationToolParameters,
      executionMode: "sequential",
      execute: async () => {
        state.design = generateDesignSpec(project);
        return createToolResult("Generated design spec.", {
          artifact: "design",
          projectId: project.id,
          design: state.design
        });
      }
    },
    {
      name: "characters.generate",
      label: "Generate Characters",
      description: "Create character cards after the design specification exists.",
      parameters: generationToolParameters,
      executionMode: "sequential",
      execute: async () => {
        state.design = state.design ?? generateDesignSpec(project);
        state.characters = generateCharacterCards(project, state.design);
        return createToolResult("Generated character cards.", {
          artifact: "characters",
          projectId: project.id,
          characters: state.characters
        });
      }
    },
    {
      name: "story.generate",
      label: "Generate Story",
      description: "Run the writer, critic and reviser agents to draft a playable story graph.",
      parameters: generationToolParameters,
      executionMode: "sequential",
      execute: async () => {
        state.design = state.design ?? generateDesignSpec(project);
        state.characters = state.characters ?? generateCharacterCards(project, state.design);
        const storyAgent = await runStoryMultiAgent({ project, design: state.design, characters: state.characters });
        state.storyGraph = storyAgent.storyGraph;
        state.storyAgent = storyAgent;
        return createToolResult("Generated story graph via writer-critic-reviser agents.", {
          artifact: "story",
          projectId: project.id,
          storyGraph: state.storyGraph
        });
      }
    },
    {
      name: "assets.plan",
      label: "Plan Assets",
      description: "Plan accepted MVP assets for backgrounds, sprites, and UI chrome.",
      parameters: generationToolParameters,
      executionMode: "sequential",
      execute: async () => {
        state.design = state.design ?? generateDesignSpec(project);
        state.characters = state.characters ?? generateCharacterCards(project, state.design);
        state.storyGraph = state.storyGraph ?? generateStoryGraph(project, state.design, state.characters);
        state.assets = planProjectAssets(state.storyGraph, state.characters);
        return createToolResult("Planned playable assets.", {
          artifact: "assets",
          projectId: project.id,
          assets: state.assets
        });
      }
    }
  ];
}

/**
 * Runs the MVP project generation workflow through Pi Agent Core tool contracts.
 */
export async function runProjectGenerationAgent(input: ProjectGenerationAgentInput): Promise<ProjectGenerationAgentResult> {
  const trace: PiAgentTraceEvent[] = [];
  const state: ProjectGenerationWorkingState = {};
  const plan = input.steps
    ? { ...createFallbackPlan(), steps: input.steps, rationale: "Using caller-provided generation steps." }
    : await planProjectGenerationSteps(input.project);
  const steps = plan.steps.length > 0 ? plan.steps : defaultGenerationSteps;
  const tools = createProjectGenerationPiTools(input.project, state);

  for (const [index, step] of steps.entries()) {
    const tool = requirePiTool(tools, toolNameForStep(step));

    await runTracedTool(trace, tool, `local-pi-tool-${index + 1}-${step}`);
  }

  ensureCompleteGenerationState(input.project, state);

  return {
    provider: "@earendil-works/pi-agent-core",
    plan,
    design: state.design,
    characters: state.characters,
    storyGraph: state.storyGraph,
    assets: state.assets,
    trace,
    storyAgent: state.storyAgent
  };
}

/**
 * Returns a successful Pi tool result with text for the model and details for the UI trace.
 */
function createToolResult(
  text: string,
  details: ProjectGenerationToolDetails
): AgentToolResult<ProjectGenerationToolDetails> {
  return {
    content: [{ type: "text", text }],
    details,
    terminate: true
  };
}

/**
 * Records the timing and completion status of one agent tool call.
 */
async function runTracedTool(
  trace: PiAgentTraceEvent[],
  tool: ProjectGenerationPiTool,
  toolCallId: string
): Promise<void> {
  const startedAt = Date.now();

  try {
    await tool.execute(toolCallId, {});
    trace.push({ toolName: tool.name, toolCallId, status: "completed", startedAt, finishedAt: Date.now() });
  } catch (error) {
    trace.push({ toolName: tool.name, toolCallId, status: "failed", startedAt, finishedAt: Date.now() });
    throw error;
  }
}

/**
 * Finds a Pi tool by name or throws a clear integration error.
 */
function requirePiTool(tools: ProjectGenerationPiTool[], toolName: string): ProjectGenerationPiTool {
  const tool = tools.find((candidate) => candidate.name === toolName);

  if (!tool) {
    throw new Error(`Pi generation tool not found: ${toolName}`);
  }

  return tool;
}

/**
 * Converts a high-level generation step into the tool name exposed in the agent trace.
 */
function toolNameForStep(step: ProjectGenerationStep): string {
  const names: Record<ProjectGenerationStep, string> = {
    design: "design.generate",
    characters: "characters.generate",
    story: "story.generate",
    assets: "assets.plan"
  };

  return names[step];
}

/**
 * Fills dependency artifacts when a caller requested only a subset of generation steps.
 */
function ensureCompleteGenerationState(project: Project, state: ProjectGenerationWorkingState): asserts state is Required<ProjectGenerationWorkingState> {
  state.design = state.design ?? generateDesignSpec(project);
  state.characters = state.characters ?? generateCharacterCards(project, state.design);
  state.storyGraph = state.storyGraph ?? generateStoryGraph(project, state.design, state.characters);
  state.assets = state.assets ?? planProjectAssets(state.storyGraph, state.characters);
}
