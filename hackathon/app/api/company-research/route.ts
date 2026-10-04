import { chatComplete } from "@/lib/llm";
import type { JobTarget } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResearchBody = { job?: JobTarget; intent?: string };

/**
 * Grounds the tailoring in the actual company/role.
 * Uses Exa when EXA_API_KEY is present, otherwise falls back to the LLM's
 * own knowledge of the role (clearly labelled), or a deterministic stub.
 */
export async function POST(request: Request) {
  let body: ResearchBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const job = body.job || { title: "", company: "", url: "", description: "" };
  const query =
    `${job.company || "the company"} ${job.title || "role"} engineering` ||
    "company engineering role";

  // 1. Exa
  if (process.env.EXA_API_KEY) {
    try {
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.EXA_API_KEY,
        },
        body: JSON.stringify({
          query,
          numResults: 4,
          contents: { text: { maxCharacters: 400 } },
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{ title?: string; url?: string; text?: string }>;
        };
        const findings = (data.results || [])
          .map((r, i) => `${i + 1}. ${r.title || r.url}\n${(r.text || "").trim()}`)
          .join("\n\n");
        if (findings) {
          return Response.json({ findings, provider: "exa" });
        }
      }
    } catch {
      // fall through to LLM
    }
  }

  // 2. LLM knowledge brief (labelled).
  try {
    const { text, provider, model } = await chatComplete(
      "You are a concise research analyst. Write a short plain-text brief (max 120 words) on the company and what its engineering team likely works on. If unsure, say so. No markdown.",
      `Company: ${job.company || "unknown"}\nRole: ${job.title || "unknown"}\nJob description:\n${job.description || "(none)"}`,
      { maxTokens: 400 },
    );
    if (text) {
      return Response.json({
        findings: text,
        provider: `${provider}-knowledge`,
        model,
      });
    }
  } catch {
    // fall through
  }

  // 3. Stub
  return Response.json({
    findings:
      "No research provider configured. Set EXA_API_KEY for live company research, or load a local model. The investigation step ran but produced no external data.",
    provider: "unavailable",
  });
}
