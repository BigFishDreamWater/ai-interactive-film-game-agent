"use client";

import { useState } from "react";
import type { AssetItem, CharacterCard, GameDesignSpec, Project, StoryGraph } from "@/domain/types";
import { PreviewPlayer } from "@/app/preview-player";
import type { BuildCheckReport } from "@/lib/build-check";

interface WorkspaceSnapshot {
  project?: Project;
  design?: GameDesignSpec;
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
  assets: AssetItem[];
  buildReport?: BuildCheckReport;
}

const initialSnapshot: WorkspaceSnapshot = {
  characters: [],
  assets: []
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

    setSnapshot({ project: data.project, characters: [], assets: [] });
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

  /**
   * Runs an asset action endpoint and updates the local asset manifest.
   */
  async function updateAsset(assetId: string, action: "accept" | "cancel" | "replace") {
    if (!snapshot.project) {
      return;
    }

    const requestInit: RequestInit =
      action === "replace"
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
        : { method: "POST" };
    const response = await fetch(`/api/projects/${snapshot.project.id}/assets/${assetId}/${action}`, requestInit);
    const data = (await response.json()) as { asset: AssetItem };

    setSnapshot((current) => ({
      ...current,
      assets: current.assets.map((asset) => (asset.assetId === assetId ? data.asset : asset))
    }));
  }

  /**
   * Runs the server-side static build check for the current project.
   */
  async function runBuildCheckAction() {
    if (!snapshot.project) {
      setMessage("请先创建项目。");
      return;
    }

    const response = await fetch(`/api/projects/${snapshot.project.id}/build/check`, { method: "POST" });
    const data = (await response.json()) as { report: BuildCheckReport };

    setSnapshot((current) => ({ ...current, buildReport: data.report }));
    setMessage(data.report.ok ? "静态检查通过。" : "静态检查发现问题。");
  }

  /**
   * Requests a Ren'Py zip export and opens it in a new browser download.
   */
  async function exportRenPy() {
    if (!snapshot.project) {
      setMessage("请先创建项目。");
      return;
    }

    const response = await fetch(`/api/projects/${snapshot.project.id}/export/renpy`, { method: "POST" });

    if (!response.ok) {
      setMessage("导出失败，请先通过静态检查。");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${snapshot.project.id}-renpy.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Ren'Py 导出包已生成。");
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
          <button type="button" onClick={() => runGeneration<AssetItem[]>("generate/assets", "assets")}>
            Generate Assets
          </button>
          <button type="button" onClick={runBuildCheckAction}>
            Build Check
          </button>
          <button type="button" onClick={exportRenPy}>
            Export Ren&apos;Py
          </button>
        </div>
        <div className="asset-list">
          {snapshot.assets.map((asset) => (
            <article className="asset-card" key={asset.assetId}>
              <strong>{asset.title}</strong>
              <span>{asset.type}</span>
              <span>{asset.status}</span>
              <small>{asset.source.license}</small>
              <div className="button-row">
                <button type="button" onClick={() => updateAsset(asset.assetId, "accept")}>
                  Accept
                </button>
                <button type="button" onClick={() => updateAsset(asset.assetId, "cancel")}>
                  Cancel
                </button>
                <button type="button" onClick={() => updateAsset(asset.assetId, "replace")}>
                  Replace
                </button>
              </div>
            </article>
          ))}
        </div>
        {snapshot.buildReport ? (
          <div className="build-report">
            <strong>{snapshot.buildReport.ok ? "检查通过" : "检查失败"}</strong>
            <ul>
              {snapshot.buildReport.errors.map((error) => (
                <li key={`${error.code}-${error.nodeId ?? ""}-${error.assetId ?? ""}`}>{error.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <PreviewPlayer assets={snapshot.assets} characters={snapshot.characters} storyGraph={snapshot.storyGraph} />
      </section>
    </div>
  );
}
