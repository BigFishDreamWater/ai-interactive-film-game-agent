import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("home page", () => {
  it("renders the MVP creation workspace title", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "AI 影视对话游戏制作台" })).toBeInTheDocument();
  });
});
