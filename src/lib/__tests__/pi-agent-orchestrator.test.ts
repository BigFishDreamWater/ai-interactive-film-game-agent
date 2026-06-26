import { afterEach, describe, expect, it, vi } from "vitest";
import { createProjectGenerationPiTools, runProjectGenerationAgent } from "@/lib/pi-agent-orchestrator";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("pi agent orchestrator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("exposes generation steps as pi-agent-core tools", async () => {
    const project = createProjectFromBrief({
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case."
    });
    const tools = createProjectGenerationPiTools(project);
    const signal = new AbortController().signal;

    const designResult = await tools[0].execute("tool-call-design", {}, signal);

    expect(tools.map((tool) => tool.name)).toEqual([
      "design.generate",
      "characters.generate",
      "story.generate",
      "assets.plan"
    ]);
    expect(designResult.content[0]).toEqual({ type: "text", text: "Generated design spec." });
    expect(designResult.details).toMatchObject({ artifact: "design", projectId: project.id });
  });

  it("runs the full MVP generation workflow through traced agent tools", async () => {
    const project = createProjectFromBrief({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查咖啡馆。"
    });
    const result = await runProjectGenerationAgent({ project, steps: ["design", "characters", "story", "assets"] });

    expect(result.provider).toBe("@earendil-works/pi-agent-core");
    expect(result.design.characterCount).toBe(3);
    expect(result.characters).toHaveLength(3);
    expect(result.storyGraph.nodes.length).toBeGreaterThanOrEqual(8);
    expect(result.assets.length).toBeGreaterThan(0);
    expect(result.trace.map((event) => event.toolName)).toEqual([
      "design.generate",
      "characters.generate",
      "story.generate",
      "assets.plan"
    ]);
    expect(result.trace.every((event) => event.status === "completed" && event.finishedAt >= event.startedAt)).toBe(true);
    expect(result.trace.every((event) => event.toolCallId.startsWith("local-pi-tool-"))).toBe(true);
  });

  it("uses DeepSeek planner output when explicit steps are not provided", async () => {
    const project = createProjectFromBrief({
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case."
    });
    vi.stubEnv("deepseek_api_key", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  steps: ["design", "story", "assets"],
                  rationale: "A short plan for a deterministic MVP."
                })
              }
            }
          ]
        })
      })
    );

    const result = await runProjectGenerationAgent({ project });

    expect(result.plan.provider).toBe("deepseek");
    expect(result.plan.steps).toEqual(["design", "story", "assets"]);
    expect(result.trace.map((event) => event.toolName)).toEqual(["design.generate", "story.generate", "assets.plan"]);
  });
});
