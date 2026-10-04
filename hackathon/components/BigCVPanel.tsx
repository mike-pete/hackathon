"use client";

import { useRef, useState } from "react";
import { useAgentStore } from "@/lib/store";
import { Badge, Card } from "./ui";

export function BigCVPanel() {
  const rawCV = useAgentStore((s) => s.rawCV);
  const bullets = useAgentStore((s) => s.bullets);
  const setRawCV = useAgentStore((s) => s.setRawCV);
  const parseFromRaw = useAgentStore((s) => s.parseFromRaw);
  const toggleBullet = useAgentStore((s) => s.toggleBullet);
  const removeBullet = useAgentStore((s) => s.removeBullet);
  const addBullet = useAgentStore((s) => s.addBullet);
  const uploadResume = useAgentStore((s) => s.uploadResume);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = bullets.filter((b) => b.selected).length;

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setBusy(true);
    try {
      await uploadResume(file);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card
      title="Big CV"
      subtitle="Upload a resume or dump everything. The agent picks what matters."
      right={
        <div className="flex items-center gap-2">
          <Badge tone="emerald">
            {selected}/{bullets.length} in play
          </Badge>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.markdown,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50"
          >
            {busy ? "Parsing…" : "Upload"}
          </button>
          <button
            onClick={parseFromRaw}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-white/10"
          >
            Parse
          </button>
        </div>
      }
      className="min-h-[22rem]"
      bodyClassName="flex flex-col"
    >
      <div
        className="relative"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <textarea
          value={rawCV}
          onChange={(e) => setRawCV(e.target.value)}
          spellCheck={false}
          placeholder="Drop a resume here (PDF, DOCX, TXT, MD), or paste your full career dump: roles, bullets, numbers, tools, anything."
          className="h-40 w-full resize-none border-b border-white/10 bg-transparent px-4 py-3 font-mono text-[12px] leading-relaxed text-zinc-300 outline-none placeholder:text-zinc-600 focus:bg-white/[0.02]"
        />
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg border-2 border-dashed border-emerald-400/50 bg-emerald-400/10">
            <span className="text-xs font-medium text-emerald-200">
              Drop to parse your resume
            </span>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {bullets.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-zinc-500">
            No bullets yet. Upload a resume (PDF, DOCX, TXT, MD) or paste text,
            then hit Parse.
          </p>
        )}
        {bullets.map((b) => (
          <div
            key={b.id}
            className={`group mb-1.5 flex items-start gap-2.5 rounded-xl border px-2.5 py-2 transition ${
              b.selected
                ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                : "border-white/5 bg-white/[0.01] opacity-60"
            }`}
          >
            <button
              onClick={() => toggleBullet(b.id)}
              aria-label="Toggle bullet"
              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-[5px] border transition ${
                b.selected
                  ? "border-emerald-400/60 bg-emerald-400/80 text-[#062015]"
                  : "border-white/20 text-transparent hover:border-white/40"
              }`}
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 6.2 5 8.6l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className={`text-[12px] leading-snug ${b.selected ? "text-zinc-200" : "text-zinc-400"}`}>
                {b.text}
              </p>
              {b.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-zinc-600">
              {b.id}
            </span>
            <button
              onClick={() => removeBullet(b.id)}
              aria-label="Remove bullet"
              className="mt-0.5 shrink-0 rounded p-0.5 text-zinc-600 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
            >
              <svg viewBox="0 0 14 14" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              addBullet(draft.trim());
              setDraft("");
            }
          }}
          placeholder="Add a bullet manually…"
          className="flex-1 bg-transparent text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600"
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              addBullet(draft.trim());
              setDraft("");
            }
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/10"
        >
          Add
        </button>
      </div>
    </Card>
  );
}
