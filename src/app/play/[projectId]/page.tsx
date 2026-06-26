import { notFound } from "next/navigation";
import { getProjectSnapshot } from "@/lib/project-store";
import { PlayProjectClient } from "@/app/play/[projectId]/play-project-client";

interface PlayProjectPageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * Renders a standalone browser-playable route for one generated project.
 */
export default async function PlayProjectPage({ params }: PlayProjectPageProps) {
  const { projectId } = await params;
  const snapshot = getProjectSnapshot(projectId);

  if (!snapshot || !snapshot.storyGraph) {
    notFound();
  }

  return <PlayProjectClient snapshot={snapshot} />;
}
