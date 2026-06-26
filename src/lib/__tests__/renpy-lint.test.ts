import { describe, expect, it } from "vitest";
import { runRenPyStaticLint } from "@/lib/renpy-lint";
import { buildRenPyProjectFiles } from "@/lib/renpy-exporter";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets } from "@/lib/asset-planner";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("renpy lint", () => {
  it("passes generated Ren'Py project files", () => {
    const project = createProjectFromBrief({
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case."
    });
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);
    const storyGraph = generateStoryGraph(project, design, characters);
    const assets = planProjectAssets(storyGraph, characters);
    const files = buildRenPyProjectFiles({ project, storyGraph, characters, assets });

    const report = runRenPyStaticLint(files);

    expect(report.ok).toBe(true);
    expect(report.mode).toBe("static");
    expect(report.errors).toEqual([]);
  });

  it("reports jumps to labels that do not exist", () => {
    const report = runRenPyStaticLint([
      { path: "game/script.rpy", content: "label start:\n    jump missing_label\n" },
      { path: "game/characters.rpy", content: "define p = Character(\"Player\")" },
      { path: "game/images.rpy", content: "" },
      { path: "game/options.rpy", content: "define config.name = \"Broken\"" }
    ]);

    expect(report.ok).toBe(false);
    expect(report.errors).toContain("Missing Ren'Py jump target: missing_label");
  });
});
