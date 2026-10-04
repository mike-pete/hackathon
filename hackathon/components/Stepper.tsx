"use client";

import { useAgentStore } from "@/lib/store";

type Step = { label: string; hint: string; done: boolean };

export function Stepper() {
  const bullets = useAgentStore((s) => s.bullets);
  const job = useAgentStore((s) => s.job);
  const intent = useAgentStore((s) => s.intent);
  const cv = useAgentStore((s) => s.cv);
  const assessment = useAgentStore((s) => s.assessment);
  const status = useAgentStore((s) => s.status);

  const busy = status === "routing" || status === "generating" || status === "assessing";

  const steps: Step[] = [
    { label: "Add resume", hint: "upload or paste", done: bullets.length > 0 },
    { label: "Pick a job", hint: "job board or paste", done: job.description.trim().length > 0 },
    { label: "Set intent", hint: "what matters", done: intent.trim().length > 0 },
    { label: "Run agent", hint: "JEV routes it", done: Boolean(cv) },
    { label: "Review", hint: "CV + quality", done: Boolean(assessment) },
  ];

  const current = steps.findIndex((s) => !s.done);

  return (
    <nav className="border-b border-white/10 bg-[#070b12]/70 px-4 py-2.5 backdrop-blur">
      <ol className="mx-auto flex max-w-[1700px] items-center gap-1 overflow-x-auto">
        {steps.map((s, i) => {
          const isDone = s.done;
          const isCurrent = i === current || (current === -1 && i === steps.length - 1);
          const isBusyHere = busy && i === 3;
          return (
            <li key={s.label} className="flex shrink-0 items-center gap-1">
              {i > 0 && (
                <span
                  className={`mx-1 h-px w-6 ${isDone || isCurrent ? "bg-emerald-400/40" : "bg-white/10"}`}
                />
              )}
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold ring-1 ring-inset transition ${
                    isDone
                      ? "bg-emerald-400/90 text-[#062015] ring-emerald-300/40"
                      : isCurrent
                        ? "bg-sky-400/15 text-sky-300 ring-sky-400/40"
                        : "bg-white/5 text-zinc-500 ring-white/10"
                  }`}
                >
                  {isDone ? (
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6.2 5 8.6l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="leading-tight">
                  <div
                    className={`text-[11px] font-medium ${
                      isCurrent ? "text-sky-200" : isDone ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    {s.label}
                    {isBusyHere && <span className="ml-1 text-sky-300">…</span>}
                  </div>
                  <div className="hidden text-[10px] text-zinc-600 sm:block">{s.hint}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
