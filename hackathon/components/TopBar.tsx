"use client";

import { useEffect } from "react";
import { useAgentStore } from "@/lib/store";
import { Badge, Dot, type Tone } from "./ui";

export function TopBar() {
  const providers = useAgentStore((s) => s.providers);
  const refreshProviders = useAgentStore((s) => s.refreshProviders);
  const hydrateSample = useAgentStore((s) => s.hydrateSample);
  const clearAll = useAgentStore((s) => s.clearAll);
  const status = useAgentStore((s) => s.status);

  useEffect(() => {
    refreshProviders();
  }, [refreshProviders]);

  const jevTone: Tone = providers?.jev.available ? "violet" : "rose";
  const llmTone: Tone = providers?.llm.available ? "emerald" : "amber";

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#070b12]/85 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/30 to-sky-500/20 text-emerald-300 ring-1 ring-inset ring-white/10">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
            <path d="M15 3.5V8h4M8.5 13h7M8.5 16.5h5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
              Tailor
            </h1>
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 ring-1 ring-inset ring-white/10">
              personal CV agent
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Big CV In, tailored application out. Capabilities routed by JevRouter.
          </p>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Badge tone={jevTone}>
          <Dot tone={jevTone} />
          JEV {providers?.jev.transport ?? "…"}
          <span className="text-zinc-500">{providers?.jev.provider ?? ""}</span>
        </Badge>
        <Badge tone={llmTone}>
          <Dot tone={llmTone} />
          LLM {providers?.llm.provider ?? "…"}
          <span className="max-w-[9rem] truncate text-zinc-500">
            {providers?.llm.model ?? ""}
          </span>
        </Badge>
        {status !== "idle" && (
          <Badge tone={status === "error" ? "rose" : status === "done" ? "emerald" : "sky"}>
            <Dot tone={status === "error" ? "rose" : status === "done" ? "emerald" : "sky"} />
            {status}
          </Badge>
        )}
        <button
          onClick={hydrateSample}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
        >
          Load sample
        </button>
        <button
          onClick={clearAll}
          className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
        >
          Reset
        </button>
      </div>
    </header>
  );
}
