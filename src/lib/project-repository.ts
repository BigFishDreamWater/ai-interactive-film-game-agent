import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ProjectSnapshot } from "@/lib/project-store";

const defaultStorePath = join(/*turbopackIgnore: true*/ process.cwd(), "storage", "projects.json");

/**
 * Resolves the absolute file path used for persisted project snapshots.
 */
export function resolveProjectStorePath(): string {
  return process.env.PROJECT_STORE_PATH || defaultStorePath;
}

/**
 * Loads persisted project snapshots from disk, or returns an empty list if none exist yet.
 */
export function loadProjectSnapshots(): ProjectSnapshot[] {
  const storePath = resolveProjectStorePath();

  if (!existsSync(/*turbopackIgnore: true*/ storePath)) {
    return [];
  }

  const raw = readFileSync(/*turbopackIgnore: true*/ storePath, "utf8").trim();

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as ProjectSnapshot[];

  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Saves the full project snapshot list to disk in a human-readable JSON format.
 */
export function saveProjectSnapshots(snapshots: ProjectSnapshot[]): void {
  const storePath = resolveProjectStorePath();
  const folder = dirname(storePath);

  mkdirSync(folder, { recursive: true });
  writeFileSync(/*turbopackIgnore: true*/ storePath, `${JSON.stringify(snapshots, null, 2)}\n`, "utf8");
}
