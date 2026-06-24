import { beforeEach, describe, expect, it } from "vitest";
import {
  clearProjectStore,
  createProject,
  generateProjectCharacters,
  generateProjectDesign,
  generateProjectStory,
  getProjectSnapshot
} from "@/lib/project-store";

describe("project store", () => {
  beforeEach(() => {
    clearProjectStore();
  });

  it("creates a project and builds generated design artifacts", () => {
    const project = createProject({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家是实习记者，在雨夜咖啡馆调查案件。"
    });

    const design = generateProjectDesign(project.id);
    const characters = generateProjectCharacters(project.id);
    const story = generateProjectStory(project.id);
    const snapshot = getProjectSnapshot(project.id);

    expect(design.characterCount).toBe(3);
    expect(characters).toHaveLength(3);
    expect(story.nodes.length).toBeGreaterThanOrEqual(8);
    expect(snapshot?.project.id).toBe(project.id);
    expect(snapshot?.design?.projectId).toBe(project.id);
    expect(snapshot?.characters).toHaveLength(3);
    expect(snapshot?.storyGraph?.startNodeId).toBe("scene_01_cafe");
  });
});
