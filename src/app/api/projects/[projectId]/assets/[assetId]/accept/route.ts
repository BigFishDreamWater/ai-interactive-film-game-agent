import { NextResponse } from "next/server";
import { acceptProjectAsset } from "@/lib/project-store";

interface AssetActionRouteContext {
  params: Promise<{ projectId: string; assetId: string }>;
}

/**
 * Accepts a project asset so preview and export can use it.
 */
export async function POST(_request: Request, context: AssetActionRouteContext) {
  const { projectId, assetId } = await context.params;
  const asset = acceptProjectAsset(projectId, assetId);

  return NextResponse.json({ asset });
}
