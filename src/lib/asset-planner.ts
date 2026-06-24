import type { AssetItem, CharacterCard, StoryGraph } from "@/domain/types";
import { findLibraryAsset, listLibraryAssets } from "@/lib/asset-library";

/**
 * Builds an accepted MVP asset manifest from story scene backgrounds and character sprites.
 */
export function planProjectAssets(storyGraph: StoryGraph, characters: CharacterCard[]): AssetItem[] {
  const requiredAssetIds = new Set<string>();

  storyGraph.nodes.forEach((node) => {
    if (node.backgroundAssetId) {
      requiredAssetIds.add(node.backgroundAssetId);
    }
  });

  characters.forEach((character) => {
    if (character.defaultAssetId) {
      requiredAssetIds.add(character.defaultAssetId);
    }
  });

  requiredAssetIds.add("ui_textbox_default");

  return Array.from(requiredAssetIds)
    .map((assetId) => findLibraryAsset(assetId))
    .filter((asset): asset is AssetItem => Boolean(asset))
    .map((asset) => ({ ...asset, status: "accepted" }));
}

/**
 * Returns a copy of one manifest asset updated with replacement file and license metadata.
 */
export function replaceAssetFromLibrary(currentAsset: AssetItem, libraryAssetId: string): AssetItem {
  const replacement = findLibraryAsset(libraryAssetId);

  if (!replacement) {
    throw new Error(`Replacement asset not found: ${libraryAssetId}`);
  }

  return {
    ...currentAsset,
    filePath: replacement.filePath,
    previewUrl: replacement.previewUrl,
    title: replacement.title,
    source: replacement.source,
    tags: replacement.tags,
    status: "accepted"
  };
}

/**
 * Picks a same-type built-in library asset that can replace a cancelled or missing asset.
 */
export function suggestReplacementLibraryAssetId(currentAsset: AssetItem): string | undefined {
  return listLibraryAssets(currentAsset.type).find((asset) => asset.assetId !== currentAsset.assetId)?.assetId;
}
