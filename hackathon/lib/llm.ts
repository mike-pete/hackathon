import type { ProviderStatus } from "./types";

/**
 * Minimal OpenAI-compatible chat client.
 *
 * Resolution order:
 *   1. Explicit env override (LLM_BASE_URL / LLM_API_KEY / LLM_MODEL).
 *   2. Local LM Studio (http://127.0.0.1:1234/v1) - no key, fully offline.
 *   3. OpenCode Zen gateway (OPENCODE_API_KEY).
 * If every provider fails, callers fall back to the deterministic mock.
 */

type Resolved = {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: string;
};

let cached: Resolved | null = null;

const LM_BASE = process.env.LLM_BASE_URL || "http://127.0.0.1:1234/v1";
const LM_KEY = process.env.LLM_API_KEY || "lmstudio";
const LM_MODEL = process.env.LLM_MODEL || "";
const OPENCODE_BASE = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1";
const OPENCODE_MODEL = process.env.OPENCODE_MODEL || "gpt-5.5";

async function listLmStudioModels(): Promise<string[]> {
  const res = await fetch(`${LM_BASE}/models`, {
    signal: AbortSignal.timeout(1500),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: Array<{ id: string }> };
  return (data.data || [])
    .map((m) => m.id)
    .filter((id) => !/embed/i.test(id));
}

export async function resolveProvider(): Promise<Resolved | null> {
  if (cached) return cached;

  // Explicit override wins.
  if (process.env.LLM_BASE_URL && LM_MODEL) {
    cached = {
      baseUrl: LM_BASE,
      apiKey: LM_KEY,
      model: LM_MODEL,
      provider: "lmstudio",
    };
    return cached;
  }

  // Local LM Studio.
  try {
    const models = await listLmStudioModels();
    const model = LM_MODEL || models[0];
    if (model) {
      cached = { baseUrl: LM_BASE, apiKey: LM_KEY, model, provider: "lmstudio" };
      return cached;
    }
  } catch {
    // LM Studio not running.
  }

  // OpenCode Zen gateway.
  if (process.env.OPENCODE_API_KEY) {
    cached = {
      baseUrl: OPENCODE_BASE,
      apiKey: process.env.OPENCODE_API_KEY,
      model: OPENCODE_MODEL,
      provider: "opencode",
    };
    return cached;
  }

  return null;
}

export async function chatComplete(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<{ text: string; provider: string; model: string }> {
  const provider = await resolveProvider();
  if (!provider) throw new Error("No LLM provider is configured");

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 2400,
      stream: false,
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `${provider.provider} ${res.status}: ${body.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: { content?: string | null; reasoning_content?: string | null };
    }>;
  };
  const msg = data.choices?.[0]?.message;
  // Reasoning models may leave `content` empty and put everything in
  // `reasoning_content`; fall back to whichever has the answer.
  const text = (msg?.content || "").trim() || (msg?.reasoning_content || "").trim();
  return { text, provider: provider.provider, model: provider.model };
}

/** Extract the first balanced JSON object/array from arbitrary text. */
export function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to brace scanning
  }

  for (const [open, close] of [
    ["{", "}"],
    ["[", "]"],
  ] as const) {
    const start = cleaned.indexOf(open);
    if (start === -1) continue;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(cleaned.slice(start, i + 1));
          } catch {
            break;
          }
        }
      }
    }
  }

  throw new Error("Model did not return parseable JSON");
}

export async function jsonComplete<T>(
  system: string,
  user: string,
  opts: { maxTokens?: number } = {},
): Promise<{ data: T; provider: string; model: string }> {
  const { text, provider, model } = await chatComplete(system, user, {
    maxTokens: opts.maxTokens ?? 2600,
  });
  const data = extractJson(text) as T;
  return { data, provider, model };
}

export async function llmHealth(): Promise<ProviderStatus["llm"]> {
  const provider = await resolveProvider();
  if (!provider) {
    return {
      available: false,
      provider: "none",
      model: "-",
      endpoint: "-",
      detail: "no provider configured; using deterministic mock",
    };
  }
  try {
    if (provider.provider === "lmstudio") {
      const models = await listLmStudioModels();
      const ok = models.includes(provider.model);
      return {
        available: ok,
        provider: provider.provider,
        model: provider.model,
        endpoint: provider.baseUrl,
        detail: ok ? "local model loaded" : "model not loaded",
      };
    }
    return {
      available: true,
      provider: provider.provider,
      model: provider.model,
      endpoint: provider.baseUrl,
      detail: "configured",
    };
  } catch {
    return {
      available: false,
      provider: provider.provider,
      model: provider.model,
      endpoint: provider.baseUrl,
      detail: "unreachable; using deterministic mock",
    };
  }
}
