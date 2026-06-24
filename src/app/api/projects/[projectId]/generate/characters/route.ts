import { NextResponse } from "next/server";
import { generateProjectCharacters } from "@/lib/project-store";

interface GenerateRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Generates the project's MVP character cards.
 */
export async function POST(_request: Request, context: GenerateRouteContext) {
  const { projectId } = await context.params;
  const characters = generateProjectCharacters(projectId);

  return NextResponse.json({ characters });
}
