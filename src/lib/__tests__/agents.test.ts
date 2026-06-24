import { describe, expect, it } from "vitest";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { createProjectFromBrief } from "@/lib/project-factory";

const project = createProjectFromBrief(
  {
    title: "雨夜咖啡馆",
    genre: "mystery",
    style: "cinematic noir anime",
    brief: "玩家是实习记者，在雨夜咖啡馆和一名女侦探对话，找出受害者最后见过的人。"
  },
  new Date("2026-06-24T10:00:00.000Z")
);

describe("rule-based MVP agents", () => {
  it("generates a design spec with MVP-sized scope", () => {
    const design = generateDesignSpec(project);

    expect(design.projectId).toBe(project.id);
    expect(design.characterCount).toBeGreaterThanOrEqual(3);
    expect(design.sceneCount).toBeGreaterThanOrEqual(6);
    expect(design.sceneCount).toBeLessThanOrEqual(8);
    expect(design.endingCount).toBe(2);
  });

  it("generates character cards with required playable fields", () => {
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);

    expect(characters).toHaveLength(design.characterCount);
    expect(characters[0]).toMatchObject({
      projectId: project.id,
      id: "char_lina",
      name: "Lina"
    });
    expect(characters.every((character) => character.speechStyle && character.requiredExpressions.length > 0)).toBe(true);
  });

  it("generates a connected story graph with variables and endings", () => {
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);
    const graph = generateStoryGraph(project, design, characters);
    const nodeIds = new Set(graph.nodes.map((node) => node.id));

    expect(graph.startNodeId).toBe("scene_01_cafe");
    expect(graph.variables.length).toBeGreaterThan(0);
    expect(graph.nodes.filter((node) => node.type === "scene").length).toBeGreaterThanOrEqual(6);
    expect(graph.nodes.filter((node) => node.type === "ending")).toHaveLength(2);
    expect(graph.nodes.flatMap((node) => node.choices).every((choice) => nodeIds.has(choice.nextNodeId))).toBe(true);
  });
});
