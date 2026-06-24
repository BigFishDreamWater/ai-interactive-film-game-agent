"use client";

import { useState } from "react";
import type { CharacterCard, GameDesignSpec, Project, StoryGraph } from "@/domain/types";

interface WorkspaceSnapshot {
  project?: Project;
  design?: GameDesignSpec;
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
}

const initialSnapshot: WorkspaceSnapshot = {
  characters: []
};

/**
 * Renders the browser-based MVP workspace for project creation and generation.
 */
export function WorkspaceClient() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(initialSnapshot);
  const [title, setTitle] = useState("雨夜咖啡馆");
  const [genre, setGenre] = useState("mystery");
  const [style, setStyle] = useState("cinematic noir anime");
  const [brief, setBrief] = useState("玩家是实习记者，在雨夜咖啡馆和一名女侦探对话，找出受害者最后见过的人。");
  const [message, setMessage] = useState("输入 brief 后创建项目。");

  /**
   * Creates a project through the API and stores the returned snapshot seed.
   */
  async function handleCreateProject() {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, style, brief })
    });
    const data = (await response.json()) as { project: Project };

    setSnapshot({ project: data.project, characters: [] });
    setMessage("项目已创建，可以生成设计规格。");
  }

  /**
   * Runs one generation endpoint and refreshes the corresponding UI state.
   */
  async function runGeneration<T>(path: string, key: keyof WorkspaceSnapshot) {
    if (!snapshot.project) {
      setMessage("请先创建项目。");
      return;
    }

    const response = await fetch(`/api/projects/${snapshot.project.id}/${path}`, { method: "POST" });
    const data = (await response.json()) as Record<string, T>;
    const value = Object.values(data)[0] as T;

    setSnapshot((current) => ({ ...current, [key]: value }));
    setMessage("生成完成。");
  }

  return (
    <div className="workspace-grid">
      <section className="panel">
        <h2>Project Brief</h2>
        <label>
          标题
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          题材
          <input value={genre} onChange={(event) => setGenre(event.target.value)} />
        </label>
        <label>
          风格
          <input value={style} onChange={(event) => setStyle(event.target.value)} />
        </label>
        <label>
          故事 brief
          <textarea value={brief} onChange={(event) => setBrief(event.target.value)} />
        </label>
        <button type="button" onClick={handleCreateProject}>
          Create Project
        </button>
        <p className="status">{message}</p>
      </section>

      <section className="panel">
        <h2>Agent 生成</h2>
        <div className="button-row">
          <button type="button" onClick={() => runGeneration<GameDesignSpec>("generate/design", "design")}>
            Generate Design
          </button>
          <button type="button" onClick={() => runGeneration<CharacterCard[]>("generate/characters", "characters")}>
            Generate Characters
          </button>
          <button type="button" onClick={() => runGeneration<StoryGraph>("generate/story", "storyGraph")}>
            Generate Story Graph
          </button>
        </div>
        <pre className="json-preview">{JSON.stringify(snapshot, null, 2)}</pre>
      </section>
    </div>
  );
}
