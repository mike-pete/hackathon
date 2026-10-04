import { jsonComplete } from "@/lib/llm";
import { mockGenerate } from "@/lib/mock";
import { generatePrompt } from "@/lib/prompts";
import type { BigCVBullet, GeneratedCV, JobTarget } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateBody = {
  bullets?: BigCVBullet[];
  job?: JobTarget;
  intent?: string;
  verbatimness?: number;
  plan?: string[];
  research?: string | null;
};

function isUsableCV(cv: unknown): cv is GeneratedCV {
  if (!cv || typeof cv !== "object") return false;
  const c = cv as Partial<GeneratedCV>;
  return (
    typeof c.headline === "string" &&
    typeof c.summary === "string" &&
    Array.isArray(c.bullets) &&
    c.bullets.length > 0
  );
}

function normalize(cv: GeneratedCV, sourceBullets: BigCVBullet[], verbatimness: number): GeneratedCV {
  const sourceById = new Map(sourceBullets.map((bullet) => [bullet.id, bullet.text.trim()]));
  const clampedVerbatimness = Math.max(0, Math.min(100, Math.round(verbatimness)));
  const normalizedBullets = (cv.bullets || []).slice(0, 12).map((b, i) => ({
    id: b.id || `g${i + 1}`,
    text: String(b.text || "").trim(),
    evidenceId: b.evidenceId ?? null,
    rationale: String(b.rationale || "").trim(),
    keywords: Array.isArray(b.keywords) ? b.keywords.slice(0, 8) : [],
  }));
  const eligible = normalizedBullets.filter(
    (bullet) => bullet.evidenceId && sourceById.has(bullet.evidenceId),
  );
  const verbatimCount = Math.round((eligible.length * clampedVerbatimness) / 100);

  // The prompt tells the model how much wording to retain; this makes the
  // requested percentage reliable even if the model drifts from the instruction.
  eligible.slice(0, verbatimCount).forEach((bullet) => {
    bullet.text = sourceById.get(bullet.evidenceId!)!;
  });

  return {
    headline: cv.headline || "Tailored CV",
    summary: cv.summary || "",
    skills: Array.isArray(cv.skills) ? cv.skills.slice(0, 16) : [],
    bullets: normalizedBullets,
    coverNote: cv.coverNote || "",
  };
}

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const bullets = (body.bullets || []).filter((b) => b.selected);
  const job = body.job || { title: "", company: "", url: "", description: "" };
  const verbatimness = Math.max(0, Math.min(100, Math.round(body.verbatimness ?? 0)));
  const fallback = () =>
    mockGenerate({ bullets, job, intent: body.intent || "" });

  try {
    const { system, user } = generatePrompt({
      bullets,
      job,
      intent: body.intent || "",
      verbatimness,
      plan: body.plan || ["cv_generate", "cv_assess"],
      research: body.research,
    });
    const { data, provider, model } = await jsonComplete<GeneratedCV>(
      system,
      user,
      { maxTokens: 4000 },
    );
    if (!isUsableCV(data)) throw new Error("model returned an unusable CV shape");
    return Response.json({ cv: normalize(data, bullets, verbatimness), provider, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({
      cv: normalize(fallback(), bullets, verbatimness),
      provider: "mock",
      model: "deterministic",
      warning: message,
    });
  }
}
