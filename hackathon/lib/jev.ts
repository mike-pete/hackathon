import { spawn } from "node:child_process";
import { CAPABILITIES, EXECUTABLE, toJevCandidates } from "./capabilities";
import type { JevCandidate, JevPlan, JevStep } from "./types";

/**
 * JevRouter integration.
 *
 * JevRouter (github.com/BillionsBobby/JevRouter) is a local-first capability
 * router: Jev owns the decision probabilities, JevRouter owns availability,
 * permissions, risk and confirmation. We hand it our capability manifests and
 * ask it to plan which capability handles each step of the request.
 *
 * Transport order:
 *   1. HTTP   - a running `jevrouter serve` instance (JEV_HTTP_URL), fast.
 *   2. CLI    - `npx jevrouter plan --provider demo --stdin`, works offline.
 *   3. policy - deterministic local fallback so the POC never dead-ends.
 */

const JEV_HTTP_URL = process.env.JEV_HTTP_URL || "http://127.0.0.1:8787";
const JEV_PROVIDER = process.env.JEV_PROVIDER || "demo";
const JEV_PACKAGE = "github:BillionsBobby/JevRouter";
const CLI_TIMEOUT_MS = Number(process.env.JEV_TIMEOUT_MS || 60_000);

type JevRawCandidate = {
  id?: string;
  name?: string;
  type?: string;
  jev_probability?: number | null;
  jev_confidence?: number | null;
  jev_stage?: string | null;
  router_rank?: number | null;
  router?: {
    risk_level?: string;
    requires_confirmation?: boolean;
    filtered?: boolean;
    filter_reason?: string | null;
    allowed?: boolean;
  };
};

type JevRawDecision = {
  status?: string;
  decision?: {
    question?: string;
    selected?: string | null;
    jev_choice?: string | null;
    candidates?: JevRawCandidate[];
  };
  fallback?: { type?: string; reason?: string } | null;
  provenance?: { candidate_snapshot_hash?: string; policy_hash?: string };
};

type JevRawPlan = {
  plan_id?: string;
  mode?: string;
  steps?: JevRawDecision[];
  provenance?: { candidate_snapshot_hash?: string; policy_hash?: string };
};

function normalizeCandidate(c: JevRawCandidate): JevCandidate {
  return {
    id: c.id || c.name || "unknown",
    name: c.name || c.id || "unknown",
    type: c.type || "mcp_tool",
    probability:
      typeof c.jev_probability === "number" ? c.jev_probability : null,
    confidence:
      typeof c.jev_confidence === "number" ? c.jev_confidence : null,
    rank: typeof c.router_rank === "number" ? c.router_rank : null,
    stage: c.jev_stage ?? null,
    riskLevel: c.router?.risk_level || "low",
    requiresConfirmation: Boolean(c.router?.requires_confirmation),
    filtered: Boolean(c.router?.filtered),
    filterReason: c.router?.filter_reason ?? null,
    allowed: c.router?.allowed !== false,
  };
}

/**
 * Resolve what to execute for a step. We prefer the router's own selection.
 * Under `no_decision` (confidence below policy) JevRouter leaves `selected`
 * null but still ranks candidates; we take the highest-ranked safe candidate
 * and label it as a best-effort fallback so nothing is misrepresented as a
 * confident decision.
 */
function resolveStep(stepIndex: number, raw: JevRawDecision): JevStep {
  const candidates = (raw.decision?.candidates || []).map(normalizeCandidate);
  const safe = candidates
    .filter((c) => c.allowed && !c.filtered)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  const selected = raw.decision?.selected ?? null;
  const resolved = selected ?? safe[0]?.id ?? null;

  return {
    step: stepIndex,
    question:
      raw.decision?.question ||
      `Which capability should handle step ${stepIndex}?`,
    status: raw.status || "unknown",
    jevChoice: raw.decision?.jev_choice ?? null,
    resolved,
    candidates,
    fallback: raw.fallback
      ? {
          type: raw.fallback.type || "unknown",
          reason: raw.fallback.reason || "",
        }
      : null,
  };
}

/** Derive the ordered, executable capability list from a plan. */
function deriveExecutionPlan(steps: JevStep[]): {
  executionPlan: string[];
  rationale: string;
} {
  const picked = steps
    .map((s) => s.resolved)
    .filter((id): id is string => Boolean(id) && EXECUTABLE.has(id as string));

  const unique: string[] = [];
  for (const id of picked) if (!unique.includes(id)) unique.push(id);

  const forced: string[] = [];
  if (!unique.includes("cv_generate")) forced.push("cv_generate");
  if (!unique.includes("cv_assess")) forced.push("cv_assess");

  if (forced.length) {
    unique.push(...forced);
  }

  const ORDER: Record<string, number> = {
    company_research: 0,
    cv_generate: 1,
    cv_assess: 2,
  };
  unique.sort((a, b) => (ORDER[a] ?? 9) - (ORDER[b] ?? 9));

  const lowConfidence = steps.some((s) => s.fallback?.type === "low_confidence");
  const rationale = forced.length
    ? `JevRouter planned ${picked.length} executable step(s); we ensured a full pipeline by appending ${forced.join(", ")}.`
    : lowConfidence
      ? "Jev confidence was below policy, so we used the router's top-ranked safe candidates in order."
      : "Pipeline follows the JevRouter plan directly.";

  return { executionPlan: unique, rationale };
}

