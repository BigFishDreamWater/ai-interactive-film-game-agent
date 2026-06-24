import { describe, expect, it } from "vitest";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("project factory", () => {
  it("creates a draft project from a brief", () => {
    const project = createProjectFromBrief(
      {
        title: " Rain Cafe Mystery ",
        genre: " mystery ",
        style: " noir ",
        brief: " A journalist investigates a rainy cafe. "
      },
      new Date("2026-06-24T10:00:00.000Z")
    );

    expect(project.id).toMatch(/^proj_/);
    expect(project.title).toBe("Rain Cafe Mystery");
    expect(project.genre).toBe("mystery");
    expect(project.status).toBe("draft");
    expect(project.createdAt).toBe("2026-06-24T10:00:00.000Z");
  });
});
