"use client";

import { useRef, useState } from "react";
import { useActiveWorkspace, useAgentStore } from "@/lib/store";

export const SECTION_LABELS: Record<string, string> = {
  resume: "Big CV",
  target: "Target job",
  pipeline: "Pipeline",
  cv: "Tailored CV",
  quality: "Quality",
  trace: "Agent trace",
};

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ContentsRail() {
  const ws = useActiveWorkspace();
  const bullets = useAgentStore((s) => s.bullets);
  const sampleLabel = useAgentStore((s) => s.sampleLabel);
  const order = useAgentStore((s) => s.sectionOrder);
  const uploadResume = useAgentStore((s) => s.uploadResume);
  const parseFromRaw = useAgentStore((s) => s.parseFromRaw);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = bullets.filter((b) => b.selected).length;

  const doneById: Record<string, boolean> = {
    resume: bullets.length > 0,
    target: Boolean(ws.job.description.trim()),
    pipeline: Boolean(ws.jev),
    cv: Boolean(ws.cv),
    quality: Boolean(ws.assessment),
    trace: ws.logs.length > 0,
  };

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-r border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        Contents
      </div>
      <nav className="space-y-0.5">
        {order.map((id, i) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <span
              className={`w-4 shrink-0 text-right font-mono text-[11px] ${
                doneById[id]
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              {doneById[id] ? "✓" : i + 1}
            </span>
            <span className="truncate text-[12px] text-zinc-600 transition group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
              {SECTION_LABELS[id] ?? id}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Source
        </div>
        <p
          className="mb-1 truncate text-[11px] text-zinc-600 dark:text-zinc-400"
          title={sampleLabel ?? "No resume loaded"}
        >
          {sampleLabel ?? "No resume loaded"}
        </p>
        <p className="mb-3 text-[11px] text-zinc-400 dark:text-zinc-600">
          {selected}/{bullets.length} bullets in play
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.markdown,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              await uploadResume(file);
            } finally {
              setBusy(false);
              if (fileRef.current) fileRef.current.value = "";
            }
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex-1 rounded-lg bg-blue-600 px-2 py-1.5 text-[11px] font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Parsing…" : "Upload"}
          </button>
          <button
            onClick={parseFromRaw}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Parse
          </button>
        </div>
      </div>
    </aside>
  );
}
