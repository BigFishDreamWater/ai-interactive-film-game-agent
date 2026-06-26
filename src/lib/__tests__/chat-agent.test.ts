import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildChatMessages,
  detectIntentFallback,
  parseChatResponse,
  runChatAgent,
  type ChatContextSummary
} from "@/lib/chat-agent";

const summary: ChatContextSummary = {
  hasDesign: true,
  sceneCount: 6,
  characterCount: 3,
  hasStory: true,
  nodeCount: 8,
  assets: [
    { assetId: "bg_cafe_rain", title: "Rainy Cafe", type: "background", status: "accepted" },
    { assetId: "bg_alley_night", title: "Night Alley", type: "background", status: "suggested" }
  ],
  buildOk: true
};

const emptySummary: ChatContextSummary = {
  hasDesign: false,
  sceneCount: 0,
  characterCount: 0,
  hasStory: false,
  nodeCount: 0,
  assets: []
};

describe("chat agent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("detects story-related intent from keywords", () => {
    const result = detectIntentFallback("帮我重新生成剧情图", summary);

    expect(result.action.type).toBe("regenerate_story");
    expect(result.provider).toBe("fallback");
    expect(result.reply).toContain("剧情");
  });

  it("detects character-related intent from keywords", () => {
    const result = detectIntentFallback("调整一下角色", summary);

    expect(result.action.type).toBe("regenerate_characters");
    expect(result.reply).toContain("角色");
  });

  it("detects asset-related intent from keywords", () => {
    const result = detectIntentFallback("素材需要更新", summary);

    expect(result.action.type).toBe("regenerate_assets");
    expect(result.reply).toContain("素材");
  });

  it("detects build-check intent from keywords", () => {
    const result = detectIntentFallback("运行构建检查", summary);

    expect(result.action.type).toBe("build_check");
    expect(result.reply).toContain("检查");
  });

  it("detects run-all intent from keywords", () => {
    const result = detectIntentFallback("一键全部重新跑", summary);

    expect(result.action.type).toBe("run_all");
    expect(result.reply).toContain("完整");
  });

  it("returns none action for unrecognised messages", () => {
    const result = detectIntentFallback("你好呀", summary);

    expect(result.action.type).toBe("none");
    expect(result.reply).toContain("生成剧情图");
  });

  it("includes the error reason when DeepSeek fails", () => {
    const result = detectIntentFallback("你好", summary, "timeout");

    expect(result.action.type).toBe("none");
    expect(result.reply).toContain("timeout");
    expect(result.provider).toBe("fallback");
  });

  it("parses valid JSON reply and action from DeepSeek", () => {
    const raw = JSON.stringify({ reply: "好的，我来调整。", action: { type: "regenerate_story" } });

    const parsed = parseChatResponse(raw, "重新生成剧情", summary);

    expect(parsed.reply).toBe("好的，我来调整。");
    expect(parsed.action.type).toBe("regenerate_story");
  });

  it("parses replace_asset action with assetId and libraryAssetId", () => {
    const raw = JSON.stringify({
      reply: "好的，我替换这个素材。",
      action: {
        type: "replace_asset",
        assetId: "bg_cafe_rain",
        libraryAssetId: "bg_alley_night"
      }
    });

    const parsed = parseChatResponse(raw, "替换背景", summary);

    expect(parsed.action.type).toBe("replace_asset");
    expect(parsed.action.assetId).toBe("bg_cafe_rain");
    expect(parsed.action.libraryAssetId).toBe("bg_alley_night");
  });

  it("normalises invalid action types to none", () => {
    const raw = JSON.stringify({ reply: "嗯。", action: { type: "delete_everything" } });

    const parsed = parseChatResponse(raw, "随便说说", summary);

    expect(parsed.action.type).toBe("none");
  });

  it("falls back to keyword detection when JSON is invalid", () => {
    const parsed = parseChatResponse("not json at all", "重新生成剧情图", summary);

    expect(parsed.action.type).toBe("regenerate_story");
  });

  it("uses a default reply when DeepSeek returns an empty reply", () => {
    const raw = JSON.stringify({ reply: "", action: { type: "none" } });

    const parsed = parseChatResponse(raw, "你好", summary);

    expect(parsed.reply.length).toBeGreaterThan(0);
    expect(parsed.action.type).toBe("none");
  });

  it("falls back when no DeepSeek key is configured", async () => {
    vi.stubEnv("deepseek_api_key", "");

    const result = await runChatAgent({ message: "重新生成剧情", summary });

    expect(result.provider).toBe("fallback");
    expect(result.action.type).toBe("regenerate_story");
  });

  it("parses DeepSeek response through runChatAgent", async () => {
    vi.stubEnv("deepseek_api_key", "test-key");
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                reply: "好的，我重新生成角色卡。",
                action: { type: "regenerate_characters" }
              })
            }
          }
        ]
      })
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await runChatAgent({
      message: "角色不够丰满",
      summary,
      history: [{ role: "user", content: "之前说了剧情太短" }]
    });

    expect(result.provider).toBe("deepseek");
    expect(result.reply).toBe("好的，我重新生成角色卡。");
    expect(result.action.type).toBe("regenerate_characters");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("falls back when DeepSeek returns an error status", async () => {
    vi.stubEnv("deepseek_api_key", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }))
    );

    const result = await runChatAgent({ message: "重新生成剧情", summary });

    expect(result.provider).toBe("fallback");
    expect(result.action.type).toBe("regenerate_story");
  });

  it("builds chat messages with system prompt and project context", () => {
    const messages = buildChatMessages({
      message: "让结局更悬疑",
      summary,
      history: [{ role: "user", content: "你好" }, { role: "assistant", content: "你好，有什么可以帮你？" }]
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("regenerate_story");
    expect(messages[1].role).toBe("user");
    expect(messages[1].content).toContain("让结局更悬疑");
    expect(messages[1].content).toContain("Rainy Cafe");
    expect(messages[1].content).toContain("你好");
  });

  it("includes empty-state context when project has no artifacts", () => {
    const messages = buildChatMessages({
      message: "帮我从头开始",
      summary: emptySummary
    });

    expect(messages[1].content).toContain("设计规格=无");
    expect(messages[1].content).toContain("素材清单：空");
    expect(messages[1].content).toContain("构建检查：未运行");
  });
});
