import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayProjectClient } from "@/app/play/[projectId]/play-project-client";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets } from "@/lib/asset-planner";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("play project page client", () => {
  it("renders a browser-playable project without requiring a Ren'Py download", () => {
    const project = createProjectFromBrief({
      title: "雨夜咖啡馆",
      genre: "mystery",
      style: "noir",
      brief: "玩家调查咖啡馆。"
    });
    const design = generateDesignSpec(project);
    const characters = generateCharacterCards(project, design);
    const storyGraph = generateStoryGraph(project, design, characters);
    const assets = planProjectAssets(storyGraph, characters);

    const { container } = render(<PlayProjectClient snapshot={{ project, design, characters, storyGraph, assets }} />);

    expect(screen.getByRole("main", { name: "Cinematic playable project" })).toBeInTheDocument();
    expect(screen.getByText("Player Cut")).toBeInTheDocument();
    expect(container.querySelector(".cinematic-play-shell")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "雨夜咖啡馆" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "拿出票根给她看。" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export Ren'Py" })).not.toBeInTheDocument();
  });
});
