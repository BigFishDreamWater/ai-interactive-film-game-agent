import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  cancelProjectAsset,
  clearProjectStore,
  createProject,
  generateProjectCharacters,
  generateProjectDesign,
  generateProjectAssets,
  generateProjectStory,
  getProjectSnapshot,
  runProjectAgentWorkflow
} from "@/lib/project-store";
import { loadProjectSnapshots } from "@/lib/project-repository";

describe("project store", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "ai-chat-reality-store-"));
    tempDirs.push(dir);
    vi.stubEnv("PROJECT_STORE_PATH", join(dir, "projects.json"));
    clearProjectStore();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
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

  it("stores a traced Pi-compatible workflow result", async () => {
    const project = createProject({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查雨夜咖啡馆案件。"
    });

    const snapshot = await runProjectAgentWorkflow(project.id);

    expect(snapshot.design?.characterCount).toBe(3);
    expect(snapshot.characters).toHaveLength(3);
    expect(snapshot.storyGraph?.startNodeId).toBe("scene_01_cafe");
    expect(snapshot.assets.length).toBeGreaterThan(0);
    expect(snapshot.agentTrace?.map((event) => event.toolName)).toEqual([
      "design.generate",
      "characters.generate",
      "story.generate",
      "assets.plan"
    ]);
  });

  it("restores a stored project after a simulated restart", () => {
    const project = createProject({
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case."
    });

    generateProjectDesign(project.id);
    generateProjectCharacters(project.id);
    generateProjectStory(project.id);
    generateProjectAssets(project.id);
    cancelProjectAsset(project.id, "bg_cafe_rain");

    clearProjectStore();

    const snapshot = getProjectSnapshot(project.id);

    expect(loadProjectSnapshots()).toHaveLength(1);
    expect(snapshot?.project.id).toBe(project.id);
    expect(snapshot?.storyGraph?.startNodeId).toBe("scene_01_cafe");
    expect(snapshot?.assets.some((asset) => asset.assetId === "bg_cafe_rain" && asset.status === "cancelled")).toBe(true);
  });
});
