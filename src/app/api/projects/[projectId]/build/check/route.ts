import { NextResponse } from "next/server";
import { runBuildCheck } from "@/lib/build-check";
import { getProjectSnapshot } from "@/lib/project-store";

interface BuildCheckRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Runs static build checks for the current project state.
 */
export async function POST(_request: Request, context: BuildCheckRouteContext) {
  const { projectId } = await context.params;
  const snapshot = getProjectSnapshot(projectId);

  if (!snapshot) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const report = runBuildCheck({
    storyGraph: snapshot.storyGraph,
    characters: snapshot.characters,
    assets: snapshot.assets
  });

  return NextResponse.json({ report });
}
