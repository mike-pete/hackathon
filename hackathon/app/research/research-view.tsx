"use client";

import { useState } from "react";
import type { Contact, Job, JobResearch, Source } from "@/lib/research/types";

type State = { status: "idle" | "loading" } | { status: "done"; data: JobResearch } | { status: "error"; error: string };

const ROLE_LABEL: Record<Contact["role"], string> = {
  hiring_manager: "Hiring manager",
  recruiter: "Recruiter",
  executive: "Leadership",
  team_member: "Team member",
};

export default function ResearchView({ jobs }: { jobs: Job[] }) {
  const [state, setState] = useState<Record<string, State>>({});

  async function run(job: Job, refresh = false) {
    setState((s) => ({ ...s, [job.id]: { status: "loading" } }));
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ job, refresh }),
      });
      const body = await res.json();
      const result = body.results?.[0];
      if (!res.ok || !result || "error" in result) throw new Error(body.error ?? result?.error ?? "Research failed");
      setState((s) => ({ ...s, [job.id]: { status: "done", data: result } }));
    } catch (err) {
      setState((s) => ({ ...s, [job.id]: { status: "error", error: (err as Error).message } }));
    }
  }

  if (!jobs.length) return <p className="mt-8">No jobs found. Put them in data/jobs.json.</p>;

  return (
    <div className="mt-8 flex flex-col gap-6">
      {jobs.map((job) => {
        const s = state[job.id] ?? { status: "idle" };
        return (
          <section key={job.id} className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{job.title}</h2>
                <p className="text-sm text-zinc-500">
                  {job.company}
                  {job.location ? ` · ${job.location}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => run(job)}
                  disabled={s.status === "loading"}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {s.status === "loading" ? "Researching…" : "Research"}
                </button>
                {s.status === "done" && (
                  <button onClick={() => run(job, true)} className="rounded-md border px-3 py-1.5 text-sm">
                    Refresh
                  </button>
                )}
              </div>
            </div>
            {s.status === "error" && <p className="mt-3 text-sm text-red-600">{s.error}</p>}
            {s.status === "done" && <Result data={s.data} />}
          </section>
        );
      })}
    </div>
  );
}

function Sources({ sources }: { sources?: Source[] }) {
  if (!sources?.length) return null;
  return (
    <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-zinc-500">
      Sources:
      {sources.map((s, i) => (
        <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="underline" title={s.title}>
          [{i + 1}]
        </a>
      ))}
    </p>
  );
}

function Result({ data }: { data: JobResearch }) {
  const c = data.company;
  return (
    <div className="mt-5 grid gap-6 text-sm">
      <div>
        <h3 className="mb-1 font-medium">{c.name}</h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          {[c.headcount, c.headquarters, c.stage].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2">{c.overview}</p>
        {c.talkingPoints.length > 0 && (
          <>
            <h4 className="mt-3 font-medium">Talking points</h4>
            <ul className="ml-5 list-disc">
              {c.talkingPoints.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
        {c.recentNews.length > 0 && (
          <>
            <h4 className="mt-3 font-medium">Recent news</h4>
            <ul className="ml-5 list-disc">
              {c.recentNews.map((n) => (
                <li key={n.url}>
                  <a href={n.url} target="_blank" rel="noreferrer" className="underline">
                    {n.title}
                  </a>
                  {n.publishedDate ? ` (${n.publishedDate.slice(0, 10)})` : ""}
                </li>
              ))}
            </ul>
          </>
        )}
        <Sources sources={c.sources} />
      </div>
      <div>
        <h3 className="mb-2 font-medium">People to contact ({data.contacts.length})</h3>
        <ol className="flex flex-col gap-3">
          {data.contacts.map((p) => (
            <li key={p.profileUrl} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <a href={p.profileUrl} target="_blank" rel="noreferrer" className="font-medium underline">
                  {p.name}
                </a>
                <span className="text-xs text-zinc-500">
                  {ROLE_LABEL[p.role]} · priority {p.priority}
                </span>
              </div>
              {p.title && <p className="text-zinc-600 dark:text-zinc-400">{p.title}</p>}
              <p className="mt-1">{p.reason}</p>
              {p.hooks && <p className="mt-1 text-zinc-500">{p.hooks}</p>}
              <Sources sources={p.sources} />
            </li>
          ))}
        </ol>
      </div>
      <p className="text-xs text-zinc-500">
        Researched {new Date(data.researchedAt).toLocaleString()}
        {data.costDollars !== undefined ? ` · Exa cost $${data.costDollars}` : ""}
      </p>
    </div>
  );
}
