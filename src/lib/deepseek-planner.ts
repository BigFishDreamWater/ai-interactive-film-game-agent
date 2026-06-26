import type { Project } from "@/domain/types";
import { callDeepSeekChat, type DeepSeekChatMessage } from "@/lib/deepseek-client";
import type { ProjectGenerationStep } from "@/lib/pi-agent-orchestrator";

export interface AgentPlan {
  provider: "deepseek" | "fallback";
  model: string;
  steps: ProjectGenerationStep[];
  rationale: string;
  rawText?: string;
  error?: string;
}

const defaultSteps: ProjectGenerationStep[] = ["design", "characters", "story", "assets"];
const allowedSteps = new Set<ProjectGenerationStep>(defaultSteps);

/**
 * Plans the generation tool order with DeepSeek, falling back to the deterministic MVP order.
 */
export async function planProjectGenerationSteps(project: Project): Promise<AgentPlan> {
  const messages: DeepSeekChatMessage[] = [
    {
      role: "system",
      content:
        "You plan a four-tool cinematic dialogue game generation workflow. Return JSON only with steps and rationale."
    },
    { role: "user", content: buildPlannerPrompt(project) }
  ];

  const result = await callDeepSeekChat(messages, { temperature: 0.2, responseFormat: "json_object" });

  if (result.status !== "ok") {
    return createFallbackPlan(result.model, result.error);
  }

  try {
    const parsed = parsePlannerContent(result.content);

    return {
      provider: "deepseek",
      model: result.model,
      steps: parsed.steps,
      rationale: parsed.rationale,
      rawText: result.content
    };
  } catch (error) {
    return createFallbackPlan(result.model, `Invalid planner JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parses and validates the JSON payload returned by the planner model.
 */
export function parsePlannerContent(rawText: string): Pick<AgentPlan, "steps" | "rationale"> {
  const parsed = JSON.parse(rawText) as { steps?: unknown; rationale?: unknown };
  const steps = Array.isArray(parsed.steps) ? normalizeSteps(parsed.steps) : defaultSteps;

  return {
    steps: steps.length > 0 ? steps : defaultSteps,
    rationale: typeof parsed.rationale === "string" ? parsed.rationale : "DeepSeek selected the MVP generation chain."
  };
}

/**
 * Returns the deterministic generation plan used when DeepSeek is unavailable.
 */
export function createFallbackPlan(model = "deepseek-v4-flash", error?: string): AgentPlan {
  return {
    provider: "fallback",
    model,
    steps: defaultSteps,
    rationale: "Using the deterministic MVP generation chain.",
    error
  };
}

/**
 * Returns a deduplicated list of allowed generation steps in model-provided order.
 */
function normalizeSteps(values: unknown[]): ProjectGenerationStep[] {
  const seen = new Set<ProjectGenerationStep>();
  const steps: ProjectGenerationStep[] = [];

  values.forEach((value) => {
    if (typeof value !== "string" || !allowedSteps.has(value as ProjectGenerationStep)) {
      return;
    }

    const step = value as ProjectGenerationStep;

    if (!seen.has(step)) {
      seen.add(step);
      steps.push(step);
    }
  });

  return steps;
}

/**
 * Builds the compact prompt sent to DeepSeek for tool-order planning.
 */
function buildPlannerPrompt(project: Project): string {
  return [
    "Allowed steps: design, characters, story, assets.",
    "Return JSON exactly like: {\"steps\":[\"design\",\"characters\",\"story\",\"assets\"],\"rationale\":\"...\"}.",
    `Project title: ${project.title}`,
    `Genre: ${project.genre}`,
    `Style: ${project.style}`,
    `Brief: ${project.brief}`
  ].join("\n");
}
