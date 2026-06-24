import type { AssetItem, CharacterCard, Project, StoryGraph, StoryNode } from "@/domain/types";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

export interface RenPyExportInput {
  project: Project;
  storyGraph: StoryGraph;
  characters: CharacterCard[];
  assets: AssetItem[];
}

export interface RenPyProjectFile {
  path: string;
  content: string;
}

export interface RenPyProjectImageFile {
  path: string;
  content: Buffer;
}

/**
 * Builds the Ren'Py project text files from accepted assets and story data.
 */
export function buildRenPyProjectFiles(input: RenPyExportInput): RenPyProjectFile[] {
  const acceptedAssets = input.assets.filter((asset) => asset.status === "accepted");

  return [
    { path: "game/characters.rpy", content: renderCharacters(input.characters) },
    { path: "game/images.rpy", content: renderImages(acceptedAssets) },
    { path: "game/script.rpy", content: renderScript(input.storyGraph, input.characters) },
    { path: "game/options.rpy", content: renderOptions(input.project) },
    { path: "game/LICENSES.md", content: renderLicenses(acceptedAssets) }
  ];
}

/**
 * Copies accepted public assets into the Ren'Py project image tree.
 */
export function buildRenPyProjectImageFiles(assets: AssetItem[]): RenPyProjectImageFile[] {
  return assets
    .filter((asset) => asset.status === "accepted")
    .map((asset) => ({
      path: `game/${renpyAssetRelativePath(asset)}`,
      content: readFileSync(`public/${asset.filePath}`)
    }));
}

/**
 * Renders Ren'Py Character definitions for every story character.
 */
function renderCharacters(characters: CharacterCard[]): string {
  const definitions = ['define p = Character("Player")'];

  characters.forEach((character) => {
    definitions.push(`define ${renpyVar(character.id)} = Character("${character.name}")`);
  });

  return definitions.join("\n");
}

/**
 * Renders Ren'Py image declarations for accepted background, sprite, expression, and UI assets.
 */
function renderImages(assets: AssetItem[]): string {
  return assets.map((asset) => `image ${renpyImageName(asset)} = "${renpyImageReferencePath(asset)}"`).join("\n");
}

/**
 * Renders the main Ren'Py script with labels, scenes, characters, menus, and jumps.
 */
function renderScript(storyGraph: StoryGraph, characters: CharacterCard[]): string {
  const characterIds = new Set(characters.map((character) => character.id));
  const nodes = storyGraph.nodes.map((node) => renderNode(node, storyGraph.startNodeId, characterIds));

  return [...renderDefaults(storyGraph), "", ...nodes].join("\n\n");
}

/**
 * Renders Ren'Py default statements for story variables.
 */
function renderDefaults(storyGraph: StoryGraph): string[] {
  return storyGraph.variables.map((variable) => `default ${variable.name} = ${renderRenpyLiteral(variable.default)}`);
}

/**
 * Renders one story node into Ren'Py label syntax.
 */
function renderNode(node: StoryNode, startNodeId: string, characterIds: Set<string>): string {
  const lines: string[] = [`label ${node.id === startNodeId ? "start" : safeLabel(node.id)}:`];

  if (node.backgroundAssetId) {
    lines.push(`    scene ${backgroundImageName(node.backgroundAssetId)}`);
  }

  node.characters.forEach((characterId) => {
    if (characterIds.has(characterId)) {
      lines.push(`    show ${characterSpriteName(characterId)} neutral at center`);
    }
  });

  node.beats.forEach((beat) => {
    const speaker = beat.speaker === "player" ? "p" : renpyVar(beat.speaker);
    lines.push(`    ${speaker} "${escapeRenpyText(beat.text)}"`);
  });

  if (node.choices.length > 0) {
    lines.push("    menu:");
    node.choices.forEach((choice) => {
      lines.push(`        "${escapeRenpyText(choice.text)}":`);
      choice.effects.forEach((effect) => {
        lines.push(`            $ ${effect.var} = ${renderEffectExpression(effect.var, effect.op, effect.value)}`);
      });
      lines.push(`            jump ${safeLabel(choice.nextNodeId)}`);
    });
  } else {
    lines.push("    return");
  }

  return lines.join("\n");
}

/**
 * Renders a minimal Ren'Py options file with the project title.
 */
function renderOptions(project: Project): string {
  return `define config.name = "${escapeRenpyText(project.title)}"`;
}

/**
 * Renders license attributions for every accepted exported asset.
 */
function renderLicenses(assets: AssetItem[]): string {
  const rows = assets.map(
    (asset) =>
      `- ${asset.title} (${asset.assetId}): ${asset.source.name}, ${asset.source.license}, ${asset.source.author}, ${asset.source.sourceUrl}`
  );

  return ["# Asset Licenses", "", ...rows, ""].join("\n");
}

/**
 * Converts an internal character id into a Ren'Py-safe variable name.
 */
function renpyVar(id: string): string {
  return id.replace(/^char_/, "").replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * Converts an internal label id into Ren'Py-safe label syntax.
 */
function safeLabel(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * Converts an asset id into a Ren'Py image declaration name.
 */
function renpyImageName(asset: AssetItem): string {
  if (asset.type === "background") {
    return backgroundImageName(asset.assetId);
  }

  if (asset.type === "character_sprite" || asset.type === "expression") {
    return `${characterSpriteName(asset.characterId ?? asset.assetId)} ${asset.expression ?? "neutral"}`;
  }

  return `ui ${safeLabel(asset.assetId.replace(/^ui_/, ""))}`;
}

/**
 * Converts one accepted asset into a relative Ren'Py project image path.
 */
function renpyAssetRelativePath(asset: AssetItem): string {
  if (asset.type === "background") {
    return `images/backgrounds/${basename(asset.filePath)}`;
  }

  if (asset.type === "character_sprite" || asset.type === "expression") {
    return `images/characters/${basename(asset.filePath)}`;
  }

  return `images/ui/${basename(asset.filePath)}`;
}

/**
 * Converts one accepted asset into the image reference used inside Ren'Py scripts.
 */
function renpyImageReferencePath(asset: AssetItem): string {
  return renpyAssetRelativePath(asset).replaceAll("\\", "/");
}

/**
 * Converts a background asset id into a Ren'Py background image name.
 */
function backgroundImageName(assetId: string): string {
  return `bg ${safeLabel(assetId.replace(/^bg_/, ""))}`;
}

/**
 * Converts a character id into the base sprite image name used by Ren'Py.
 */
function characterSpriteName(characterId: string): string {
  return safeLabel(characterId.replace(/^char_/, ""));
}

/**
 * Escapes text for safe inclusion in Ren'Py string literals.
 */
function escapeRenpyText(text: string): string {
  return text.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

/**
 * Renders a JavaScript value as a Python-style Ren'Py literal.
 */
function renderRenpyLiteral(value: number | boolean | string): string {
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (typeof value === "string") {
    return `"${escapeRenpyText(value)}"`;
  }

  return String(value);
}

/**
 * Renders a Ren'Py assignment expression for a choice effect.
 */
function renderEffectExpression(variable: string, op: string, value: number | boolean | string): string {
  const renderedValue = renderRenpyLiteral(value);

  if (op === "+=") {
    return `${variable} + ${renderedValue}`;
  }

  if (op === "-=") {
    return `${variable} - ${renderedValue}`;
  }

  return renderedValue;
}
