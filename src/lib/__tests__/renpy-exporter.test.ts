import { describe, expect, it } from "vitest";
import { buildRenPyProjectFiles } from "@/lib/renpy-exporter";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets } from "@/lib/asset-planner";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("renpy exporter", () => {
  it("generates Ren'Py files and excludes cancelled assets", () => {
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
      asset.assetId === "bg_library_evening" ? { ...asset, status: "cancelled" as const } : asset
    );
    const files = buildRenPyProjectFiles({ project, storyGraph, characters, assets });
    const script = files.find((file) => file.path === "game/script.rpy")?.content ?? "";
    const images = files.find((file) => file.path === "game/images.rpy")?.content ?? "";
    const licenses = files.find((file) => file.path === "game/LICENSES.md")?.content ?? "";

    expect(script).toContain("label start:");
    expect(script).toContain("menu:");
    expect(images).toContain("image bg cafe_rain");
    expect(images).not.toContain("library_evening");
    expect(licenses).toContain("MVP Built-in CC0 Pack");
  });
});
