import assert from "node:assert/strict";
import { runBuildCheck } from "../src/lib/build-check";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "../src/lib/agents";
import { planProjectAssets } from "../src/lib/asset-planner";
import { createProjectFromBrief } from "../src/lib/project-factory";
import { applyChoice, createPreviewState, getCurrentNode } from "../src/lib/preview-runtime";
import { buildRenPyProjectFiles, buildRenPyProjectImageFiles } from "../src/lib/renpy-exporter";

/**
 * Runs a script-level MVP acceptance flow that mirrors the manual T01-T15 test plan.
 */
function runMvpAcceptance(): void {
  const project = createProjectFromBrief({
    title: "雨夜咖啡馆",
    genre: "mystery",
    style: "cinematic noir anime",
    brief: "玩家是实习记者，在雨夜咖啡馆和一名女侦探对话，找出受害者最后见过的人。"
  });
  const design = generateDesignSpec(project);
  const characters = generateCharacterCards(project, design);
  const storyGraph = generateStoryGraph(project, design, characters);
  const assets = planProjectAssets(storyGraph, characters);
  const buildReport = runBuildCheck({ storyGraph, characters, assets });
  const previewStart = createPreviewState(storyGraph);
  const previewAfterChoice = applyChoice(storyGraph, previewStart, "show_ticket");
  const renpyFiles = buildRenPyProjectFiles({ project, storyGraph, characters, assets });
  const imageFiles = buildRenPyProjectImageFiles(assets);
  const script = requireFile(renpyFiles, "game/script.rpy");
  const characterDefinitions = requireFile(renpyFiles, "game/characters.rpy");
  const imageDefinitions = requireFile(renpyFiles, "game/images.rpy");
  const licenses = requireFile(renpyFiles, "game/LICENSES.md");

  assert.equal(project.title, "雨夜咖啡馆");
  assert.ok(design.sceneCount >= 6 && design.sceneCount <= 8);
  assert.equal(design.characterCount, 3);
  assert.equal(design.endingCount, 2);
  assert.equal(storyGraph.startNodeId, "scene_01_cafe");
  assert.ok(storyGraph.nodes.filter((node) => node.type === "scene").length >= 6);
  assert.equal(storyGraph.nodes.filter((node) => node.type === "ending").length, 2);
  assert.ok(characters.every((character) => character.requiredExpressions.length > 0 && character.speechStyle));
  assert.ok(assets.every((asset) => asset.source.license && asset.source.author && asset.status === "accepted"));
  assert.equal(getCurrentNode(storyGraph, previewStart).id, "scene_01_cafe");
  assert.equal(previewAfterChoice.currentNodeId, "scene_02_counter");
  assert.equal(previewAfterChoice.variables.found_ticket_stub, true);
  assert.equal(buildReport.ok, true);
  assert.ok(characterDefinitions.includes("define p = Character"));
  assert.ok(imageDefinitions.includes("image bg cafe_rain"));
  assert.ok(script.includes("label start:"));
  assert.ok(script.includes("menu:"));
  assert.ok(script.includes("jump scene_02_counter"));
  assert.ok(imageFiles.some((file) => file.path.startsWith("game/images/backgrounds/")));
  assert.ok(licenses.includes("MVP Built-in CC0 Pack"));
}

/**
 * Reads a generated Ren'Py text file by path or raises an assertion error.
 */
function requireFile(files: Array<{ path: string; content: string }>, path: string): string {
  const file = files.find((candidate) => candidate.path === path);

  assert.ok(file, `Expected generated file: ${path}`);
  return file.content;
}

runMvpAcceptance();
console.log("MVP acceptance flow passed.");
