/**
 * Conversational design agent for the creation workspace.
 *
 * The left rail is a chat where the user types natural language to steer the
 * project. This module asks DeepSeek to interpret the message, reply in
 * conversation, and decide which generation/build action to run. When no
 * DeepSeek key is configured it falls back to keyword-based intent detection so
 * the chat stays useful offline.
 */

import { callDeepSeekChat, hasDeepSeekApiKey, type DeepSeekChatMessage } from "@/lib/deepseek-client";

export type ChatActionType =
  | "regenerate_design"
  | "regenerate_characters"
  | "regenerate_story"
  | "regenerate_assets"
  | "run_all"
  | "build_check"
  | "replace_asset"
  | "none";

export interface ChatAction {
  type: ChatActionType;
  assetId?: string;
  libraryAssetId?: string;
}

export interface ChatAgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContextAsset {
  assetId: string;
  title: string;
  type: string;
  status: string;
}

export interface ChatContextSummary {
  hasDesign: boolean;
  sceneCount: number;
  characterCount: number;
  hasStory: boolean;
  nodeCount: number;
  assets: ChatContextAsset[];
  buildOk?: boolean;
}

export interface ChatAgentInput {
  message: string;
  summary: ChatContextSummary;
  history?: ChatAgentMessage[];
}

export interface ChatAgentResult {
  reply: string;
  action: ChatAction;
  provider: "deepseek" | "fallback";
}

const allowedActions = new Set<ChatActionType>([
  "regenerate_design",
  "regenerate_characters",
  "regenerate_story",
  "regenerate_assets",
  "run_all",
  "build_check",
  "replace_asset",
  "none"
]);

/**
 * Runs the chat agent: DeepSeek interprets the message and picks an action,
 * with a deterministic keyword fallback when the model is unavailable.
 */
export async function runChatAgent(input: ChatAgentInput): Promise<ChatAgentResult> {
  if (!hasDeepSeekApiKey()) {
    return detectIntentFallback(input.message, input.summary);
  }

  const result = await callDeepSeekChat(buildChatMessages(input), {
    temperature: 0.4,
    responseFormat: "json_object"
  });

  if (result.status !== "ok") {
    return detectIntentFallback(input.message, input.summary, result.error);
  }

  const parsed = parseChatResponse(result.content, input.message, input.summary);

  return { ...parsed, provider: "deepseek" };
}

/**
 * Parses the JSON payload returned by the chat agent, falling back to keyword
 * intent detection when the payload is invalid.
 */
export function parseChatResponse(
  raw: string,
  message: string,
  summary: ChatContextSummary
): { reply: string; action: ChatAction } {
  try {
    const value = JSON.parse(raw) as { reply?: unknown; action?: unknown };

    const reply = typeof value.reply === "string" && value.reply.length > 0 ? value.reply : "好的，我来帮你调整。";
    const action = normalizeAction(value.action);

    return { reply, action };
  } catch {
    const fallback = detectIntentFallback(message, summary);

    return { reply: fallback.reply, action: fallback.action };
  }
}

/**
 * Returns a deterministic reply + action derived from keywords in the message.
 */
