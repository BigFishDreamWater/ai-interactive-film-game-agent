import { NextResponse } from "next/server";
import { generateProjectStory } from "@/lib/project-store";

interface GenerateRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Generates the project's MVP story graph.
 */
export async function POST(_request: Request, context: GenerateRouteContext) {
  const { projectId } = await context.params;
  const storyGraph = generateProjectStory(projectId);

  return NextResponse.json({ storyGraph });
}
