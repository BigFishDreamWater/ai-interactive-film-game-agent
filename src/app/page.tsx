import { WorkspaceClient } from "@/app/workspace-client";

/**
 * Renders the Cineverse-themed MVP workspace with a dark navigation bar and status footer.
 */
export default function HomePage() {
  return (
    <main className="workspace-shell production-console" aria-label="Noir Production Console">
      <nav className="cine-nav">
        <div className="nav-brand">
          <span className="nav-icon">C</span>
          <div className="nav-title">
            <p className="eyebrow">Noir Production Console</p>
            <h1>AI 影视对话游戏制作台</h1>
          </div>
        </div>
        <div className="nav-menu">
          <button type="button" className="nav-menu-item nav-menu-item-active">Home</button>
          <button type="button" className="nav-menu-item">Projects</button>
          <button type="button" className="nav-menu-item">Agents</button>
          <button type="button" className="nav-menu-item">Library</button>
          <button type="button" className="nav-menu-item">Settings</button>
        </div>
      </nav>
      <WorkspaceClient />
      <div className="status-bar">
        <span className="status-bar-item">
          <span className="status-dot" />
          Agent ready
        </span>
        <span className="status-bar-item">
          <span className="status-dot status-dot-live" />
          Workspace connected
        </span>
      </div>
    </main>
  );
}
