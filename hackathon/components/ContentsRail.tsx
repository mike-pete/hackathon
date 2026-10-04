"use client";

import { useRef, useState } from "react";
import { useActiveWorkspace, useAgentStore } from "@/lib/store";

export const SECTIONS = [
  { id: "resume", label: "Big CV" },
  { id: "target", label: "Target job" },
  { id: "pipeline", label: "Pipeline" },
  { id: "cv", label: "Tailored CV" },
  { id: "quality", label: "Quality" },
  { id: "trace", label: "Agent trace" },
];

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ContentsRail() {
  const ws = useActiveWorkspace();
  const bullets = useAgentStore((s) => s.bullets);
  const sampleLabel = useAgentStore((s) => s.sampleLabel);
  const uploadResume = useAgentStore((s) => s.uploadResume);
  const parseFromRaw = useAgentStore((s) => s.parseFromRaw);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = bullets.filter((b) => b.selected).length;

  const done = [
    bullets.length > 0,
    Boolean(ws.job.description.trim()),
    Boolean(ws.jev),
    Boolean(ws.cv),
    Boolean(ws.assessment),
    ws.logs.length > 0,
  ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#080c14] px-4 py-5 lg:flex">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Contents
      </div>
      <nav className="space-y-0.5">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/5"
          >
            <span
              className={`w-4 shrink-0 text-right font-mono text-[11px] ${
                done[i] ? "text-emerald-400" : "text-zinc-600"
              }`}
            >
              {done[i] ? "✓" : i + 1}
            </span>
            <span className="truncate text-[12px] text-zinc-400 transition group-hover:text-zinc-100">
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Source
        </div>
        <p className="mb-1 truncate text-[11px] text-zinc-400" title={sampleLabel ?? "No resume loaded"}>
          {sampleLabel ?? "No resume loaded"}
        </p>
        <p className="mb-3 text-[11px] text-zinc-600">
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
            className="flex-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1.5 text-[11px] font-medium text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50"
          >
            {busy ? "Parsing…" : "Upload"}
          </button>
          <button
            onClick={parseFromRaw}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:bg-white/10"
          >
            Parse
          </button>
        </div>
      </div>
    </aside>
  );
}
