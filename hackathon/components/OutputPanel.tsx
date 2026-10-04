"use client";

import { useMemo, useState } from "react";
import { useAgentStore } from "@/lib/store";
import { Badge, Card, Meter, ScoreRing } from "./ui";

type Tab = "cv" | "score" | "json";

function toPlainText(cv: NonNullable<ReturnType<typeof useAgentStore.getState>["cv"]>) {
  return [
    cv.headline,
    "",
    cv.summary,
    "",
    "SKILLS",
    cv.skills.join(" · "),
    "",
    "EXPERIENCE",
    ...cv.bullets.map((b) => `• ${b.text}`),
    "",
    "COVER NOTE",
    cv.coverNote,
  ].join("\n");
}

export function OutputPanel() {
  const cv = useAgentStore((s) => s.cv);
  const assessment = useAgentStore((s) => s.assessment);
  const jev = useAgentStore((s) => s.jev);
  const bullets = useAgentStore((s) => s.bullets);
  const usedMock = useAgentStore((s) => s.usedMock);
  const [tab, setTab] = useState<Tab>("cv");
  const [copied, setCopied] = useState(false);

  const json = useMemo(
    () =>
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          jev_plan: jev,
          cv,
          assessment,
          big_cv_bullets: bullets,
        },
        null,
        2,
      ),
    [jev, cv, assessment, bullets],
  );

  const copy = async () => {
    const text = tab === "json" ? json : cv ? toPlainText(cv) : "";
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-application.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: Array<{ id: Tab; label: string; disabled?: boolean }> = [
    { id: "cv", label: "Tailored CV" },
    { id: "score", label: "Quality" },
    { id: "json", label: "JSON" },
  ];

  return (
    <Card
      title="Output"
      subtitle={
        assessment
          ? `Quality ${assessment.overall}/100 · ${usedMock ? "mock fallback" : "live model"}`
          : "The tailored application appears here"
      }
      right={
        <div className="flex items-center gap-1.5">
          {usedMock && <Badge tone="amber">mock</Badge>}
          <button
            onClick={copy}
            disabled={!cv}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={download}
            disabled={!cv}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            JSON
          </button>
        </div>
      }
      className="min-h-[30rem]"
      bodyClassName="flex flex-col"
    >
      <div className="flex gap-1 border-b border-white/10 px-3 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              tab === t.id
                ? "bg-white/10 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!cv && tab !== "json" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-xs text-zinc-500">
              Nothing generated yet. Load the sample and hit Run agent.
            </p>
          </div>
        )}

        {cv && tab === "cv" && (
          <article className="space-y-4">
            <header>
              <h3 className="text-base font-semibold leading-snug text-zinc-100">
                {cv.headline}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                {cv.summary}
              </p>
            </header>

            {cv.skills.length > 0 && (
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300 ring-1 ring-inset ring-emerald-400/15"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                Experience
              </div>
              <ul className="space-y-2.5">
                {cv.bullets.map((b) => (
                  <li key={b.id} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <div className="min-w-0">
                      <p className="text-[12px] leading-snug text-zinc-200">
                        {b.text}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {b.evidenceId && (
                          <span className="font-mono text-[10px] text-zinc-600">
                            ← {b.evidenceId}
                          </span>
                        )}
                        {b.keywords.slice(0, 4).map((k, ki) => (
                          <span
                            key={`${k}-${ki}`}
                            className="rounded bg-white/5 px-1.5 py-px text-[10px] text-zinc-400"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                      {b.rationale && (
                        <p className="mt-0.5 text-[10px] italic text-zinc-500">
                          {b.rationale}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {cv.coverNote && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                  Cover note
                </div>
                <p className="text-[12px] leading-relaxed text-zinc-300">
                  {cv.coverNote}
                </p>
              </div>
            )}
          </article>
        )}

        {assessment && tab === "score" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ScoreRing value={assessment.overall} label="/100" />
              <div>
                <div className="text-[13px] font-medium text-zinc-200">
                  {assessment.overall >= 80
                    ? "Strong fit"
                    : assessment.overall >= 65
                      ? "Solid, with gaps"
                      : "Needs work"}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                  {assessment.verdict}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {assessment.dimensions.map((d) => (
                <div key={d.key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12px] text-zinc-300">{d.label}</span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {d.score}
                    </span>
                  </div>
                  <Meter
                    value={d.score}
                    tone={
                      d.score >= 80 ? "emerald" : d.score >= 65 ? "sky" : d.score >= 50 ? "amber" : "rose"
                    }
                  />
                  <p className="mt-1 text-[10px] text-zinc-500">{d.note}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                  Matched ({assessment.matchedKeywords.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {assessment.matchedKeywords.map((k, i) => (
                    <span
                      key={`${k}-${i}`}
                      className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-rose-300">
                  Missing ({assessment.missingKeywords.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {assessment.missingKeywords.map((k, i) => (
                    <span
                      key={`${k}-${i}`}
                      className="rounded bg-rose-400/10 px-1.5 py-0.5 text-[10px] text-rose-300"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                Suggested edits
              </div>
              <ul className="space-y-1.5">
                {assessment.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-zinc-300">
                    <span className="text-zinc-600">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "json" && (
          <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-zinc-400">
            {json}
          </pre>
        )}
      </div>
    </Card>
  );
}
