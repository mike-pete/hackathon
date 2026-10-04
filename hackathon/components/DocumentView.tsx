"use client";

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import jobs from "@/app/jobs";
import { CAPABILITY_BY_ID } from "@/lib/capabilities";
import { activeNodeKey, FLOW_NODES, nodeState } from "@/lib/pipeline";
import { extractProfile } from "@/lib/resume-profile";
import { useActiveWorkspace, useAgentStore } from "@/lib/store";
import type { JevStep } from "@/lib/types";
import { FlowDiagram } from "./FlowDiagram";
import { Markdown } from "./Markdown";
import { move, ReorderContext, useDragReorder, useReorderContext } from "./Reorder";
import { Badge, Meter, ScoreRing, type Tone } from "./ui";

const boardJobs = Object.entries(jobs).map(([id, job]) => ({ id, ...job }));

function formatComp([min, max]: [number, number]) {
  const k = (n: number) => `$${Math.round(n / 1000)}K`;
  return `${k(min)} - ${k(max)}`;
}

const btnSecondary =
  "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";
const btnPrimary =
  "rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
const field =
  "w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-[13px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

type AgentStep = {
  id: string;
  label: string;
  hint: string;
  section: string;
  status: "done" | "current" | "upcoming" | "skipped" | "error";
};

function buildAgentSteps(ws: ReturnType<typeof useActiveWorkspace>): AgentStep[] {
  const busy = ["routing", "generating", "assessing"].includes(ws.status);
  const active = activeNodeKey(ws);
  const researchSelected = ws.jev?.executionPlan.includes("company_research") ?? false;
  const researchSkipped = Boolean(ws.jev && !researchSelected);
  const stages = [
    { id: "jev", label: "Plan the work", hint: "Choosing the right steps", section: "pipeline" },
    { id: "research", label: "Research the role", hint: "Checking company context", section: "pipeline" },
    { id: "generate", label: "Draft the CV", hint: "Matching experience to the role", section: "cv" },
    { id: "assess", label: "Review the draft", hint: "Checking fit and coverage", section: "quality" },
  ];
  const activeIndex = stages.findIndex((stage) => stage.id === active);

  return stages.map((stage, index) => {
    const skipped = stage.id === "research" && researchSkipped;
    const done = stage.id === "jev"
      ? Boolean(ws.jev)
      : stage.id === "research"
        ? Boolean(ws.research) || skipped || (Boolean(ws.cv) && !researchSelected)
        : stage.id === "generate"
          ? Boolean(ws.cv)
          : Boolean(ws.assessment);
    let status: AgentStep["status"] = done ? (skipped ? "skipped" : "done") : "upcoming";
    if (busy && index === activeIndex) status = "current";
    if (ws.status === "error" && ws.pipelineErrorNode === stage.id) status = "error";
    return { ...stage, status };
  });
}

