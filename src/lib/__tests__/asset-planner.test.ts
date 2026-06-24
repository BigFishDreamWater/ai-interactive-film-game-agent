import { beforeEach, describe, expect, it } from "vitest";
import {
  acceptProjectAsset,
  cancelProjectAsset,
  clearProjectStore,
  createProject,
  generateProjectAssets,
  generateProjectCharacters,
  generateProjectDesign,
  generateProjectStory,
  replaceProjectAsset
} from "@/lib/project-store";

describe("asset planner and asset actions", () => {
  beforeEach(() => {
    clearProjectStore();
  });

  it("plans accepted assets for generated story scenes and characters", () => {
    const project = createProject({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查雨夜咖啡馆案件。"
    });

    generateProjectDesign(project.id);
    generateProjectCharacters(project.id);
    generateProjectStory(project.id);
    const assets = generateProjectAssets(project.id);

    expect(assets.some((asset) => asset.assetId === "bg_cafe_rain")).toBe(true);
    expect(assets.some((asset) => asset.assetId === "char_lina_neutral")).toBe(true);
    expect(assets.every((asset) => asset.status === "accepted")).toBe(true);
  });

  it("cancels and replaces a required project asset", () => {
    const project = createProject({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查雨夜咖啡馆案件。"
    });

    generateProjectDesign(project.id);
    generateProjectCharacters(project.id);
    generateProjectStory(project.id);
    generateProjectAssets(project.id);

    const cancelled = cancelProjectAsset(project.id, "bg_cafe_rain");
    const replaced = replaceProjectAsset(project.id, "bg_cafe_rain", "bg_library_evening");
    const accepted = acceptProjectAsset(project.id, "bg_cafe_rain");

    expect(cancelled.status).toBe("cancelled");
    expect(replaced.filePath).toBe("library/backgrounds/library-evening.svg");
    expect(accepted.status).toBe("accepted");
  });
});
