import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { runBuildCheck } from "@/lib/build-check";
import { getProjectSnapshot } from "@/lib/project-store";
import { buildRenPyProjectFiles } from "@/lib/renpy-exporter";

interface RenPyExportRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Builds a Ren'Py zip archive for projects that pass static checks.
 */
export async function POST(_request: Request, context: RenPyExportRouteContext) {
  const { projectId } = await context.params;
  const snapshot = getProjectSnapshot(projectId);

  if (!snapshot || !snapshot.storyGraph) {
    return NextResponse.json({ error: "Project is not ready for export" }, { status: 400 });
  }

  const report = runBuildCheck({
    storyGraph: snapshot.storyGraph,
    characters: snapshot.characters,
    assets: snapshot.assets
  });

  if (!report.ok) {
    return NextResponse.json({ report }, { status: 400 });
  }

  const zip = new AdmZip();
  const files = buildRenPyProjectFiles({
    project: snapshot.project,
    storyGraph: snapshot.storyGraph,
    characters: snapshot.characters,
    assets: snapshot.assets
  });

  files.forEach((file) => zip.addFile(file.path, Buffer.from(file.content, "utf8")));

  return new NextResponse(zip.toBuffer(), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${snapshot.project.id}-renpy.zip"`
    }
  });
}