function AgentActivity({ ws }: { ws: ReturnType<typeof useActiveWorkspace> }) {
  const [collapsedAt, setCollapsedAt] = useState<string | null>(null);
  const [manualExpanded, setManualExpanded] = useState(false);
  const busy = ["routing", "generating", "assessing"].includes(ws.status);
  const groupKey = `${ws.status}:${ws.activeCapability}`;
  const expanded = busy ? collapsedAt !== groupKey : manualExpanded;
  const steps = buildAgentSteps(ws);
  const current = steps.find((step) => step.status === "current" || step.status === "error");
  const completed = steps.filter((step) => step.status === "done" || step.status === "skipped").length;
  const message = current?.status === "error"
    ? "The run stopped"
    : current?.hint ?? (ws.status === "done" ? "Your draft is ready" : "Ready when you are");

  return (
    <section
      aria-live="polite"
      className={`mb-6 overflow-hidden rounded-2xl border bg-white dark:bg-zinc-950 ${
        busy
          ? "border-blue-200 shadow-sm shadow-blue-950/5 dark:border-blue-900"
          : ws.status === "error"
            ? "border-rose-200 dark:border-rose-900"
            : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className={`relative grid size-9 shrink-0 place-items-center rounded-full ${busy ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"}`}>
          {busy && <span className="absolute inset-0 rounded-full border border-blue-400/40 animate-ping motion-reduce:animate-none" />}
          <svg viewBox="0 0 24 24" aria-hidden="true" className="relative size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 5.5h14v13H5zM8 9h8M8 12h5M8 15h6" strokeLinecap="round" strokeLinejoin="round" />
            {busy && <path d="M15.8 14.2v2.2" className="origin-center animate-pulse motion-reduce:animate-none" strokeWidth="2.5" />}
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{busy ? "Your CV agent is working" : ws.status === "done" ? "CV agent finished" : ws.status === "error" ? "CV agent paused" : "CV agent"}</span>
            {busy && <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-300"><span className="size-1.5 rounded-full bg-blue-500 animate-pulse motion-reduce:animate-none" /> Live</span>}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-zinc-500 dark:text-zinc-400">
            {current ? <><span className="font-medium text-zinc-700 dark:text-zinc-300">{current.label}</span><span className="px-1.5 text-zinc-300 dark:text-zinc-700">·</span>{message}</> : message}
          </p>
        </div>
        <div className="hidden w-28 shrink-0 sm:block">
          <div className="mb-1 flex justify-between font-mono text-[9px] text-zinc-400"><span>Progress</span><span>{completed}/{steps.length}</span></div>
          <div className="flex gap-1" aria-label={`${completed} of ${steps.length} steps complete`}>
            {steps.map((step) => <span key={step.id} className={`h-1 flex-1 rounded-full ${step.status === "done" || step.status === "skipped" ? "bg-emerald-500" : step.status === "current" ? "bg-blue-500 animate-pulse motion-reduce:animate-none" : step.status === "error" ? "bg-rose-500" : "bg-zinc-200 dark:bg-zinc-800"}`} />)}
          </div>
        </div>
      </div>
      <details className="group border-t border-zinc-100 dark:border-zinc-900" open={expanded} onToggle={(event) => {
        if (busy) setCollapsedAt(event.currentTarget.open ? null : groupKey);
        else setManualExpanded(event.currentTarget.open);
      }}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 dark:text-zinc-400">
          <span>{busy ? `Working on step ${Math.max(1, steps.findIndex((step) => step.status === "current") + 1)} of ${steps.length}` : "Run details"}</span>
          <span className="transition group-open:rotate-180">⌄</span>
        </summary>
        <ol className="grid grid-cols-1 gap-px bg-zinc-100 dark:bg-zinc-900 sm:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className={`flex items-center gap-2 bg-white px-3 py-2.5 dark:bg-zinc-950 ${step.status === "current" ? "sm:bg-blue-50/70 sm:dark:bg-blue-950/30" : ""}`}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full font-mono text-[9px] ${step.status === "done" || step.status === "skipped" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : step.status === "current" ? "bg-blue-600 text-white" : step.status === "error" ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"}`}>
                {step.status === "done" ? "✓" : step.status === "skipped" ? "–" : index + 1}
              </span>
              <div className="min-w-0">
                <p className={`truncate text-[10px] font-medium ${step.status === "current" ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}>{step.label}</p>
                <p className="truncate text-[9px] text-zinc-400 dark:text-zinc-500">{step.status === "current" ? step.hint : step.status === "done" ? "Complete" : step.status === "skipped" ? "Skipped" : step.status === "error" ? "Needs attention" : "Up next"}</p>
              </div>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

function SectionHeader({
  id,
  n,
  title,
  actions,
}: {
  id: string;
  n: number;
  title: string;
  actions?: React.ReactNode;
}) {
  const dnd = useReorderContext();
  const pos = dnd?.n ?? n;
  return (
    <div id={id} className="scroll-mt-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-3">
          {dnd && (
            <button
              {...dnd.handleProps}
              aria-label="Drag to reorder"
              title="Drag to reorder"
              className="-ml-1 cursor-grab touch-none rounded p-1 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-400"
            >
              <svg viewBox="0 0 10 16" className="size-3.5" fill="currentColor">
                <circle cx="3" cy="3" r="1.1" />
                <circle cx="7" cy="3" r="1.1" />
                <circle cx="3" cy="8" r="1.1" />
                <circle cx="7" cy="8" r="1.1" />
                <circle cx="3" cy="13" r="1.1" />
                <circle cx="7" cy="13" r="1.1" />
              </svg>
            </button>
          )}
          <span className="font-mono text-[12px] text-zinc-400 dark:text-zinc-600">{pos}</span>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        </div>
        {actions}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Resume */

function ResumeSection() {
  const rawCV = useAgentStore((s) => s.rawCV);
  const bullets = useAgentStore((s) => s.bullets);
  const setRawCV = useAgentStore((s) => s.setRawCV);
  const parseFromRaw = useAgentStore((s) => s.parseFromRaw);
  const toggleBullet = useAgentStore((s) => s.toggleBullet);
  const removeBullet = useAgentStore((s) => s.removeBullet);
  const addBullet = useAgentStore((s) => s.addBullet);
  const uploadResume = useAgentStore((s) => s.uploadResume);
  const [draft, setDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = bullets.filter((b) => b.selected).length;

  const handleFile = async (file: File | null | undefined) => {
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
    <section className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <SectionHeader
        id="resume"
        n={1}
        title="Big CV"
        actions={
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
            <button onClick={() => fileRef.current?.click()} disabled={busy} className={btnPrimary}>
              {busy ? "Parsing…" : "Upload resume"}
            </button>
            <button onClick={parseFromRaw} className={btnSecondary}>
              Parse
            </button>
          </div>
        }
      />

      <div
        className="relative mb-4"
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
          className="h-40 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-[12px] leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl border-2 border-dashed border-blue-500 bg-blue-50/80 dark:bg-blue-950/40">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Drop to parse your resume
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {bullets.map((b) => (
          <div
            key={b.id}
            className={`group flex items-start gap-2.5 rounded-xl border px-3 py-2 transition ${
              b.selected
                ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40"
                : "border-zinc-200 bg-white opacity-60 dark:border-zinc-800 dark:bg-zinc-950"
            }`}
          >
            <button
              onClick={() => toggleBullet(b.id)}
              aria-label="Toggle bullet"
              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-[5px] border transition ${
                b.selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 text-transparent hover:border-zinc-400 dark:border-zinc-600"
              }`}
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 6.2 5 8.6l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`text-[12px] leading-snug ${
                  b.selected ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {b.text}
              </p>
              {b.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
              {b.id}
            </span>
            <button
              onClick={() => removeBullet(b.id)}
              aria-label="Remove bullet"
              className="mt-0.5 shrink-0 rounded p-0.5 text-zinc-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
            >
              <svg viewBox="0 0 14 14" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {bullets.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No bullets yet. Upload a resume or paste text, then hit Parse.
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
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
          className={field}
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              addBullet(draft.trim());
              setDraft("");
            }
          }}
          className={btnSecondary}
        >
          Add
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Target */

function TargetSection() {
  const ws = useActiveWorkspace();
  const setJob = useAgentStore((s) => s.setJob);
  const setIntent = useAgentStore((s) => s.setIntent);
  const setVerbatimness = useAgentStore((s) => s.setVerbatimness);
  const runPipeline = useAgentStore((s) => s.runPipeline);

  const busy = ws.status === "routing" || ws.status === "generating" || ws.status === "assessing";

  return (
    <section className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <SectionHeader
        id="target"
        n={2}
        title="Target job"
        actions={
          <button onClick={runPipeline} disabled={busy} className={btnPrimary}>
            {busy ? "Running…" : "Run agent"}
          </button>
        }
      />

      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        From the team job board
      </label>
      <select
        value={ws.job.sourceId ?? ""}
        onChange={(e) => {
          const picked = boardJobs.find((j) => j.id === e.target.value);
          if (picked)
            setJob({
              title: picked.title,
              company: picked.company,
              description: picked.description,
              url: "",
              sourceId: picked.id,
              baseRange: picked.baseRange,
            });
        }}
        className={`${field} mb-3 appearance-none`}
      >
        <option value="">Pick a job from the team board…</option>
        {boardJobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title} · {j.company} · {formatComp(j.baseRange)}
          </option>
        ))}
      </select>

      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={ws.job.title}
          onChange={(e) => setJob({ title: e.target.value, sourceId: undefined, baseRange: undefined })}
          placeholder="Job title"
          className={field}
        />
        <input
          value={ws.job.company}
          onChange={(e) => setJob({ company: e.target.value, sourceId: undefined, baseRange: undefined })}
          placeholder="Company"
          className={field}
        />
      </div>

      <textarea
        value={ws.job.description}
        onChange={(e) => setJob({ description: e.target.value })}
        placeholder="Paste the job description…"
        spellCheck={false}
        className={`${field} mb-2 h-40 resize-y`}
      />

      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Intent (highest priority)
      </label>
      <textarea
        value={ws.intent}
        onChange={(e) => setIntent(e.target.value)}
        placeholder="e.g. emphasise reliability and scale, keep to one page, sound senior not salesy"
        className={`${field} h-16 resize-y`}
      />

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="verbatimness" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Preserve source wording
          </label>
          <output htmlFor="verbatimness" className="font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
            {ws.verbatimness}% verbatim
          </output>
        </div>
        <input
          id="verbatimness"
          type="range"
          min="0"
          max="100"
          step="1"
          value={ws.verbatimness}
          onChange={(e) => setVerbatimness(Number(e.target.value))}
          className="mt-2 w-full accent-blue-600"
        />
        <div className="mt-1 flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
          <span>0% · stronger rewrite</span>
          <span>100% · copy source bullets exactly</span>
        </div>
      </div>

      {ws.error && (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {ws.error}
        </p>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- Pipeline */

function StepCandidates({ step }: { step: JevStep }) {
  const ranked = [...step.candidates].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-md bg-violet-50 font-mono text-[10px] text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
          {step.step}
        </span>
        <Badge tone={step.status === "selected" ? "emerald" : "amber"}>{step.status}</Badge>
      </div>
      <div className="space-y-1">
        {ranked.map((c) => {
          const cap = CAPABILITY_BY_ID.get(c.id);
          const pct =
            c.probability != null ? Math.round(Math.max(0, Math.min(1, c.probability)) * 100) : null;
          return (
            <div key={c.id} className={`flex items-center gap-2 ${c.filtered ? "opacity-50" : ""}`}>
              <span className="w-4 shrink-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                {c.rank ?? "-"}
              </span>
              <span className="w-28 shrink-0 truncate text-[11px] text-zinc-700 dark:text-zinc-300">
                {cap?.name ?? c.id}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct ?? 3}%` }} />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                {pct != null ? `${pct}%` : "n/a"}
              </span>
              {c.requiresConfirmation && <span className="text-[10px] text-amber-600 dark:text-amber-400">🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PipelineSection() {
  const ws = useActiveWorkspace();
  const bullets = useAgentStore((s) => s.bullets);
  const selectedNode = useAgentStore((s) => s.selectedNode);
  const selectNode = useAgentStore((s) => s.selectNode);
  const setFlowOpen = useAgentStore((s) => s.setFlowOpen);

  const bulletCount = bullets.filter((b) => b.selected).length;
  const busy = ["routing", "generating", "assessing"].includes(ws.status);
  const selected = busy ? activeNodeKey(ws) : selectedNode ?? activeNodeKey(ws);
  const node = FLOW_NODES.find((n) => n.key === selected)!;
  const st = nodeState(selected, ws, bulletCount);

  return (
    <section className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <SectionHeader
        id="pipeline"
        n={3}
        title="Pipeline"
        actions={
          <button onClick={() => setFlowOpen(true)} className={btnSecondary}>
            Expand
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800">
              Flow
            </span>
            <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
              Tailoring pipeline
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{FLOW_NODES.length} nodes</span>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex justify-center">
            <FlowDiagram
              ws={ws}
              bulletCount={bulletCount}
              selected={selected}
              onSelect={selectNode}
              size="embed"
            />
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Node detail
            </div>
            <div className="mt-1 text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              {node.title}
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {node.description}
            </p>
            <ul className="mt-3 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-700">
              {st.lines.map((line, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {line}
                </li>
              ))}
            </ul>
            {selected === "jev" && ws.jev && (
              <div className="mt-3 space-y-2">
                {ws.jev.steps.slice(0, 3).map((s) => (
                  <StepCandidates key={s.step} step={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Tailored CV */

function CVSection() {
  const ws = useActiveWorkspace();
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  const markdown = useMemo(() => {
    if (!ws.cv) return "";
    const skills = ws.cv.skills.join(" · ");
    const bullets = ws.cv.bullets
      .map((b) => `- ${b.text}${b.evidenceId ? `  \`← ${b.evidenceId}\`` : ""}`)
      .join("\n");
    const cover = ws.cv.coverNote ? `\n## Cover note\n\n> ${ws.cv.coverNote}` : "";
    return `# ${ws.cv.headline}\n\n${ws.cv.summary}\n\n**Skills:** ${skills}\n\n## Experience\n\n${bullets}\n${cover}`;
  }, [ws.cv]);

  useEffect(() => {
    if (!ws.cv) {
      setVisibleCharacters(0);
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setVisibleCharacters(markdown.length);
      return;
    }
    setVisibleCharacters(0);
    let revealed = 0;
    const timer = window.setInterval(() => {
      revealed = Math.min(markdown.length, revealed + 18);
      setVisibleCharacters(revealed);
      if (revealed >= markdown.length) window.clearInterval(timer);
    }, 35);
    return () => window.clearInterval(timer);
  }, [markdown, ws.cv]);

  const downloadPdf = useCallback(async () => {
    const state = useAgentStore.getState();
    const active = state.workspaces.find((workspace) => workspace.id === state.activeId);
    if (!active?.cv) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      const [{ pdf }, { ResumePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ResumePdf"),
      ]);
      const profile = extractProfile(state.rawCV);
      const element = createElement(ResumePdf, { profile, cv: active.cv, job: active.job });
      const blob = await pdf(
        element as unknown as Parameters<typeof pdf>[0],
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = profile.name.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_|_$/g, "");
      const safeCompany = active.job.company
        .replace(/[^\p{L}\p{N}]+/gu, "_")
        .replace(/^_|_$/g, "");
      a.download = `${safeName || "Resume"}_Resume${safeCompany ? `_${safeCompany}` : ""}.pdf`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("PDF export failed", err);
      setPdfError("The PDF could not be created. Try again after the resume finishes generating.");
    } finally {
      setPdfBusy(false);
    }
  }, []);

  useEffect(() => {
    const requestDownload = () => void downloadPdf();
    window.addEventListener("tailor:download-pdf", requestDownload);
    return () => window.removeEventListener("tailor:download-pdf", requestDownload);
  }, [downloadPdf]);

  return (
    <section className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <SectionHeader
        id="cv"
        n={4}
        title="Tailored CV"
        actions={
          <div className="flex items-center gap-2">
            {ws.usedMock && <Badge tone="amber">mock</Badge>}
            <button onClick={downloadPdf} disabled={!ws.cv || pdfBusy} className={`${btnPrimary} disabled:opacity-40`}>
              {pdfBusy ? "Building PDF…" : "Download PDF"}
            </button>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(markdown);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              disabled={!ws.cv}
              className={`${btnSecondary} disabled:opacity-40`}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        }
      />
      {ws.cv ? (
        <>
          {pdfError && <p role="alert" className="mb-3 text-xs text-rose-700 dark:text-rose-300">{pdfError}</p>}
          <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <Markdown>{markdown.slice(0, visibleCharacters)}{visibleCharacters < markdown.length ? " ▍" : ""}</Markdown>
            {visibleCharacters < markdown.length && (
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-medium text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <span className="relative size-1.5 rounded-full bg-blue-500"><span className="absolute inset-0 rounded-full bg-blue-400 animate-ping motion-reduce:animate-none" /></span>
                CV agent <span className="opacity-60">is writing</span>
              </div>
            )}
          </div>
        </>
      ) : ws.status === "generating" ? (
        <div className="relative min-h-72 overflow-hidden rounded-2xl border border-blue-200 bg-white p-6 dark:border-blue-900 dark:bg-zinc-950">
          <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-blue-50 dark:bg-blue-950/60"><div className="h-full w-1/3 animate-[loadingbar_1.8s_ease-in-out_infinite] bg-blue-500 motion-reduce:animate-none" /></div>
          <div className="mb-6 flex items-center gap-2 text-[11px] font-medium text-blue-700 dark:text-blue-300">
            <span className="relative grid size-5 place-items-center rounded-full bg-blue-50 dark:bg-blue-950"><span className="size-2 rounded-full border-2 border-blue-600 border-r-transparent animate-spin motion-reduce:animate-none" /></span>
            Agent is drafting your tailored CV
          </div>
          <div className="agent-draft-cursor absolute left-8 top-16 z-10 rounded-md bg-blue-600 px-2 py-1 text-[9px] font-semibold text-white shadow-md shadow-blue-900/20">
            <span className="mr-1">↖</span>CV agent
          </div>
          <div className="max-w-xl animate-pulse space-y-4 motion-reduce:animate-none">
            <div className="h-5 w-2/3 rounded bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-3 w-5/6 rounded bg-zinc-100 dark:bg-zinc-900" />
            <div className="flex gap-2 pt-2"><div className="h-5 w-20 rounded-full bg-blue-50 dark:bg-blue-950/70" /><div className="h-5 w-24 rounded-full bg-blue-50 dark:bg-blue-950/70" /><div className="h-5 w-16 rounded-full bg-blue-50 dark:bg-blue-950/70" /></div>
            <div className="space-y-3 pt-4"><div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-900" /><div className="h-3 w-11/12 rounded bg-zinc-100 dark:bg-zinc-900" /><div className="h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-900" /></div>
          </div>
          <p className="absolute bottom-5 right-6 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">Using selected evidence · {ws.verbatimness}% source wording</p>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Nothing generated yet. Run the agent from the Target job section.
        </p>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------- Quality */

function QualitySection() {
  const ws = useActiveWorkspace();
  const a = ws.assessment;

  return (
    <section className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <SectionHeader
        id="quality"
        n={5}
        title="Quality"
        actions={
          a ? (
            <Badge tone={a.overall >= 80 ? "emerald" : a.overall >= 65 ? "sky" : "amber"}>
              {a.overall}/100
            </Badge>
          ) : null
        }
      />
      {!a ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No assessment yet.
        </p>
      ) : (
        <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-5">
            <ScoreRing value={a.overall} label="/100" />
            <p className="text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">{a.verdict}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {a.dimensions.map((d) => (
              <div key={d.key}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-700 dark:text-zinc-300">{d.label}</span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{d.score}</span>
                </div>
                <Meter
                  value={d.score}
                  tone={d.score >= 80 ? "emerald" : d.score >= 65 ? "sky" : d.score >= 50 ? "amber" : "rose"}
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-500">{d.note}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Matched ({a.matchedKeywords.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {a.matchedKeywords.map((k, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-rose-700 dark:text-rose-400">
                Missing ({a.missingKeywords.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {a.missingKeywords.map((k, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Suggested edits
            </div>
            <ul className="space-y-1.5">
              {a.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-zinc-700 dark:text-zinc-300">
                  <span className="text-zinc-400 dark:text-zinc-600">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------- Trace */

const LEVEL_STYLE: Record<string, string> = {
  info: "text-zinc-500 dark:text-zinc-400",
  jev: "text-violet-600 dark:text-violet-400",
  llm: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-rose-600 dark:text-rose-400",
};

function TraceSection() {
  const ws = useActiveWorkspace();
  const dnd = useReorderContext();
  return (
    <section className="border-t border-zinc-200 pt-8 pb-16 dark:border-zinc-800">
      <details className="group rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {dnd && (
              <button
                {...dnd.handleProps}
                aria-label="Drag to reorder"
                title="Drag to reorder"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="-ml-1 cursor-grab touch-none rounded p-1 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-400"
              >
                <svg viewBox="0 0 10 16" className="size-3.5" fill="currentColor">
                  <circle cx="3" cy="3" r="1.1" />
                  <circle cx="7" cy="3" r="1.1" />
                  <circle cx="3" cy="8" r="1.1" />
                  <circle cx="7" cy="8" r="1.1" />
                  <circle cx="3" cy="13" r="1.1" />
                  <circle cx="7" cy="13" r="1.1" />
                </svg>
              </button>
            )}
            <span className="font-mono text-[12px] text-zinc-400 dark:text-zinc-600">
              {dnd?.n ?? 6}
            </span>
            <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Agent trace</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{ws.logs.length} events</span>
            <span className="text-[11px] text-zinc-500 transition group-open:rotate-180 dark:text-zinc-400">
              ▾
            </span>
          </div>
        </summary>
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {ws.logs.length === 0 ? (
            <p className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-600">No activity yet.</p>
          ) : (
            <div className="space-y-1">
              {ws.logs.map((l) => (
                <div key={l.id} className="rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                      {new Date(l.at).toLocaleTimeString([], {
                        hour12: false,
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className={`font-mono text-[10px] uppercase ${LEVEL_STYLE[l.level] ?? ""}`}>
                      {l.level}
                    </span>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300">{l.message}</span>
                  </div>
                  {l.detail && (
                    <p className="ml-14 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-600">
                      {l.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

/* ------------------------------------------------------------------ Header */

function DocumentHeader() {
  const ws = useActiveWorkspace();
  const bullets = useAgentStore((s) => s.bullets);
  const providers = useAgentStore((s) => s.providers);
  const selected = bullets.filter((b) => b.selected).length;
  const tone: Tone =
    ws.status === "error" ? "rose" : ws.status === "done" ? "emerald" : ws.status === "idle" ? "slate" : "sky";

  return (
    <header className="pb-2">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {ws.job.title || "Untitled job"}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="slate">{ws.job.company || "no company"}</Badge>
        {ws.job.baseRange && <Badge tone="emerald">{formatComp(ws.job.baseRange)}</Badge>}
        <Badge tone={tone}>{ws.status}</Badge>
        <Badge tone="slate">{selected} bullets</Badge>
        {providers?.jev && <Badge tone="violet">JEV {providers.jev.transport}</Badge>}
        {providers?.llm && <Badge tone="sky">LLM {providers.llm.provider}</Badge>}
      </div>
    </header>
  );
}

export function DocumentView() {
  const ws = useActiveWorkspace();
  const order = useAgentStore((s) => s.sectionOrder);
  const setSectionOrder = useAgentStore((s) => s.setSectionOrder);
  const previousFocus = useRef("");
  const { containerRef, dragIndex, overIndex, onPointerDown } = useDragReorder({
    orientation: "vertical",
    count: order.length,
    onReorder: (from, to) => setSectionOrder(move(order, from, to)),
  });

  useEffect(() => {
    const busy = ["routing", "generating", "assessing"].includes(ws.status);
    if (ws.status === "done") {
      const focusKey = `${ws.id}:complete`;
      if (previousFocus.current !== focusKey) {
        previousFocus.current = focusKey;
        document.getElementById("quality")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    if (!busy) {
      previousFocus.current = "";
      return;
    }
    const step = activeNodeKey(ws);
    const focusKey = `${ws.id}:${step}`;
    if (previousFocus.current === focusKey) return;
    previousFocus.current = focusKey;
    // Keep the streamed draft visible while the assessment runs; advance to
    // the quality report only once the full pipeline has finished.
    const target = step === "generate" || step === "assess" ? "cv" : "pipeline";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [ws.id, ws.status, ws.activeCapability]);

  const registry: Record<string, React.ReactNode> = {
    resume: <ResumeSection />,
    target: <TargetSection />,
    pipeline: <PipelineSection />,
    cv: <CVSection />,
    quality: <QualitySection />,
    trace: <TraceSection />,
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <DocumentHeader />
        <AgentActivity ws={ws} />
        <div ref={containerRef}>
          {order.map((id, i) => (
            <ReorderContext.Provider
              key={id}
              value={{ index: i, n: i + 1, handleProps: { onPointerDown: onPointerDown(i) } }}
            >
              <div
                className={`rounded-xl transition ${
                  dragIndex === i ? "opacity-40" : ""
                } ${
                  overIndex === i && dragIndex !== i ? "ring-2 ring-blue-400/70" : ""
                }`}
              >
                {registry[id] ?? null}
              </div>
            </ReorderContext.Provider>
          ))}
        </div>
      </div>
    </main>
  );
}
