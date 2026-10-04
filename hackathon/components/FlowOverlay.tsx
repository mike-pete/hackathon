"use client";

import { useEffect } from "react";
import { activeNodeKey, FLOW_NODES, nodeState } from "@/lib/pipeline";
import { useAgentStore, useActiveWorkspace } from "@/lib/store";
import { FlowDiagram } from "./FlowDiagram";
import { SplitPane } from "./SplitPane";

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

  useEffect(() => {
    if (flowOpen && !selectedNode) selectNode(activeNodeKey(ws));
  }, [flowOpen, selectedNode, ws, selectNode]);

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
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl dark:bg-black/95">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800">
            Flow
          </span>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Tailoring pipeline
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {FLOW_NODES.length} nodes
          </span>
          <button
            onClick={() => setFlowOpen(false)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </header>

      <SplitPane
        side="right"
        storageKey="tailor.tourWidth"
        defaultSize={416}
        min={300}
        max={680}
        className="min-h-0 flex-1"
        a={
          <div className="h-full w-full overflow-y-auto p-8">
            <FlowDiagram
              ws={ws}
              bulletCount={bulletCount}
              selected={selected}
              onSelect={selectNode}
              size="full"
            />
          </div>
        }
        b={
          <aside className="flex h-full w-full flex-col border-l border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tour
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tailoring pipeline
              </span>
            </div>

            <ol className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {FLOW_NODES.map((n, i) => {
                const st = nodeState(n.key, ws, bulletCount);
                const isActive = n.key === selected;
                return (
                  <li key={n.key} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < FLOW_NODES.length - 1 && (
                      <span className="absolute left-[13px] top-7 h-full w-px bg-zinc-200 dark:bg-zinc-800" />
                    )}
                    <span
                      className={`z-10 grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1 ring-inset ${
                        isActive
                          ? "bg-blue-600 text-white ring-blue-600"
                          : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <button onClick={() => selectNode(n.key)} className="min-w-0 flex-1 text-left">
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Step {i + 1} of {FLOW_NODES.length}
                      </div>
                      <div
                        className={`text-[15px] font-semibold ${
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {n.title}
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {n.description}
                      </p>
                      {st.lines.length > 0 && (
                        <ul className="mt-2 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
                          {st.lines.map((line, li) => (
                            <li key={li} className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
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

            <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <button
                onClick={() => selectNode(FLOW_NODES[0].key)}
                className="flex w-full items-center justify-between rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-[12px] text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
              >
                <span>End of tour</span>
                <span>↑ Back to step 1</span>
              </button>
            </div>
          </aside>
        }
      />

      <footer className="flex items-center justify-between border-t border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
          Select a node to explore its detail · drag the divider to resize
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            disabled={idx <= 0}
            className="grid size-7 place-items-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            ↑
          </button>
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {idx + 1}/{FLOW_NODES.length}
          </span>
          <button
            onClick={() => step(1)}
            disabled={idx >= FLOW_NODES.length - 1}
            className="grid size-7 place-items-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            ↓
          </button>
        </div>
      </footer>
    </div>
  );
}
