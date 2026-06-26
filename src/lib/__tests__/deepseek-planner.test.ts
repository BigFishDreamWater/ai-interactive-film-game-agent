import { afterEach, describe, expect, it, vi } from "vitest";
import { planProjectGenerationSteps } from "@/lib/deepseek-planner";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("deepseek planner", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("falls back to deterministic steps when no api key is configured", async () => {
    const project = createProjectFromBrief({
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case."
    });

    const plan = await planProjectGenerationSteps(project);

    expect(plan.provider).toBe("fallback");
    expect(plan.model).toBe("deepseek-v4-flash");
    expect(plan.steps).toEqual(["design", "characters", "story", "assets"]);
    expect(plan.error).toContain("deepseek_api_key");
  });

  it("parses DeepSeek JSON output and filters repeated or invalid steps", async () => {
    const project = createProjectFromBrief({
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case."
    });
    vi.stubEnv("deepseek_api_key", "test-key");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                steps: ["design", "characters", "characters", "story", "unknown", "assets"],
                rationale: "Mystery projects need the full generation chain."
              })
            }
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const plan = await planProjectGenerationSteps(project);

    expect(plan.provider).toBe("deepseek");
    expect(plan.steps).toEqual(["design", "characters", "story", "assets"]);
    expect(plan.rationale).toBe("Mystery projects need the full generation chain.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" })
      })
    );
  });

  it("falls back when DeepSeek returns invalid JSON", async () => {
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
        json: async () => ({ choices: [{ message: { content: "not json" } }] })
      })
    );

    const plan = await planProjectGenerationSteps(project);

    expect(plan.provider).toBe("fallback");
    expect(plan.steps).toEqual(["design", "characters", "story", "assets"]);
    expect(plan.error).toContain("JSON");
  });
});
