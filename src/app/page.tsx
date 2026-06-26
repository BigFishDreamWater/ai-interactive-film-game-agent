import { WorkspaceClient } from "@/app/workspace-client";

/**
 * Renders the MVP landing workspace for the cinematic dialogue game creator.
 */
export default function HomePage() {
  return (
    <main className="workspace-shell production-console" aria-label="Noir Production Console">
      <section className="workspace-hero console-topbar">
        <div>
          <p className="eyebrow">Noir Production Console</p>
          <h1>AI 影视对话游戏制作台</h1>
        </div>
        <p className="lede">从一句故事 brief 开始，和设计 agent 对话，生成剧情图、角色卡、网页试玩和 Ren&apos;Py 导出包。</p>
      </section>
      <WorkspaceClient />
    </main>
  );
}
