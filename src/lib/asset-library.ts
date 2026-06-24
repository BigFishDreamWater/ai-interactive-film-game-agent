import type { AssetItem, AssetType } from "@/domain/types";
import assetLibrary from "@/data/asset-library.json";

export const builtInAssetLibrary = assetLibrary as AssetItem[];

/**
 * Lists built-in library assets, optionally restricted to one asset type.
 */
export function listLibraryAssets(type?: AssetType): AssetItem[] {
  if (!type) {
    return builtInAssetLibrary;
  }

  return builtInAssetLibrary.filter((asset) => asset.type === type);
}

/**
 * Finds one built-in library asset by its stable asset identifier.
 */
export function findLibraryAsset(assetId: string): AssetItem | undefined {
  return builtInAssetLibrary.find((asset) => asset.assetId === assetId);
}
