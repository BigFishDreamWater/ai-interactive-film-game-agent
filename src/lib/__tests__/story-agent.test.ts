import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { createProjectFromBrief } from "@/lib/project-factory";
import {
  parseCritiqueContent,
  runRuleBasedCritique,
  runStoryMultiAgent,
  sanitizeStoryGraph
} from "@/lib/story-agent";
import type { CharacterCard, StoryGraph } from "@/domain/types";

const writerGraphJson = JSON.stringify({
  startNodeId: "scene_open",
  variables: [{ name: "trust", type: "number", default: 0 }],
  nodes: [
    {
      id: "scene_open",
      type: "scene",
      title: "开场",
      backgroundAssetId: "bg_cafe_rain",
      characters: ["char_lina"],
      objective: "让玩家见到侦探。",
      beats: [{ speaker: "char_lina", text: "你来了。" }],
      choices: [{ id: "go_on", text: "继续", effects: [{ var: "trust", op: "+=", value: 1 }], nextNodeId: "ending_done" }]
    },
    {
      id: "ending_done",
      type: "ending",
      title: "结束",
      backgroundAssetId: "bg_library_evening",
      characters: [],
      objective: "结局。",
      beats: [{ speaker: "char_lina", text: "再见。" }],
      choices: []
    }
  ]
});

const revisedGraphJson = JSON.stringify({
  startNodeId: "scene_open",
  variables: [{ name: "trust", type: "number", default: 0 }],
  nodes: [
    {
      id: "scene_open",
      type: "scene",
      title: "开场",
      backgroundAssetId: "bg_cafe_rain",
      characters: ["char_lina"],
      objective: "让玩家见到侦探。",
      beats: [{ speaker: "char_lina", text: "你来了。" }],
      choices: [{ id: "go_on", text: "继续", effects: [{ var: "trust", op: "+=", value: 1 }], nextNodeId: "scene_middle" }]
    },
    {
      id: "scene_middle",
      type: "scene",
      title: "中段",
      backgroundAssetId: "bg_alley_night",
      characters: ["char_lina"],
      objective: "发现线索。",
      beats: [{ speaker: "char_lina", text: "看这个。" }],
      choices: [{ id: "to_end", text: "前往结局", effects: [], nextNodeId: "ending_done" }]
    },
    {
      id: "ending_done",
      type: "ending",
      title: "结束",
      backgroundAssetId: "bg_library_evening",
      characters: [],
      objective: "结局。",
      beats: [{ speaker: "char_lina", text: "再见。" }],
      choices: []
    }
  ]
});

const critiqueWithIssueJson = JSON.stringify({
  summary: "Story is too short for the target scene count.",
  issues: [{ severity: "high", category: "pacing", message: "Story is too short." }]
});

const critiqueCleanJson = JSON.stringify({ summary: "Story passes review.", issues: [] });

function buildStoryAgentInput() {
  const project = createProjectFromBrief({
    title: "Rain Cafe",
    genre: "mystery",
    style: "noir",
    brief: "A reporter investigates a late-night cafe case."
  });
  const design = generateDesignSpec(project);
  const characters = generateCharacterCards(project, design);

  return { project, design, characters };
}

