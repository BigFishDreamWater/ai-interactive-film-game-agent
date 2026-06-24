import { NextResponse } from "next/server";
import { generateProjectDesign } from "@/lib/project-store";

interface GenerateRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Generates the project's MVP design specification.
 */
export async function POST(_request: Request, context: GenerateRouteContext) {
  const { projectId } = await context.params;
  const design = generateProjectDesign(projectId);

  return NextResponse.json({ design });
}
