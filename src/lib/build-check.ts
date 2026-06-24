import type { AssetItem, CharacterCard, StoryGraph } from "@/domain/types";
import { existsSync } from "node:fs";
import { join, normalize } from "node:path";

export interface BuildCheckInput {
  storyGraph?: StoryGraph;
  characters: CharacterCard[];
  assets: AssetItem[];
}

export interface BuildCheckError {
  code: string;
  message: string;
  nodeId?: string;
  assetId?: string;
}

export interface BuildCheckReport {
  ok: boolean;
  errors: BuildCheckError[];
}

/**
 * Runs static MVP checks for story graph integrity, accepted assets, and license metadata.
 */
export function runBuildCheck(input: BuildCheckInput): BuildCheckReport {
  const errors: BuildCheckError[] = [];

  if (!input.storyGraph) {
    errors.push({ code: "missing_story", message: "Story graph has not been generated." });
    return { ok: false, errors };
  }

  const nodeIds = new Set(input.storyGraph.nodes.map((node) => node.id));
  const variableNames = new Set(input.storyGraph.variables.map((variable) => variable.name));
  const assetsById = new Map(input.assets.map((asset) => [asset.assetId, asset]));

  findDuplicateNodeIds(input.storyGraph).forEach((nodeId) => {
    errors.push({
      code: "duplicate_node_id",
      message: `Duplicate story node id found: ${nodeId}`,
      nodeId
    });
  });

  if (!nodeIds.has(input.storyGraph.startNodeId)) {
    errors.push({ code: "missing_start", message: `Start node not found: ${input.storyGraph.startNodeId}` });
  }

  if (!input.storyGraph.nodes.some((node) => node.type === "ending")) {
    errors.push({ code: "missing_ending", message: "At least one ending node is required." });
  }

  input.storyGraph.nodes.forEach((node) => {
    node.choices.forEach((choice) => {
      if (!nodeIds.has(choice.nextNodeId)) {
        errors.push({
          code: "missing_choice_target",
          message: `Choice target not found: ${choice.nextNodeId}`,
          nodeId: node.id
        });
      }

      choice.effects.forEach((effect) => {
        if (!variableNames.has(effect.var)) {
          errors.push({
            code: "undefined_variable",
            message: `Choice effect references undefined variable: ${effect.var}`,
            nodeId: node.id
          });
        }
      });
    });

    if (node.backgroundAssetId) {
      requireAcceptedAsset(errors, assetsById, node.backgroundAssetId, node.id);
    }
  });

  input.characters.forEach((character) => {
    if (character.defaultAssetId) {
      requireAcceptedAsset(errors, assetsById, character.defaultAssetId);
    }
  });

  input.assets
    .filter((asset) => asset.status === "accepted")
    .forEach((asset) => {
      if (!asset.source.license || !asset.source.author) {
        errors.push({
          code: "missing_license",
          message: `Accepted asset is missing license metadata: ${asset.assetId}`,
          assetId: asset.assetId
        });
      }

      if (!publicAssetExists(asset)) {
        errors.push({
          code: "missing_asset_file",
          message: `Accepted asset file is missing from public assets: ${asset.filePath}`,
          assetId: asset.assetId
        });
      }
    });

  return { ok: errors.length === 0, errors };
}

/**
 * Finds repeated story node ids that would create invalid Ren'Py labels.
 */
function findDuplicateNodeIds(storyGraph: StoryGraph): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  storyGraph.nodes.forEach((node) => {
    if (seen.has(node.id)) {
      duplicates.add(node.id);
      return;
    }

    seen.add(node.id);
  });

  return Array.from(duplicates);
}

/**
 * Checks that an accepted library asset can be read from the Next.js public directory.
 */
function publicAssetExists(asset: AssetItem): boolean {
  const normalized = normalize(asset.filePath);

  if (normalized.startsWith("..")) {
    return false;
  }

  return existsSync(join(process.cwd(), "public", normalized));
}

/**
 * Adds a build check error when an expected asset is unavailable or not accepted.
 */
function requireAcceptedAsset(
  errors: BuildCheckError[],
  assetsById: Map<string, AssetItem>,
  assetId: string,
  nodeId?: string
): void {
  const asset = assetsById.get(assetId);

  if (!asset || asset.status !== "accepted") {
    errors.push({
      code: "missing_asset",
      message: `Required asset is missing or not accepted: ${assetId}`,
      nodeId,
      assetId
    });
  }
}
