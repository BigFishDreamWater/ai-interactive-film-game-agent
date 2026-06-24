import { NextResponse } from "next/server";
import { getProjectSnapshot } from "@/lib/project-store";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Returns the full current project snapshot for the requested project.
 */
export async function GET(_request: Request, context: ProjectRouteContext) {
  const { projectId } = await context.params;
  const snapshot = getProjectSnapshot(projectId);

  if (!snapshot) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
