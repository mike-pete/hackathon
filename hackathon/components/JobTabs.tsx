"use client";

import { useState } from "react";
import jobs from "@/app/jobs";
import { useAgentStore } from "@/lib/store";
import type { PipelineStatus } from "@/lib/types";

const boardJobs = Object.entries(jobs).map(([id, job]) => ({ id, ...job }));

const STATUS_DOT: Record<PipelineStatus, string> = {
  idle: "bg-zinc-600",
  routing: "bg-sky-400 animate-pulse",
  generating: "bg-sky-400 animate-pulse",
  assessing: "bg-sky-400 animate-pulse",
  done: "bg-emerald-400",
  error: "bg-rose-400",
};

function formatComp([min, max]: [number, number]) {
  const k = (n: number) => `$${Math.round(n / 1000)}K`;
  return `${k(min)} - ${k(max)}`;
}

export function JobTabs() {
  const workspaces = useAgentStore((s) => s.workspaces);
  const activeId = useAgentStore((s) => s.activeId);
  const setActiveId = useAgentStore((s) => s.setActiveId);
  const removeWorkspace = useAgentStore((s) => s.removeWorkspace);
  const addWorkspace = useAgentStore((s) => s.addWorkspace);
  const openBoardJob = useAgentStore((s) => s.openBoardJob);
  const runPipeline = useAgentStore((s) => s.runPipeline);
  const [menuOpen, setMenuOpen] = useState(false);

  const active = workspaces.find((w) => w.id === activeId);
  const busy =
    active?.status === "routing" ||
    active?.status === "generating" ||
    active?.status === "assessing";

  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-[#070b12]/70 px-3 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto">
        {workspaces.map((w) => {
          const isActive = w.id === activeId;
          const label = w.job.title || "Untitled job";
          return (
            <div
              key={w.id}
              className={`group relative flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-3 py-2.5 transition ${
                isActive
                  ? "border-sky-400 bg-white/[0.04]"
                  : "border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <button
                onClick={() => setActiveId(w.id)}
                className="flex max-w-[15rem] items-center gap-2 text-left"
              >
                <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[w.status]}`} />
                <span className="min-w-0">
                  <span
                    className={`block truncate text-[12px] font-medium ${
                      isActive ? "text-zinc-100" : "text-zinc-400"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="block truncate text-[10px] text-zinc-600">
                    {w.job.company || (w.job.sourceId ? "" : "no company")}
                    {w.job.baseRange ? ` · ${formatComp(w.job.baseRange)}` : ""}
                  </span>
                </span>
              </button>
              {workspaces.length > 1 && (
                <button
                  onClick={() => removeWorkspace(w.id)}
                  aria-label="Close tab"
                  className="shrink-0 rounded p-0.5 text-zinc-600 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 14 14" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        <div className="relative shrink-0 pb-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
          >
            + Job
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 z-20 mt-1 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#0b1018] shadow-2xl">
                <div className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-wide text-zinc-500">
                  From the team job board
                </div>
                {boardJobs.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => {
                      openBoardJob(j.id);
                      setMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <span className="block text-[12px] font-medium text-zinc-200">
                      {j.title}
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      {j.company} · {formatComp(j.baseRange)}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    addWorkspace();
                    setMenuOpen(false);
                  }}
                  className="block w-full border-t border-white/10 px-3 py-2.5 text-left text-[12px] text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
                >
                  Blank job (paste your own)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={runPipeline}
        disabled={busy}
        className="mb-1 shrink-0 rounded-lg bg-gradient-to-r from-emerald-400 to-sky-400 px-3.5 py-1.5 text-xs font-semibold text-[#05221a] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Running…" : "Run agent"}
      </button>
    </div>
  );
}
