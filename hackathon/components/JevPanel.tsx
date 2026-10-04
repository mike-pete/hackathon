"use client";

import { CAPABILITY_BY_ID } from "@/lib/capabilities";
import { useAgentStore } from "@/lib/store";
import type { JevCandidate, JevStep } from "@/lib/types";
import { Badge, Card, type Tone } from "./ui";

const CHIP_TONE: Record<string, string> = {
  emerald: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  sky: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  violet: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  rose: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
};

function CapChip({ id }: { id: string }) {
  const cap = CAPABILITY_BY_ID.get(id);
  if (!cap) {
    return (
      <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-zinc-400 ring-1 ring-inset ring-white/10">
        {id}
      </span>
    );
  }
  const cls = CHIP_TONE[cap.ui?.accent ?? "sky"] ?? CHIP_TONE.sky;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${cls}`}
    >
      {cap.name}
    </span>
  );
}

function probabilityTone(p: number | null): Tone {
  if (p == null) return "slate";
  if (p >= 0.5) return "emerald";
  if (p >= 0.25) return "sky";
  return "slate";
}

function CandidateRow({
  c,
  isResolved,
}: {
  c: JevCandidate;
  isResolved: boolean;
}) {
  const pct =
    c.probability != null
      ? Math.round(Math.max(0, Math.min(1, c.probability)) * 100)
      : null;
  const cap = CAPABILITY_BY_ID.get(c.id);
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-2.5 py-2 transition ${
        isResolved ? "bg-white/[0.06] ring-1 ring-inset ring-white/10" : ""
      } ${c.filtered ? "opacity-50" : ""}`}
    >
      <span className="grid size-5 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-[10px] text-zinc-400">
        {c.rank ?? "-"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`truncate text-[12px] font-medium ${
              c.filtered ? "text-zinc-500 line-through" : "text-zinc-200"
            }`}
          >
            {cap?.name ?? c.id}
          </span>
          {isResolved && (
            <span className="rounded bg-emerald-400/20 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
              run
            </span>
          )}
          {c.requiresConfirmation && (
            <span title="Requires confirmation" className="text-[10px] text-amber-300">
              🔒
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${
                probabilityTone(c.probability) === "emerald"
                  ? "bg-emerald-400"
                  : probabilityTone(c.probability) === "sky"
                    ? "bg-sky-400"
                    : "bg-slate-400"
              }`}
              style={{ width: `${pct ?? 3}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-zinc-500">
            {pct != null ? `${pct}%` : "n/a"}
          </span>
          <span className="font-mono text-[10px] text-zinc-600">
            conf {c.confidence != null ? c.confidence.toFixed(2) : "-"}
          </span>
          {c.filterReason && (
            <span className="text-[10px] text-rose-300">{c.filterReason}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBlock({ step }: { step: JevStep }) {
  const ranked = [...step.candidates].sort(
    (a, b) => (a.rank ?? 99) - (b.rank ?? 99),
  );
  const lowConf = step.fallback?.type === "low_confidence";
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-md bg-violet-400/15 font-mono text-[10px] text-violet-300">
          {step.step}
        </span>
        <span className="text-[11px] text-zinc-400">step {step.step}</span>
        <Badge
          tone={step.status === "selected" ? "emerald" : "amber"}
          className="ml-auto"
        >
          {step.status}
        </Badge>
      </div>
      <div className="space-y-0.5">
        {ranked.map((c) => (
          <CandidateRow key={c.id} c={c} isResolved={c.id === step.resolved} />
        ))}
      </div>
      {lowConf && (
        <p className="mt-1.5 text-[10px] text-amber-300/80">
          confidence below policy → best-ranked safe pick, flagged as fallback
        </p>
      )}
    </div>
  );
}

export function JevPanel() {
  const jev = useAgentStore((s) => s.jev);
  const research = useAgentStore((s) => s.research);
  const status = useAgentStore((s) => s.status);

  const tone: Tone = jev
    ? jev.transport === "http"
      ? "violet"
      : jev.transport === "cli"
        ? "sky"
        : "amber"
    : "slate";

  return (
    <Card
      title="JEV router"
      subtitle="Which capability handles each step?"
      right={
        jev ? (
          <div className="flex items-center gap-1.5">
            <Badge tone={tone}>{jev.transport}</Badge>
            <Badge tone="slate">{jev.provider}</Badge>
            <Badge tone="slate">{jev.elapsedMs}ms</Badge>
          </div>
        ) : (
          <Badge tone="slate">idle</Badge>
        )
      }
      className="min-h-[26rem]"
      bodyClassName="overflow-y-auto p-3"
    >
      {!jev && (
        <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/20">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h6l4 10h6M4 17h6l4-10h6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="4" cy="7" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="4" cy="17" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <p className="max-w-[15rem] text-xs text-zinc-500">
            {status === "routing"
              ? "JevRouter is choosing the capability order…"
              : "Run the agent and JevRouter will plan the capability order here."}
          </p>
        </div>
      )}

      {jev && (
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Execution plan
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {jev.executionPlan.map((id, i) => (
                <span key={id} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span className="text-zinc-600">→</span>}
                  <CapChip id={id} />
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
              {jev.rationale}
            </p>
          </div>

          <div className="space-y-2">
            {jev.steps.map((s) => (
              <StepBlock key={s.step} step={s} />
            ))}
          </div>

          {research && (
            <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.05] p-2.5">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-violet-300">
                Research signal
              </div>
              <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-300">
                {research}
              </p>
            </div>
          )}

          <div className="space-y-1 border-t border-white/10 pt-2 font-mono text-[10px] text-zinc-600">
            {jev.planId && <div>plan {jev.planId.slice(0, 18)}</div>}
            {jev.provenance.candidateSnapshotHash && (
              <div className="truncate">
                candidates {jev.provenance.candidateSnapshotHash.slice(0, 26)}…
              </div>
            )}
            {jev.provenance.policyHash && (
              <div className="truncate">
                policy {jev.provenance.policyHash.slice(0, 26)}…
              </div>
            )}
            {jev.error && (
              <div className="text-amber-400/80">fallback: {jev.error.slice(0, 90)}</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
