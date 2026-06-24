import { NextResponse } from "next/server";
import { cancelProjectAsset } from "@/lib/project-store";

interface AssetActionRouteContext {
  params: Promise<{ projectId: string; assetId: string }>;
}

/**
 * Cancels a project asset so build checks can flag it as missing.
 */
export async function POST(_request: Request, context: AssetActionRouteContext) {
  const { projectId, assetId } = await context.params;
  const asset = cancelProjectAsset(projectId, assetId);

  return NextResponse.json({ asset });
}