describe("story agent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("falls back to the deterministic story when no DeepSeek key is configured", async () => {
    const { project, design, characters } = buildStoryAgentInput();

    const result = await runStoryMultiAgent({ project, design, characters });

    expect(result.provider).toBe("fallback");
    expect(result.iterations).toBe(0);
    expect(result.storyGraph.nodes.length).toBeGreaterThanOrEqual(8);
    expect(result.events.map((event) => event.role)).toEqual(["writer", "critic"]);
    expect(result.events.every((event) => event.provider === "fallback")).toBe(true);
  });

  it("sanitises a valid DeepSeek story payload into a build-check-safe graph", () => {
    const { project, design, characters } = buildStoryAgentInput();

    const graph = sanitizeStoryGraph(writerGraphJson, { project, design, characters });

    expect(graph).not.toBeNull();
    const nodeIds = graph!.nodes.map((node) => node.id);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(graph!.nodes.some((node) => node.type === "ending")).toBe(true);
    expect(graph!.startNodeId).toBe("scene_open");
    graph!.nodes.forEach((node) => {
      node.choices.forEach((choice) => {
        expect(nodeIds).toContain(choice.nextNodeId);
        choice.effects.forEach((effect) => {
          expect(graph!.variables.map((variable) => variable.name)).toContain(effect.var);
        });
      });
    });
  });

  it("rejects payloads without a nodes array", () => {
    const { project, design, characters } = buildStoryAgentInput();

    expect(sanitizeStoryGraph("{}", { project, design, characters })).toBeNull();
    expect(sanitizeStoryGraph("not json", { project, design, characters })).toBeNull();
  });

  it("repairs broken choices, variables and backgrounds", () => {
    const brokenJson = JSON.stringify({
      startNodeId: "missing_start",
      nodes: [
        {
          id: "scene_a",
          type: "scene",
          title: "A",
          backgroundAssetId: "not_a_real_background",
          characters: ["char_lina"],
          objective: "A",
          beats: [],
          choices: [{ id: "c", text: "go", effects: [{ var: "undeclared_var", op: "set", value: true }], nextNodeId: "does_not_exist" }]
        },
        { id: "ending_x", type: "ending", title: "End", characters: [], objective: "end", beats: [], choices: [] }
      ]
    });
    const { project, design, characters } = buildStoryAgentInput();

    const graph = sanitizeStoryGraph(brokenJson, { project, design, characters });

    expect(graph).not.toBeNull();
    expect(graph!.startNodeId).toBe("scene_a");
    expect(graph!.nodes[0].backgroundAssetId).not.toBe("not_a_real_background");
    expect(graph!.nodes[0].choices[0].nextNodeId).toBe("ending_x");
    expect(graph!.variables.map((variable) => variable.name)).toContain("undeclared_var");
    expect(graph!.nodes.some((node) => node.type === "ending")).toBe(true);
  });

  it("dedupes repeated node ids", () => {
    const duplicateJson = JSON.stringify({
      nodes: [
        { id: "dup", type: "scene", title: "A", characters: [], objective: "", beats: [], choices: [] },
        { id: "dup", type: "scene", title: "B", characters: [], objective: "", beats: [], choices: [] }
      ]
    });
    const { project, design, characters } = buildStoryAgentInput();

    const graph = sanitizeStoryGraph(duplicateJson, { project, design, characters });

    expect(graph).not.toBeNull();
    expect(new Set(graph!.nodes.map((node) => node.id)).size).toBe(graph!.nodes.length);
  });

  it("reports no high-severity issues for the deterministic template", () => {
    const { project, design, characters } = buildStoryAgentInput();
    const storyGraph = generateStoryGraph(project, design, characters);

    const critique = runRuleBasedCritique(storyGraph, characters);

    expect(critique.issues.filter((issue) => issue.severity === "high")).toHaveLength(0);
  });

  it("flags structural problems in a broken graph", () => {
    const brokenGraph: StoryGraph = {
      projectId: "p",
      startNodeId: "nope",
      variables: [],
      nodes: [
        {
          id: "scene_a",
          type: "scene",
          title: "A",
          backgroundAssetId: "not_a_real_background",
          characters: [],
          objective: "",
          beats: [],
          choices: [{ id: "c", text: "go", effects: [{ var: "missing", op: "set", value: true }], nextNodeId: "nope" }]
        }
      ]
    };

    const critique = runRuleBasedCritique(brokenGraph, [] as CharacterCard[]);

    const categories = critique.issues.map((issue) => issue.category);
    expect(categories).toContain("branching");
    expect(categories).toContain("variables");
    expect(categories).toContain("assets");
  });

  it("parses valid critique JSON and tolerates empty payloads", () => {
    const critique = parseCritiqueContent(critiqueWithIssueJson);

    expect(critique?.issues).toHaveLength(1);
    expect(critique?.issues[0].severity).toBe("high");

    expect(parseCritiqueContent("not json")).toBeNull();

    const empty = parseCritiqueContent("{}");
    expect(empty).not.toBeNull();
    expect(empty?.issues).toHaveLength(0);
  });

  it("runs the writer -> critic -> reviser loop against a mocked DeepSeek", async () => {
    const { project, design, characters } = buildStoryAgentInput();
    vi.stubEnv("deepseek_api_key", "test-key");

    let criticCallCount = 0;
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { messages: Array<{ content: string }> };
      const systemPrompt = body.messages[0]?.content ?? "";

      if (systemPrompt.includes("Writer agent")) {
        return { ok: true, json: async () => ({ choices: [{ message: { content: writerGraphJson } }] }) };
      }

      if (systemPrompt.includes("Critic agent")) {
        criticCallCount += 1;
        const content = criticCallCount === 1 ? critiqueWithIssueJson : critiqueCleanJson;
        return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) };
      }

      if (systemPrompt.includes("Reviser agent")) {
        return { ok: true, json: async () => ({ choices: [{ message: { content: revisedGraphJson } }] }) };
      }

      return { ok: true, json: async () => ({ choices: [{ message: { content: "{}" } }] }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runStoryMultiAgent({ project, design, characters });

    expect(result.provider).toBe("deepseek");
    expect(result.iterations).toBe(1);
    expect(result.storyGraph.nodes).toHaveLength(3);
    expect(result.events.map((event) => event.role)).toEqual(["writer", "critic", "reviser", "critic"]);
    expect(result.events.every((event) => event.provider === "deepseek")).toBe(true);
    expect(result.critique?.issues).toHaveLength(0);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("falls back when the writer returns invalid JSON", async () => {
    const { project, design, characters } = buildStoryAgentInput();
    vi.stubEnv("deepseek_api_key", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: "not json" } }] }) }))
    );

    const result = await runStoryMultiAgent({ project, design, characters });

    expect(result.provider).toBe("fallback");
    expect(result.storyGraph.nodes.length).toBeGreaterThanOrEqual(8);
    expect(result.events[0].role).toBe("writer");
    expect(result.events[0].status).toBe("fallback");
  });
});
