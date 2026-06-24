import { NextResponse } from "next/server";
import { replaceProjectAsset } from "@/lib/project-store";

interface AssetReplaceRouteContext {
  params: Promise<{ projectId: string; assetId: string }>;
}

/**
 * Replaces a project asset with a selected built-in library asset.
 */
export async function POST(request: Request, context: AssetReplaceRouteContext) {
  const { projectId, assetId } = await context.params;
  const body = await request.json();
  const asset = replaceProjectAsset(projectId, assetId, body.libraryAssetId ? String(body.libraryAssetId) : undefined);

  return NextResponse.json({ asset });
}
