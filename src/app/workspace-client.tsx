"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AssetItem, CharacterCard, GameDesignSpec, Project, StoryGraph } from "@/domain/types";
import { AssetReplacementSelect } from "@/app/asset-replacement-select";
import { PreviewPlayer } from "@/app/preview-player";
import { StoryGraphPanel } from "@/app/story-graph-panel";
import type { BuildCheckReport } from "@/lib/build-check";
import type { AgentPlan } from "@/lib/deepseek-planner";
import type { PiAgentTraceEvent } from "@/lib/pi-agent-orchestrator";
import type { StoryAgentResult } from "@/lib/story-agent";

interface WorkspaceSnapshot {
  project?: Project;
  design?: GameDesignSpec;
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
  assets: AssetItem[];
  buildReport?: BuildCheckReport;
  plannerTrace?: AgentPlan;
  agentTrace?: PiAgentTraceEvent[];
  storyAgent?: StoryAgentResult;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRouteResponse {
  reply: string;
  action: { type: string; assetId?: string; libraryAssetId?: string };
  snapshot: Omit<WorkspaceSnapshot, "buildReport">;
  buildReport?: BuildCheckReport;
}

const initialSnapshot: WorkspaceSnapshot = {
  characters: [],
  assets: []
};

const demoBriefs = {
  a: {
    title: "雨夜咖啡馆",
    genre: "mystery",
    style: "cinematic noir anime",
    brief: "玩家是实习记者，在雨夜咖啡馆和一名女侦探对话，找出受害者最后见过的人。"
  },
  b: {
    title: "记忆回廊学院",
    genre: "academy fantasy mystery",
    style: "cinematic magical realism",
    brief: "学生会档案室每晚都会重排记忆照片，玩家要和一名沉默的管理员对话，找回失踪同学最后留下的声音。"
  }
};

/**
 * Renders the Cineverse-themed workspace with a three-column layout, tab navigation, and status bar.
 */
export function WorkspaceClient() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(initialSnapshot);
  const [title, setTitle] = useState("雨夜咖啡馆");
  const [genre, setGenre] = useState("mystery");
  const [style, setStyle] = useState("cinematic noir anime");
  const [brief, setBrief] = useState("玩家是实习记者，在雨夜咖啡馆和一名女侦探对话，找出受害者最后见过的人。");
  const [message, setMessage] = useState("输入 brief 后创建项目。");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [briefExpanded, setBriefExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "design" | "demo">("design");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Fills the project brief form with a demo scenario without calling the backend.
   */
  function fillDemoBrief(kind: keyof typeof demoBriefs) {
    const demo = demoBriefs[kind];

    setTitle(demo.title);
    setGenre(demo.genre);
    setStyle(demo.style);
    setBrief(demo.brief);
    setMessage("Demo brief loaded. You can edit it before creating the project.");
  }

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
    setChatMessages([
      {
        role: "assistant",
        content: `项目「${data.project.title}」已创建。你可以让我生成剧情图、角色卡或素材，也可以描述想要的调整。`
      }
    ]);
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
   * Runs the Pi Agent Core workflow that generates every playable project artifact in one pass.
   */
  async function runPiAgentWorkflow() {
    if (!snapshot.project) {
      setMessage("请先创建项目。");
      return;
    }

    const response = await fetch(`/api/projects/${snapshot.project.id}/generate/all`, { method: "POST" });
    const data = (await response.json()) as { snapshot: WorkspaceSnapshot };

    setSnapshot(data.snapshot);
    setMessage("Pi Agent workflow 生成完成，可以直接网页试玩。");
  }

  /**
   * Runs an asset action endpoint and updates the local asset manifest.
   */
  async function updateAsset(assetId: string, action: "accept" | "cancel" | "replace", libraryAssetId?: string) {
    if (!snapshot.project) {
      return;
    }

    const requestInit: RequestInit =
      action === "replace"
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ libraryAssetId }) }
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

  /**
   * Builds a compact context summary for the chat agent from the current snapshot.
   */
  function buildChatSummary() {
    return {
      hasDesign: Boolean(snapshot.design),
      sceneCount: snapshot.design?.sceneCount ?? 0,
      characterCount: snapshot.characters.length,
      hasStory: Boolean(snapshot.storyGraph),
      nodeCount: snapshot.storyGraph?.nodes.length ?? 0,
      assets: snapshot.assets.map((asset) => ({
        assetId: asset.assetId,
        title: asset.title,
        type: asset.type,
        status: asset.status
      })),
      ...(snapshot.buildReport ? { buildOk: snapshot.buildReport.ok } : {})
    };
  }

  /**
   * Sends a chat message to the design agent and applies the returned action.
   */
  async function handleChatSend() {
    const text = chatInput.trim();

    if (!text || !snapshot.project || isThinking) {
      return;
    }

    const history = chatMessages.slice(-6);

    setChatMessages((current) => [...current, { role: "user", content: text }]);
    setChatInput("");
    setIsThinking(true);

    try {
      const response = await fetch(`/api/projects/${snapshot.project.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, summary: buildChatSummary(), history })
      });
      const data = (await response.json()) as ChatRouteResponse;

      setChatMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      setSnapshot((current) => ({
        ...data.snapshot,
        ...(data.buildReport ? { buildReport: data.buildReport } : { buildReport: current.buildReport })
      }));
      setMessage(data.action.type === "none" ? "对话完成。" : `已执行：${data.action.type}`);
    } catch {
      setChatMessages((current) => [
        ...current,
        { role: "assistant", content: "抱歉，出了点问题，请重试。" }
      ]);
    } finally {
      setIsThinking(false);
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  /**
   * Handles Enter key (without Shift) to send the chat message.
   */
  function handleChatKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChatSend();
    }
  }

  return (
    <div className="workspace-grid production-console-grid">
      {/* ═══ Left panel: 场景设置 ═══ */}
      <section className="console-panel brief-console chat-panel" aria-label="Design Chat">
        <div className="panel-heading">
          <h2>场景设置</h2>
          <p className="panel-subheader">配置项目参数与对话设计</p>
        </div>

        <div className="panel-tabs">
          <button
            type="button"
            className={`panel-tab${activeTab === "view" ? " panel-tab-active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            View
          </button>
          <button
            type="button"
            className={`panel-tab${activeTab === "design" ? " panel-tab-active" : ""}`}
            onClick={() => setActiveTab("design")}
          >
            Design
          </button>
          <button
            type="button"
            className={`panel-tab${activeTab === "demo" ? " panel-tab-active" : ""}`}
            onClick={() => setActiveTab("demo")}
          >
            Demo 2
          </button>
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Show all</span>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked readOnly />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Show only active</span>
          <label className="toggle-switch">
            <input type="checkbox" readOnly />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="slider-row">
          <label htmlFor="opacity-slider">Opacity</label>
          <input id="opacity-slider" type="range" min="0" max="100" defaultValue="80" />
        </div>

        <div className="toggle-row">
          <span className="toggle-label">automatically wait scene</span>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked readOnly />
            <span className="toggle-track" />
          </label>
        </div>

        <button
          type="button"
          className="chat-section-toggle"
          aria-expanded={briefExpanded}
          onClick={() => setBriefExpanded((current) => !current)}
        >
          <span>项目 Brief</span>
          <span className="chevron">▾</span>
        </button>

        {briefExpanded ? (
          <div className="brief-collapsible">
            <div className="button-row demo-switcher">
              <button type="button" onClick={() => fillDemoBrief("a")}>
                Demo A
              </button>
              <button type="button" onClick={() => fillDemoBrief("b")}>
                Demo B
              </button>
            </div>
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
          </div>
        ) : null}

        <button className="primary-action" type="button" onClick={handleCreateProject}>
          Create Project
        </button>

        <div className="chat-divider" />

        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-empty">
              {snapshot.project
                ? "和设计 agent 对话，调整剧情、角色或素材。"
                : "先创建项目，然后开始对话设计。"}
            </div>
          ) : null}
          {chatMessages.map((entry, index) => (
            <div key={index} className={`chat-message chat-message-${entry.role}`}>
              <div className="chat-bubble">{entry.content}</div>
              <span className="chat-meta">{entry.role === "user" ? "你" : "Agent"}</span>
            </div>
          ))}
          {isThinking ? (
            <div className="chat-typing">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder={snapshot.project ? "描述你想要的调整…" : "请先创建项目…"}
            rows={1}
            disabled={!snapshot.project || isThinking}
          />
          <button
            type="button"
            className="chat-send"
            onClick={handleChatSend}
            disabled={!snapshot.project || isThinking || chatInput.trim() === ""}
          >
            发送
          </button>
        </div>

        <p className="status">{message}</p>
      </section>

      {/* ═══ Center: Preview stage ═══ */}
      <div className="monitor-column center-preview-wrapper">
        <PreviewPlayer assets={snapshot.assets} characters={snapshot.characters} storyGraph={snapshot.storyGraph} />
        <div className="character-strip">
          {snapshot.characters.length === 0 ? (
            <div className="character-thumb">No characters</div>
          ) : (
            snapshot.characters.map((character) => {
              const sprite = snapshot.assets.find(
                (a) => a.assetId === character.defaultAssetId && a.status === "accepted"
              );
              return (
                <div className="character-thumb" key={character.id}>
                  {sprite ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="character-thumb-image" src={sprite.previewUrl} alt={character.name} />
                  ) : (
                    character.name
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ Right panel: Agent 管理 ═══ */}
      <section className="console-panel production-stack" aria-label="Production Stack">
        <div className="panel-heading">
          <h2>Agent 管理</h2>
          <p className="panel-subheader">生成引擎与素材管理</p>
        </div>

        <div className="button-row workflow-actions">
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
          <button className="primary-action" type="button" onClick={runPiAgentWorkflow}>
            Run Pi Agent
          </button>
          <button type="button" onClick={runBuildCheckAction}>
            Build Check
          </button>
          <button type="button" onClick={exportRenPy}>
            Export Ren&apos;Py
          </button>
          {snapshot.project && snapshot.storyGraph ? (
            <Link className="secondary-link play-link" href={`/play/${snapshot.project.id}`}>
              Play in Browser
            </Link>
          ) : null}
        </div>

        {snapshot.agentTrace?.length ? (
          <p className="agent-trace">Pi trace: {snapshot.agentTrace.map((event) => event.toolName).join(" -> ")}</p>
        ) : null}
        {snapshot.plannerTrace ? (
          <div className="planner-trace">
            <strong>{`Planner: ${snapshot.plannerTrace.provider} / ${snapshot.plannerTrace.model}`}</strong>
            <p>{snapshot.plannerTrace.rationale}</p>
          </div>
        ) : null}
        {snapshot.storyAgent ? (
          <div className="story-agent-trace">
            <strong>{`Story agents: ${snapshot.storyAgent.provider} · ${snapshot.storyAgent.iterations} revision pass(es)`}</strong>
            <p className="agent-trace">
              {snapshot.storyAgent.events.map((event) => `${event.role}(${event.provider}/${event.status})`).join(" -> ")}
            </p>
            {snapshot.storyAgent.critique ? <p>{snapshot.storyAgent.critique.summary}</p> : null}
            {snapshot.storyAgent.critique?.issues.length ? (
              <ul>
                {snapshot.storyAgent.critique.issues.map((issue, index) => (
                  <li key={`${issue.severity}-${issue.category}-${index}`}>{`[${issue.severity}/${issue.category}] ${issue.message}`}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {snapshot.buildReport ? (
          <div className="build-report">
            <strong>{snapshot.buildReport.ok ? "检查通过" : "检查失败"}</strong>
            {snapshot.buildReport.renpyLint ? (
              <p>{`Ren'Py ${snapshot.buildReport.renpyLint.mode} lint: ${
                snapshot.buildReport.renpyLint.ok ? "passed" : "failed"
              }`}</p>
            ) : null}
            <ul>
              {snapshot.buildReport.errors.map((error) => (
                <li key={`${error.code}-${error.nodeId ?? ""}-${error.assetId ?? ""}`}>{error.message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <StoryGraphPanel storyGraph={snapshot.storyGraph} />

        <div className="asset-list" aria-label="Asset Queue">
          {snapshot.assets.length === 0 ? <p className="muted">No assets staged yet.</p> : null}
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
              </div>
              <AssetReplacementSelect
                asset={asset}
                onReplace={(assetId, libraryAssetId) => updateAsset(assetId, "replace", libraryAssetId)}
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
