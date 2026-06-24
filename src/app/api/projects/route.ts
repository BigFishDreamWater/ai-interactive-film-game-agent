import { NextResponse } from "next/server";
import { createProject } from "@/lib/project-store";

/**
 * Creates a new draft project from the posted brief payload.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const project = createProject({
    title: String(body.title ?? ""),
    genre: String(body.genre ?? ""),
    style: String(body.style ?? ""),
    brief: String(body.brief ?? "")
  });

  return NextResponse.json({ project });
}
