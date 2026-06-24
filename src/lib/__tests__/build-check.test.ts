import { describe, expect, it } from "vitest";
import { runBuildCheck } from "@/lib/build-check";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets } from "@/lib/asset-planner";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("build check", () => {
  it("passes for a complete generated project", () => {
    const project = createProjectFromBrief({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查咖啡馆。"
    });
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);
    const storyGraph = generateStoryGraph(project, design, characters);
    const assets = planProjectAssets(storyGraph, characters);
    const report = runBuildCheck({ storyGraph, characters, assets });

    expect(report.ok).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it("reports cancelled required assets with scene context", () => {
    const project = createProjectFromBrief({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查咖啡馆。"
    });
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);
    const storyGraph = generateStoryGraph(project, design, characters);
    const assets = planProjectAssets(storyGraph, characters).map((asset) =>
      asset.assetId === "bg_cafe_rain" ? { ...asset, status: "cancelled" as const } : asset
    );
    const report = runBuildCheck({ storyGraph, characters, assets });

    expect(report.ok).toBe(false);
    expect(report.errors.some((error) => error.assetId === "bg_cafe_rain" && error.nodeId === "scene_01_cafe")).toBe(true);
  });
});
