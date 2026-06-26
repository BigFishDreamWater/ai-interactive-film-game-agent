import { useState } from "react";
import type { AssetItem } from "@/domain/types";
import { listLibraryAssets } from "@/lib/asset-library";

interface AssetReplacementSelectProps {
  asset: AssetItem;
  onReplace: (assetId: string, libraryAssetId: string) => void;
}

/**
 * Renders an explicit same-type library replacement picker for one asset card.
 */
export function AssetReplacementSelect({ asset, onReplace }: AssetReplacementSelectProps) {
  const candidates = listLibraryAssets(asset.type).filter((candidate) => candidate.assetId !== asset.assetId);
  const [libraryAssetId, setLibraryAssetId] = useState(candidates[0]?.assetId ?? "");

  if (candidates.length === 0) {
    return <p className="muted">No replacements available.</p>;
  }

  return (
    <div className="asset-replacement">
      <label>
        {`Replacement for ${asset.title}`}
        <select value={libraryAssetId} onChange={(event) => setLibraryAssetId(event.target.value)}>
          {candidates.map((candidate) => (
            <option value={candidate.assetId} key={candidate.assetId}>
              {candidate.title}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => onReplace(asset.assetId, libraryAssetId)}>
        {`Replace ${asset.title}`}
      </button>
    </div>
  );
}
