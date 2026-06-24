import { describe, expect, it } from "vitest";
import { listLibraryAssets } from "@/lib/asset-library";

describe("asset library", () => {
  it("lists built-in assets with license metadata", () => {
    const assets = listLibraryAssets();

    expect(assets.length).toBeGreaterThanOrEqual(6);
    expect(assets.every((asset) => asset.source.license && asset.source.author)).toBe(true);
  });

  it("filters assets by type", () => {
    const backgrounds = listLibraryAssets("background");

    expect(backgrounds.length).toBeGreaterThan(0);
    expect(backgrounds.every((asset) => asset.type === "background")).toBe(true);
  });
});
