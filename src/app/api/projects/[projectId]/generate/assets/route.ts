import { NextResponse } from "next/server";
import { generateProjectAssets } from "@/lib/project-store";

interface GenerateAssetsRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Generates the accepted MVP asset manifest for the project.
 */
export async function POST(_request: Request, context: GenerateAssetsRouteContext) {
  const { projectId } = await context.params;
  const assets = generateProjectAssets(projectId);

  return NextResponse.json({ assets });
}
