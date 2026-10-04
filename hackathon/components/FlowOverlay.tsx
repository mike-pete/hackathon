"use client";

import { useEffect } from "react";
import { activeNodeKey, FLOW_NODES, nodeState } from "@/lib/pipeline";
import { useAgentStore, useActiveWorkspace } from "@/lib/store";
import { FlowDiagram } from "./FlowDiagram";

export function FlowOverlay() {
  const ws = useActiveWorkspace();
  const bullets = useAgentStore((s) => s.bullets);
  const flowOpen = useAgentStore((s) => s.flowOpen);
  const selectedNode = useAgentStore((s) => s.selectedNode);
  const selectNode = useAgentStore((s) => s.selectNode);
  const setFlowOpen = useAgentStore((s) => s.setFlowOpen);

  const bulletCount = bullets.filter((b) => b.selected).length;
  const selected = selectedNode ?? activeNodeKey(ws);
  const idx = Math.max(
    0,
    FLOW_NODES.findIndex((n) => n.key === selected),
  );

  // Auto-focus the node the pipeline is on when opening.
  useEffect(() => {
    if (flowOpen && !selectedNode) selectNode(activeNodeKey(ws));
  }, [flowOpen, selectedNode, ws, selectNode]);

  // Escape closes, arrows step through the tour.
  useEffect(() => {
    if (!flowOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFlowOpen(false);
      if (e.key === "ArrowDown")
        selectNode(FLOW_NODES[Math.min(idx + 1, FLOW_NODES.length - 1)].key);
      if (e.key === "ArrowUp") selectNode(FLOW_NODES[Math.max(idx - 1, 0)].key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flowOpen, idx, selectNode, setFlowOpen]);

  if (!flowOpen) return null;

  const step = (delta: number) =>
    selectNode(FLOW_NODES[Math.min(Math.max(idx + delta, 0), FLOW_NODES.length - 1)].key);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05070c]/95 backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-inset ring-white/10">
            Flow
          </span>
          <h2 className="text-sm font-semibold text-zinc-100">Tailoring pipeline</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500">{FLOW_NODES.length} nodes</span>
          <button
            onClick={() => setFlowOpen(false)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 overflow-y-auto p-8">
          <FlowDiagram
            ws={ws}
            bulletCount={bulletCount}
            selected={selected}
            onSelect={selectNode}
            size="full"
          />
        </div>

        <aside className="flex w-[26rem] shrink-0 flex-col border-l border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Tour
            </span>
            <span className="text-[11px] text-zinc-500">Tailoring pipeline</span>
          </div>

          <ol className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {FLOW_NODES.map((n, i) => {
              const st = nodeState(n.key, ws, bulletCount);
              const isActive = n.key === selected;
              return (
                <li key={n.key} className="relative flex gap-3 pb-6 last:pb-0">
                  {i < FLOW_NODES.length - 1 && (
                    <span className="absolute left-[13px] top-7 h-full w-px bg-white/10" />
                  )}
                  <span
                    className={`z-10 grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1 ring-inset ${
                      isActive
                        ? "bg-sky-400/20 text-sky-200 ring-sky-400/40"
                        : "bg-white/5 text-zinc-500 ring-white/10"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <button
                    onClick={() => selectNode(n.key)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                      Step {i + 1} of {FLOW_NODES.length}
                    </div>
                    <div
                      className={`text-[15px] font-semibold ${
                        isActive ? "text-sky-200" : "text-zinc-200"
                      }`}
                    >
                      {n.title}
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
                      {n.description}
                    </p>
                    {st.lines.length > 0 && (
                      <ul className="mt-2 space-y-0.5 border-l border-white/10 pl-3">
                        {st.lines.map((line, li) => (
                          <li key={li} className="text-[11px] leading-relaxed text-zinc-500">
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="border-t border-white/10 px-5 py-3">
            <button
              onClick={() => selectNode(FLOW_NODES[0].key)}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-white/15 px-3 py-2 text-[12px] text-zinc-400 transition hover:border-white/30 hover:text-zinc-200"
            >
              <span>End of tour</span>
              <span>↑ Back to step 1</span>
            </button>
          </div>
        </aside>
      </div>

      <footer className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
        <span className="text-[11px] text-zinc-600">
          Select a node to explore its detail
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            disabled={idx <= 0}
            className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            ↑
          </button>
          <span className="font-mono text-[11px] text-zinc-400">
            {idx + 1}/{FLOW_NODES.length}
          </span>
          <button
            onClick={() => step(1)}
            disabled={idx >= FLOW_NODES.length - 1}
            className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            ↓
          </button>
        </div>
      </footer>
    </div>
  );
}
