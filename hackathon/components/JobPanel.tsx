"use client";

import { useAgentStore } from "@/lib/store";
import { Badge, Card } from "./ui";

export function JobPanel() {
  const job = useAgentStore((s) => s.job);
  const intent = useAgentStore((s) => s.intent);
  const setJob = useAgentStore((s) => s.setJob);
  const setIntent = useAgentStore((s) => s.setIntent);
  const status = useAgentStore((s) => s.status);
  const runPipeline = useAgentStore((s) => s.runPipeline);
  const error = useAgentStore((s) => s.error);

  const busy = status === "routing" || status === "generating" || status === "assessing";

  const field =
    "w-full rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-[12px] text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40 focus:bg-white/[0.04]";

  return (
    <Card
      title="Target job"
      subtitle="What are we aiming at?"
      right={job.url ? <Badge tone="sky">link set</Badge> : null}
      className="min-h-[20rem]"
      bodyClassName="flex flex-col"
    >
      <div className="grid grid-cols-2 gap-2 px-4 pt-3">
        <input
          value={job.title}
          onChange={(e) => setJob({ title: e.target.value })}
          placeholder="Job title"
          className={field}
        />
        <input
          value={job.company}
          onChange={(e) => setJob({ company: e.target.value })}
          placeholder="Company"
          className={field}
        />
      </div>
      <input
        value={job.url}
        onChange={(e) => setJob({ url: e.target.value })}
        placeholder="Posting URL (optional)"
        className={`${field} mx-4 mt-2`}
      />
      <textarea
        value={job.description}
        onChange={(e) => setJob({ description: e.target.value })}
        placeholder="Paste the job description…"
        spellCheck={false}
        className="mt-2 h-32 w-full resize-none border-y border-white/10 bg-transparent px-4 py-2.5 text-[12px] leading-relaxed text-zinc-300 outline-none placeholder:text-zinc-600 focus:bg-white/[0.02]"
      />

      <div className="px-4 pt-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Intent (highest priority)
        </label>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g. emphasise reliability and scale, keep to one page, sound senior not salesy"
          className={`${field} h-16 resize-none`}
        />
      </div>

      {error && (
        <p className="mx-4 mt-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-[11px] text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-auto p-4">
        <button
          onClick={runPipeline}
          disabled={busy}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-[#05221a] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-[#05221a]/40 border-t-[#05221a]" />
              {status === "routing"
                ? "Routing with JevRouter…"
                : status === "generating"
                  ? "Tailoring…"
                  : "Assessing…"}
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
                <path d="M6 4.5 15 10 6 15.5z" />
              </svg>
              Run agent
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
