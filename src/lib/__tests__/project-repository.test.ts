import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadProjectSnapshots, saveProjectSnapshots } from "@/lib/project-repository";

describe("project repository", () => {
  const paths: string[] = [];

  afterEach(() => {
    vi.unstubAllEnvs();
    for (const dir of paths.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("saves and reloads snapshots from the configured file path", () => {
    const dir = mkdtempSync(join(tmpdir(), "ai-chat-reality-repo-"));
    paths.push(dir);
    const storePath = join(dir, "projects.json");

    vi.stubEnv("PROJECT_STORE_PATH", storePath);

    const snapshots = [
      {
        project: {
          id: "project_rain_cafe",
          title: "Rain Cafe",
          genre: "mystery",
          style: "noir",
          brief: "A reporter investigates a late-night cafe case.",
          status: "draft" as const,
          createdAt: "2026-06-25T00:00:00.000Z"
        },
        characters: [],
        assets: []
      }
    ];

    saveProjectSnapshots(snapshots);

    expect(readFileSync(storePath, "utf8")).toContain("project_rain_cafe");
    expect(loadProjectSnapshots()).toEqual(snapshots);
  });

  it("returns an empty list when the file does not exist", () => {
    const dir = mkdtempSync(join(tmpdir(), "ai-chat-reality-repo-empty-"));
    paths.push(dir);
    const storePath = join(dir, "projects.json");

    vi.stubEnv("PROJECT_STORE_PATH", storePath);

    expect(loadProjectSnapshots()).toEqual([]);
  });
});
