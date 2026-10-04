"use client";

import jobs from "@/app/jobs";
import { useAgentStore } from "@/lib/store";
import { Badge, Card } from "./ui";

function formatComp([min, max]: [number, number]) {
  const k = (n: number) => `$${Math.round(n / 1000)}K`;
  return `${k(min)} - ${k(max)}`;
}

const boardJobs = Object.entries(jobs).map(([id, job]) => ({ id, ...job }));

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
      right={
        job.baseRange ? (
          <Badge tone="emerald">{formatComp(job.baseRange)}</Badge>
        ) : job.url ? (
          <Badge tone="sky">link set</Badge>
        ) : null
      }
      className="min-h-[20rem]"
      bodyClassName="flex flex-col"
    >
      <div className="px-4 pt-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          From the job board
        </label>
        <select
          value={job.sourceId ?? ""}
          onChange={(e) => {
            const picked = boardJobs.find((j) => j.id === e.target.value);
            if (picked) {
              setJob({
                title: picked.title,
                company: picked.company,
                description: picked.description,
                url: "",
                sourceId: picked.id,
                baseRange: picked.baseRange,
              });
            }
          }}
          className={`${field} appearance-none`}
        >
          <option value="">Pick a job from the team board…</option>
          {boardJobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} · {j.company} · {formatComp(j.baseRange)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pt-3">
        <input
          value={job.title}
          onChange={(e) => setJob({ title: e.target.value, sourceId: undefined, baseRange: undefined })}
          placeholder="Job title"
          className={field}
        />
        <input
          value={job.company}
          onChange={(e) => setJob({ company: e.target.value, sourceId: undefined, baseRange: undefined })}
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