export function detectIntentFallback(message: string, summary: ChatContextSummary, error?: string): ChatAgentResult {
  const text = message.toLowerCase();

  if (/(剧情|故事|分支|节点|对话|story|scene)/.test(text)) {
    return {
      reply: summary.hasStory ? "好的，我重新生成剧情图，看看新的分支走向。" : "好的，我来生成剧情图，包含场景、选项和结局。",
      action: { type: "regenerate_story" },
      provider: "fallback"
    };
  }

  if (/(角色|人物|character)/.test(text)) {
    return {
      reply: "好的，我重新生成角色卡，调整他们的动机和说话风格。",
      action: { type: "regenerate_characters" },
      provider: "fallback"
    };
  }

  if (/(素材|背景|立绘|美术|asset|sprite|background)/.test(text)) {
    return {
      reply: "好的，我重新规划素材清单，匹配当前剧情需要的背景和立绘。",
      action: { type: "regenerate_assets" },
      provider: "fallback"
    };
  }

  if (/(检查|构建|lint|build|检查|报错)/.test(text)) {
    return {
      reply: "好的，我运行一次构建检查，看看有没有缺素材或断分支。",
      action: { type: "build_check" },
      provider: "fallback"
    };
  }

  if (/(全部|一键|run all|重新跑|完整)/.test(text)) {
    return {
      reply: "好的，我跑一遍完整生成流程：设计、角色、剧情、素材。",
      action: { type: "run_all" },
      provider: "fallback"
    };
  }

  return {
    reply: error
      ? `DeepSeek 暂时不可用（${error}），我先用本地规则处理。你可以让我"生成剧情""重新生成角色""运行构建检查"。`
      : `你可以让我生成剧情图、重新生成角色或素材、运行构建检查，也可以描述想要的调整，比如"让结局更悬疑"。`,
    action: { type: "none" },
    provider: "fallback"
  };
}

/**
 * Builds the DeepSeek messages for the conversational design agent.
 */
export function buildChatMessages(input: ChatAgentInput): DeepSeekChatMessage[] {
  return [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    {
      role: "user",
      content: buildUserPrompt(input)
    }
  ];
}

/**
 * Builds the system prompt describing the agent role and available actions.
 */
function buildSystemPrompt(): string {
  return [
    "你是一个 AI 影视对话游戏制作助手，用简洁友好的中文回复。",
    "根据用户消息和当前项目状态，返回 JSON：{\"reply\": string, \"action\": {\"type\": string}}。",
    "可用的 action.type：",
    "- regenerate_design：重新生成设计规格（场景数、结局数、内容边界）",
    "- regenerate_characters：重新生成角色卡",
    "- regenerate_story：重新生成剧情图（场景、对白、分支、结局）",
    "- regenerate_assets：重新规划素材清单",
    "- run_all：跑完整生成流程",
    "- build_check：运行构建检查",
    "- replace_asset：替换素材，需附带 assetId 和 libraryAssetId",
    "- none：仅对话，不执行动作",
    "只返回 JSON，不要多余文字。reply 里说明你做了什么或建议。"
  ].join("\n");
}

/**
 * Builds the user prompt with conversation history and the current project state.
 */
function buildUserPrompt(input: ChatAgentInput): string {
  const history = (input.history ?? []).slice(-6).map((entry) => `${entry.role}: ${entry.content}`).join("\n");
  const assetList = input.summary.assets.map((asset) => `${asset.assetId} (${asset.title}, ${asset.type}, ${asset.status})`).join("; ");
  const lines = [
    `当前项目状态：设计规格=${input.summary.hasDesign ? "有" : "无"}，场景数=${input.summary.sceneCount}，角色数=${input.summary.characterCount}，剧情图=${input.summary.hasStory ? `${input.summary.nodeCount} 个节点` : "无"}，素材=${input.summary.assets.length} 个。`,
    assetList ? `素材清单：${assetList}` : "素材清单：空",
    input.summary.buildOk === undefined ? "构建检查：未运行" : `构建检查：${input.summary.buildOk ? "通过" : "未通过"}`,
    history ? `对话历史：\n${history}` : "对话历史：无",
    `用户消息：${input.message}`
  ];

  return lines.join("\n");
}

/**
 * Normalises a raw action value into a valid ChatAction.
 */
function normalizeAction(raw: unknown): ChatAction {
  if (!raw || typeof raw !== "object") {
    return { type: "none" };
  }

  const value = raw as Record<string, unknown>;
  const type = allowedActions.has(value.type as ChatActionType) ? (value.type as ChatActionType) : "none";
  const assetId = typeof value.assetId === "string" ? value.assetId : undefined;
  const libraryAssetId = typeof value.libraryAssetId === "string" ? value.libraryAssetId : undefined;

  return { type, assetId, libraryAssetId };
}