function policyPlan(reason: string, error?: string): JevPlan {
  const candidates: JevCandidate[] = CAPABILITIES.map((c, i) => ({
    id: c.id,
    name: c.id,
    type: c.type,
    probability: null,
    confidence: null,
    rank: i + 1,
    stage: null,
    riskLevel: c.risk?.level ?? "low",
    requiresConfirmation: Boolean(c.policy?.requires_confirmation),
    filtered: false,
    filterReason: null,
    allowed: true,
  }));

  const steps: JevStep[] = [
    {
      step: 1,
      question: "Which capability should handle step 1?",
      status: "policy_fallback",
      jevChoice: "cv_generate",
      resolved: "cv_generate",
      candidates,
      fallback: { type: "policy", reason },
    },
  ];

  return {
    transport: "policy",
    provider: "local-policy",
    planId: null,
    mode: "fallback",
    status: "policy_fallback",
    steps,
    provenance: { candidateSnapshotHash: null, policyHash: null },
    executionPlan: ["cv_generate", "cv_assess"],
    rationale: reason,
    elapsedMs: 0,
    error,
  };
}

function runCli(
  args: string[],
  stdinJson: unknown,
  timeoutMs = CLI_TIMEOUT_MS,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["--yes", JEV_PACKAGE, ...args], {
      env: { ...process.env, JEV_PROVIDER },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`JevRouter CLI timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && !stdout.trim()) {
        reject(
          new Error(
            stderr.trim() || `JevRouter CLI exited with code ${code}`,
          ),
        );
        return;
      }
      resolve(stdout);
    });

    child.stdin.write(JSON.stringify(stdinJson));
    child.stdin.end();
  });
}

/** Try a single `route` decision over the HTTP server if one is running. */
async function tryHttpRoute(
  request: string,
  candidates: unknown,
): Promise<JevRawDecision | null> {
  try {
    const health = await fetch(`${JEV_HTTP_URL}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!health.ok) return null;
    const res = await fetch(`${JEV_HTTP_URL}/route`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ request, candidates }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as JevRawDecision;
  } catch {
    return null;
  }
}

export async function runJevPlan(opts: {
  intent: string;
  jobTitle: string;
  jobCompany: string;
  steps?: number;
}): Promise<JevPlan> {
  const started = Date.now();
  const candidates = toJevCandidates();
  const request = [
    "Help a person tailor their CV for a job and assess its quality.",
    `Intent: ${opts.intent || "tailor the CV to the role"}.`,
    opts.jobTitle ? `Target role: ${opts.jobTitle}.` : "",
    opts.jobCompany ? `Company: ${opts.jobCompany}.` : "",
    "Choose the capability for each step.",
  ]
    .filter(Boolean)
    .join(" ");

  const steps = Math.max(2, Math.min(opts.steps ?? 3, 6));
  const payload = {
    request,
    context: {
      role: opts.jobTitle,
      company: opts.jobCompany,
      has_big_cv: true,
      store: "in-memory",
    },
    candidates,
  };

  // 1. HTTP plan is not part of the router's HTTP surface, but a running
  //    server can still answer a fast single route for the first step.
  let httpStep: JevStep | null = null;
  const httpRaw = await tryHttpRoute(request, candidates);
  if (httpRaw) httpStep = resolveStep(1, httpRaw);

  // 2. CLI `plan` gives the full multi-step plan.
  try {
    const rawText = await runCli(
      [
        "plan",
        "--provider",
        JEV_PROVIDER,
        "--stdin",
        "--steps",
        String(steps),
        "--mode",
        "serial",
      ],
      payload,
    );
    const raw = JSON.parse(rawText) as JevRawPlan;
    const rawSteps = raw.steps || [];
    const normSteps = rawSteps.map((s, i) => resolveStep(i + 1, s));

    // If HTTP gave us a step, keep it as the first step (fast path).
    const allSteps = httpStep
      ? [httpStep, ...normSteps.filter((s) => s.step !== 1).map((s, i) => ({ ...s, step: i + 2 }))]
      : normSteps;

    const { executionPlan, rationale } = deriveExecutionPlan(allSteps);

    return {
      transport: httpStep ? "http" : "cli",
      provider: JEV_PROVIDER === "demo" ? "jevrouter-demo" : JEV_PROVIDER,
      planId: raw.plan_id ?? null,
      mode: raw.mode || "serial",
      status: allSteps.some((s) => s.status === "selected")
        ? "selected"
        : allSteps[0]?.status || "no_decision",
      steps: allSteps,
      provenance: {
        candidateSnapshotHash:
          raw.provenance?.candidate_snapshot_hash ?? null,
        policyHash: raw.provenance?.policy_hash ?? null,
      },
      executionPlan,
      rationale,
      elapsedMs: Date.now() - started,
      raw,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // 3. Never dead-end the demo.
    return policyPlan(
      "JevRouter CLI was unavailable, so we fell back to a deterministic local policy.",
      message,
    );
  }
}

export async function jevHealth(): Promise<{
  available: boolean;
  transport: "http" | "cli" | "policy";
  endpoint: string;
  provider: string;
  detail: string;
}> {
  try {
    const health = await fetch(`${JEV_HTTP_URL}/health`, {
      signal: AbortSignal.timeout(1200),
    });
    if (health.ok) {
      return {
        available: true,
        transport: "http",
        endpoint: JEV_HTTP_URL,
        provider: JEV_PROVIDER,
        detail: "live router",
      };
    }
  } catch {
    // fall through
  }
  return {
    available: true,
    transport: "cli",
    endpoint: JEV_PACKAGE,
    provider: JEV_PROVIDER,
    detail: "offline demo provider",
  };
}
