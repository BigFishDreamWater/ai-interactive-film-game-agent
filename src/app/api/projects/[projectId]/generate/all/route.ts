import { NextResponse } from "next/server";
import { runProjectAgentWorkflow } from "@/lib/project-store";

interface GenerateAllRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Runs the Pi-compatible agent workflow to generate all playable MVP artifacts.
 */
export async function POST(_request: Request, context: GenerateAllRouteContext) {
  const { projectId } = await context.params;
  const snapshot = await runProjectAgentWorkflow(projectId);

  return NextResponse.json({ snapshot });
}
