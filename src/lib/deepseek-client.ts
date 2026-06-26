/**
 * Shared DeepSeek chat client used by both the planner agent and the story
 * writing agents. Centralises API key resolution, base URL handling and the
 * OpenAI-compatible request shape so every agent fails over the same way.
 */

const defaultModel = "deepseek-v4-flash";
const defaultBaseUrl = "https://api.deepseek.com";

export interface DeepSeekConfig {
  apiKey?: string;
  model: string;
  baseUrl: string;
}

export interface DeepSeekChatOptions {
  temperature?: number;
  responseFormat?: "json_object" | "text";
  signal?: AbortSignal;
}

export interface DeepSeekChatResult {
  status: "ok" | "error";
  content: string;
  model: string;
  provider: "deepseek" | "fallback";
  error?: string;
}

export type DeepSeekChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

interface DeepSeekChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

/**
 * Resolves the active DeepSeek configuration from the process environment.
 */
export function resolveDeepSeekConfig(): DeepSeekConfig {
  return {
    apiKey: process.env.deepseek_api_key || process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL || defaultModel,
    baseUrl: (process.env.DEEPSEEK_BASE_URL || defaultBaseUrl).replace(/\/$/, "")
  };
}

/**
 * Returns whether a DeepSeek API key is configured for agent calls.
 */
export function hasDeepSeekApiKey(): boolean {
  return Boolean(resolveDeepSeekConfig().apiKey);
}

/**
 * Calls the OpenAI-compatible DeepSeek chat completions endpoint and returns
 * the raw assistant text. Always returns a result object (never throws) so
 * callers can branch into a deterministic fallback without try/catch noise.
 */
export async function callDeepSeekChat(
  messages: DeepSeekChatMessage[],
  options: DeepSeekChatOptions = {}
): Promise<DeepSeekChatResult> {
  const { apiKey, model, baseUrl } = resolveDeepSeekConfig();

  if (!apiKey) {
    return {
      status: "error",
      content: "",
      model,
      provider: "fallback",
      error: "Missing deepseek_api_key or DEEPSEEK_API_KEY."
    };
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: options.signal,
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.4,
        response_format: options.responseFormat === "text" ? undefined : { type: "json_object" },
        messages
      })
    });

    if (!response.ok) {
      return {
        status: "error",
        content: "",
        model,
        provider: "fallback",
        error: `DeepSeek request failed with status ${response.status}.`
      };
    }

    const data = (await response.json()) as DeepSeekChatResponse;
    const content = data.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return {
        status: "error",
        content: "",
        model,
        provider: "fallback",
        error: "DeepSeek returned an empty completion."
      };
    }

    return { status: "ok", content, model, provider: "deepseek" };
  } catch (error) {
    return {
      status: "error",
      content: "",
      model,
      provider: "fallback",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
