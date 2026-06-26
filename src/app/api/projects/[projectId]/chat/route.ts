import { NextResponse } from "next/server";
import { runBuildCheck, type BuildCheckReport } from "@/lib/build-check";
import {
  generateProjectAssets,
  generateProjectCharacters,
  generateProjectDesign,
  generateProjectStory,
  getProjectSnapshot,
  replaceProjectAsset,
  runProjectAgentWorkflow,
  type ProjectSnapshot
} from "@/lib/project-store";
import { runChatAgent, type ChatAgentMessage, type ChatContextSummary } from "@/lib/chat-agent";

interface ChatRouteContext {
  params: Promise<{ projectId: string }>;
}

interface ChatRequestBody {
  message: string;
  summary: ChatContextSummary;
  history?: ChatAgentMessage[];
}

interface ChatRouteResponse {
  reply: string;
  action: { type: string; assetId?: string; libraryAssetId?: string };
  snapshot: ProjectSnapshot;
  buildReport?: BuildCheckReport;
}

/**
 * Conversational endpoint: interprets a natural-language message, picks an
 * action, executes it against the project store, and returns the reply plus
 * the refreshed snapshot.
 */
export async function POST(request: Request, context: ChatRouteContext) {
  const { projectId } = await context.params;
  const body = (await request.json()) as ChatRequestBody;

  const snapshot = getProjectSnapshot(projectId);

  if (!snapshot) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const result = await runChatAgent({
    message: body.message,
    summary: body.summary,
    history: body.history
  });

  let buildReport: BuildCheckReport | undefined;

  switch (result.action.type) {
    case "regenerate_design":
      generateProjectDesign(projectId);
      break;
    case "regenerate_characters":
      generateProjectCharacters(projectId);
      break;
    case "regenerate_story":
      generateProjectStory(projectId);
      break;
    case "regenerate_assets":
      generateProjectAssets(projectId);
      break;
    case "run_all":
      await runProjectAgentWorkflow(projectId);
      break;
    case "build_check": {
      const current = getProjectSnapshot(projectId)!;
      buildReport = runBuildCheck({
        storyGraph: current.storyGraph,
        characters: current.characters,
        assets: current.assets
      });
      break;
    }
    case "replace_asset":
      if (result.action.assetId) {
        replaceProjectAsset(projectId, result.action.assetId, result.action.libraryAssetId);
      }
      break;
    case "none":
    default:
      break;
  }

  const refreshed = getProjectSnapshot(projectId)!;
  const response: ChatRouteResponse = {
    reply: result.reply,
    action: result.action,
    snapshot: refreshed,
    ...(buildReport ? { buildReport } : {})
  };

  return NextResponse.json(response);
}
