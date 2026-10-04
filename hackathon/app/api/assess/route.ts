import { jsonComplete } from "@/lib/llm";
import { mockAssess } from "@/lib/mock";
import { assessPrompt, DIMENSION_KEYS } from "@/lib/prompts";
import type { Assessment, GeneratedCV, JobTarget } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssessBody = { cv?: GeneratedCV; job?: JobTarget };

function isUsable(a: unknown): a is Assessment {
  if (!a || typeof a !== "object") return false;
  const x = a as Partial<Assessment>;
  return (
    typeof x.overall === "number" &&
    Array.isArray(x.dimensions) &&
    x.dimensions.length > 0
  );
}

/** Ensure all six canonical dimensions exist, filling gaps from the mean. */
function normalize(a: Assessment): Assessment {
  const byKey = new Map(a.dimensions.map((d) => [d.key, d]));
  const dimensions = DIMENSION_KEYS.map(({ key, label }) => {
    const found = byKey.get(key as string);
    return {
      key: key as string,
      label: found?.label || label,
      score: typeof found?.score === "number" ? Math.round(found.score) : a.overall,
      note: found?.note || "",
    };
  });
  return {
    overall: Math.round(a.overall),
    verdict: a.verdict || "",
    dimensions,
    matchedKeywords: Array.isArray(a.matchedKeywords) ? a.matchedKeywords : [],
    missingKeywords: Array.isArray(a.missingKeywords) ? a.missingKeywords : [],
    suggestions: Array.isArray(a.suggestions) ? a.suggestions : [],
  };
}

export async function POST(request: Request) {
  let body: AssessBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const cv = body.cv;
  const job = body.job || { title: "", company: "", url: "", description: "" };
  if (!cv) return Response.json({ error: "cv is required" }, { status: 400 });

  try {
    const { system, user } = assessPrompt({ cv, job });
    const { data, provider, model } = await jsonComplete<Assessment>(system, user, {
      maxTokens: 2600,
    });
    if (!isUsable(data)) throw new Error("model returned an unusable assessment");
    return Response.json({ assessment: normalize(data), provider, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({
      assessment: mockAssess({ cv, job }),
      provider: "mock",
      model: "deterministic",
      warning: message,
    });
  }
}
