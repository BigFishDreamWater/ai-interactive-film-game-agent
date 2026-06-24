import { describe, expect, it } from "vitest";
import { applyChoice, createPreviewState, getCurrentNode } from "@/lib/preview-runtime";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("preview runtime", () => {
  it("starts at the first scene and applies choice effects", () => {
    const project = createProjectFromBrief({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查咖啡馆。"
    });
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);
    const graph = generateStoryGraph(project, design, characters);
    const initialState = createPreviewState(graph);
    const nextState = applyChoice(graph, initialState, "show_ticket");

    expect(getCurrentNode(graph, initialState).id).toBe("scene_01_cafe");
    expect(nextState.currentNodeId).toBe("scene_02_counter");
    expect(nextState.variables.trust_lina).toBe(2);
    expect(nextState.variables.found_ticket_stub).toBe(true);
  });
});
