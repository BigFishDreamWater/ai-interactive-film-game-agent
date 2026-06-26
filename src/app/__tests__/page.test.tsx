import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

describe("home page", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the MVP creation workspace title", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "AI 影视对话游戏制作台" })).toBeInTheDocument();
  });

  it("renders the noir production console structure", () => {
    const { container } = render(<HomePage />);

    expect(screen.getByRole("main", { name: "Noir Production Console" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Design Chat" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Scene Monitor" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Production Stack" })).toBeInTheDocument();
    expect(container.querySelector(".production-console")).toBeInTheDocument();
  });

  it("runs the Pi Agent workflow and exposes a browser-playable link", async () => {
    const project = {
      id: "project_rain_cafe",
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case.",
      status: "draft" as const,
      createdAt: "2026-06-25T00:00:00.000Z"
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: async () => ({ project }) })
      .mockResolvedValueOnce({
        json: async () => ({
          snapshot: {
            project,
            design: {
              projectId: project.id,
              genre: project.genre,
              sceneCount: 6,
              characterCount: 3,
              endingCount: 2,
              contentBoundary: "All ages."
            },
            characters: [],
            storyGraph: {
              projectId: project.id,
              startNodeId: "scene_start",
              variables: [],
              nodes: [
                {
                  id: "scene_start",
                  type: "ending",
                  title: "Start",
                  characters: [],
                  objective: "Preview the web build.",
                  beats: [{ speaker: "player", text: "Ready." }],
                  choices: []
                }
              ]
            },
            assets: [],
            plannerTrace: {
              provider: "deepseek",
              model: "deepseek-v4-flash",
              steps: ["design", "characters", "story", "assets"],
              rationale: "Mystery projects need the full chain."
            },
            agentTrace: [{ toolName: "design.generate", toolCallId: "local-pi-tool-1", status: "completed" }]
          }
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Run Pi Agent" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Play in Browser" })).toHaveAttribute(
        "href",
        "/play/project_rain_cafe"
      );
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/projects/project_rain_cafe/generate/all", { method: "POST" });
    expect(screen.getByText("Pi trace: design.generate")).toBeInTheDocument();
    expect(screen.getByText("Planner: deepseek / deepseek-v4-flash")).toBeInTheDocument();
    const storyGraph = screen.getByRole("region", { name: "Story Graph" });
    expect(within(storyGraph).getByRole("heading", { name: "Story Graph" })).toBeInTheDocument();
    expect(within(storyGraph).getByText("Start")).toBeInTheDocument();
  });

  it("fills a demo brief without calling the API", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Demo B" }));

    expect(screen.getByLabelText("标题")).toHaveValue("记忆回廊学院");
    expect(screen.getByLabelText("题材")).toHaveValue("academy fantasy mystery");
    expect((screen.getByLabelText("故事 brief") as HTMLTextAreaElement).value).toContain("学生会");
  });

  it("sends the selected library asset when replacing an asset", async () => {
    const project = {
      id: "project_rain_cafe",
      title: "Rain Cafe",
      genre: "mystery",
      style: "noir",
      brief: "A reporter investigates a late-night cafe case.",
      status: "draft" as const,
      createdAt: "2026-06-25T00:00:00.000Z"
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: async () => ({ project }) })
      .mockResolvedValueOnce({
        json: async () => ({
          snapshot: {
            project,
            characters: [],
            storyGraph: undefined,
            assets: [
              {
                assetId: "bg_cafe_rain",
                type: "background",
                status: "accepted",
                title: "Rainy Cafe",
                filePath: "library/backgrounds/cafe-rain.svg",
                previewUrl: "/library/backgrounds/cafe-rain.svg",
                source: {
                  kind: "library",
                  name: "MVP Built-in CC0 Pack",
                  author: "ai-chat-reality",
                  license: "CC0",
                  sourceUrl: "local://mvp-built-in-pack",
                  commercialUse: true,
                  attributionRequired: false
                },
                tags: ["mystery"]
              }
            ],
            agentTrace: []
          }
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          asset: {
            assetId: "bg_cafe_rain",
            type: "background",
            status: "accepted",
            title: "Night Alley",
            filePath: "library/backgrounds/alley-night.svg",
            previewUrl: "/library/backgrounds/alley-night.svg",
            source: {
              kind: "library",
              name: "MVP Built-in CC0 Pack",
              author: "ai-chat-reality",
              license: "CC0",
              sourceUrl: "local://mvp-built-in-pack",
              commercialUse: true,
              attributionRequired: false
            },
            tags: ["mystery"]
          }
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Run Pi Agent" }));
    await screen.findByText("Rainy Cafe");

    fireEvent.change(screen.getByLabelText("Replacement for Rainy Cafe"), {
      target: { value: "bg_alley_night" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace Rainy Cafe" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/projects/project_rain_cafe/assets/bg_cafe_rain/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libraryAssetId: "bg_alley_night" })
    });
  });
});
