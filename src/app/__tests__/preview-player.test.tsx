import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PreviewPlayer } from "@/app/preview-player";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets } from "@/lib/asset-planner";
import { createProjectFromBrief } from "@/lib/project-factory";

describe("preview player", () => {
  it("renders accepted background and character sprites as images", () => {
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

    render(<PreviewPlayer assets={assets} characters={characters} storyGraph={storyGraph} />);

    expect(screen.getByRole("region", { name: "Scene Monitor" })).toBeInTheDocument();
    expect(screen.getByText("Scene Monitor")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Rainy Cafe" })).toHaveAttribute(
      "src",
      "/library/backgrounds/cafe-rain.svg"
    );
    expect(screen.getByRole("img", { name: "Lina" })).toHaveAttribute("src", "/library/characters/lina-neutral.svg");
  });

  it("activates the scene monitor when a story graph arrives after the empty state", async () => {
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
    const { rerender } = render(<PreviewPlayer assets={[]} characters={[]} />);

    rerender(<PreviewPlayer assets={assets} characters={characters} storyGraph={storyGraph} />);

    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Rainy Cafe" })).toBeInTheDocument();
    });
  });
});
