import { randomUUID } from "node:crypto";
import type { Project, ProjectBrief } from "@/domain/types";

/**
 * Creates a normalized draft project record from the user's brief input.
 */
export function createProjectFromBrief(brief: ProjectBrief, now = new Date()): Project {
  return {
    id: `proj_${randomUUID()}`,
    title: brief.title.trim(),
    genre: brief.genre.trim(),
    style: brief.style.trim(),
    brief: brief.brief.trim(),
    status: "draft",
    createdAt: now.toISOString()
  };
}
