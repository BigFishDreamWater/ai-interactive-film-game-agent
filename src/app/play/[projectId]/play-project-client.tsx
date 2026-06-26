"use client";

import Link from "next/link";
import type { ProjectSnapshot } from "@/lib/project-store";
import { PreviewPlayer } from "@/app/preview-player";

interface PlayProjectClientProps {
  snapshot: ProjectSnapshot;
}

/**
 * Renders a standalone web-playable project page for players, separate from the editor/export workflow.
 */
export function PlayProjectClient({ snapshot }: PlayProjectClientProps) {
  return (
    <main className="play-shell cinematic-play-shell" aria-label="Cinematic playable project">
      <header className="play-header cinematic-play-header">
        <div>
          <p className="eyebrow">Player Cut</p>
          <h1>{snapshot.project.title}</h1>
          <p className="play-subtitle">Browser-native cinematic dialogue preview</p>
        </div>
        <Link className="secondary-link" href="/">
          Back to editor
        </Link>
      </header>
      <PreviewPlayer assets={snapshot.assets} characters={snapshot.characters} storyGraph={snapshot.storyGraph} />
    </main>
  );
}
