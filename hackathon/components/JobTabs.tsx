"use client";

import { useState } from "react";
import jobs from "@/app/jobs";
import { useAgentStore } from "@/lib/store";
import type { PipelineStatus } from "@/lib/types";
import { useDragReorder } from "./Reorder";

const boardJobs = Object.entries(jobs).map(([id, job]) => ({ id, ...job }));

const STATUS_DOT: Record<PipelineStatus, string> = {
  idle: "bg-zinc-300 dark:bg-zinc-700",
  routing: "bg-blue-500 animate-pulse",
  generating: "bg-blue-500 animate-pulse",
  assessing: "bg-blue-500 animate-pulse",
  done: "bg-emerald-500",
  error: "bg-rose-500",
};

function formatComp([min, max]: [number, number]) {
  const k = (n: number) => `$${Math.round(n / 1000)}K`;
  return `${k(min)} - ${k(max)}`;
}

function Grip() {
  return (
    <svg viewBox="0 0 10 16" className="size-3" fill="currentColor">
      <circle cx="3" cy="3" r="1" />
      <circle cx="7" cy="3" r="1" />
      <circle cx="3" cy="8" r="1" />
      <circle cx="7" cy="8" r="1" />
      <circle cx="3" cy="13" r="1" />
      <circle cx="7" cy="13" r="1" />
    </svg>
  );
}

export function JobTabs() {
  const workspaces = useAgentStore((s) => s.workspaces);
  const activeId = useAgentStore((s) => s.activeId);
  const setActiveId = useAgentStore((s) => s.setActiveId);
  const removeWorkspace = useAgentStore((s) => s.removeWorkspace);
  const addWorkspace = useAgentStore((s) => s.addWorkspace);
  const openBoardJob = useAgentStore((s) => s.openBoardJob);
  const runPipeline = useAgentStore((s) => s.runPipeline);
  const reorderWorkspaces = useAgentStore((s) => s.reorderWorkspaces);
  const [menuOpen, setMenuOpen] = useState(false);

  const { containerRef, dragIndex, overIndex, onPointerDown } = useDragReorder({
    orientation: "horizontal",
    count: workspaces.length,
    onReorder: reorderWorkspaces,
  });

  const active = workspaces.find((w) => w.id === activeId);
  const busy =
    active?.status === "routing" ||
    active?.status === "generating" ||
    active?.status === "assessing";

  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-black">
      <div ref={containerRef} className="flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto">
        {workspaces.map((w, i) => {
          const isActive = w.id === activeId;
          const label = w.job.title || "Untitled job";
          const isDropTarget = overIndex === i && dragIndex !== i;
          return (
            <div
              key={w.id}
              className={`group relative flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-2.5 py-2.5 transition ${
                isActive
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                  : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900"
              } ${dragIndex === i ? "opacity-40" : ""} ${
                isDropTarget ? "ring-2 ring-blue-400/70 ring-inset" : ""
              }`}
            >
              <button
                onPointerDown={onPointerDown(i)}
                aria-label="Drag to reorder tab"
                title="Drag to reorder"
                className="shrink-0 cursor-grab touch-none rounded p-0.5 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-400"
              >
                <Grip />
              </button>
              <button
                onClick={() => setActiveId(w.id)}
                className="flex max-w-[15rem] items-center gap-2 text-left"
              >
                <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[w.status]}`} />
                <span className="min-w-0">
                  <span
                    className={`block truncate text-[12px] font-medium ${
                      isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="block truncate text-[10px] text-zinc-500 dark:text-zinc-500">
                    {w.job.company || (w.job.sourceId ? "" : "no company")}
                    {w.job.baseRange ? ` · ${formatComp(w.job.baseRange)}` : ""}
                  </span>
                </span>
              </button>
              {workspaces.length > 1 && (
                <button
                  onClick={() => removeWorkspace(w.id)}
                  aria-label="Close tab"
                  className="shrink-0 rounded p-0.5 text-zinc-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
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
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            + Job
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 z-20 mt-1 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-zinc-200 px-3 py-2 text-[10px] uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  From the team job board
                </div>
                {boardJobs.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => {
                      openBoardJob(j.id);
                      setMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-100">
                      {j.title}
                    </span>
                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">
                      {j.company} · {formatComp(j.baseRange)}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    addWorkspace();
                    setMenuOpen(false);
                  }}
                  className="block w-full border-t border-zinc-200 px-3 py-2.5 text-left text-[12px] text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
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
        className="mb-1 shrink-0 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Running…" : "Run agent"}
      </button>
    </div>
  );
}
