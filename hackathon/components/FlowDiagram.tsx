"use client";

import { FLOW_NODES, nodeState, type NodeStatus } from "@/lib/pipeline";
import type { Workspace } from "@/lib/types";

const DOT: Record<NodeStatus, string> = {
  done: "bg-emerald-400",
  running: "bg-sky-400 animate-pulse",
  skipped: "bg-zinc-500",
  idle: "bg-zinc-600",
  error: "bg-rose-400",
};

const EDGE_LABEL: Record<string, string> = {
  "jev->research": "when selected",
  "research->generate": "after research",
};

function Connector({
  height,
  label,
}: {
  height: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-px bg-white/15 ${height}`} />
      {label ? (
        <span className="my-1 rounded-full border border-white/10 bg-[#0b1018] px-2 py-0.5 text-[10px] text-zinc-500">
          {label}
        </span>
      ) : null}
      {label ? <div className={`w-px bg-white/15 ${height}`} /> : null}
    </div>
  );
}

function FlowNodeCard({
  nodeKey,
  selected,
  onSelect,
  ws,
  bulletCount,
  size,
}: {
  nodeKey: string;
  selected: boolean;
  onSelect: (key: string) => void;
  ws: Workspace;
  bulletCount: number;
  size: "embed" | "full";
}) {
  const node = FLOW_NODES.find((n) => n.key === nodeKey)!;
  const st = nodeState(node.key, ws, bulletCount);

  return (
    <button
      type="button"
      onClick={() => onSelect(node.key)}
      className={`group relative w-full text-left transition ${
        size === "full" ? "max-w-[24rem] px-4 py-3" : "max-w-[21rem] px-3.5 py-2.5"
      } ${
        node.terminal ? "rounded-full" : "rounded-xl"
      } border ${
        node.conditional ? "border-dashed" : ""
      } ${
        selected
          ? "border-sky-400/50 bg-sky-400/10 ring-2 ring-sky-400/60"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`size-1.5 shrink-0 rounded-full ${DOT[st.status]}`} />
        <span className={`font-medium text-zinc-100 ${size === "full" ? "text-[13px]" : "text-[12px]"}`}>
          {node.title}
        </span>
      </div>
      <div className="mt-0.5 pl-3.5 text-[10px] uppercase tracking-wide text-zinc-500">
        {node.kind}
        {node.conditional ? " · conditional" : ""}
      </div>
      {size === "full" && st.lines[0] ? (
        <div className="mt-1.5 line-clamp-2 pl-3.5 text-[11px] leading-relaxed text-zinc-400">
          {st.lines[0]}
        </div>
      ) : null}
    </button>
  );
}

export function FlowDiagram({
  ws,
  bulletCount,
  selected,
  onSelect,
  size = "embed",
}: {
  ws: Workspace;
  bulletCount: number;
  selected: string | null;
  onSelect: (key: string) => void;
  size?: "embed" | "full";
}) {
  const gap = size === "full" ? "h-6" : "h-4";
  return (
    <div className="flex flex-col items-center">
      {FLOW_NODES.map((node, i) => {
        const prev = FLOW_NODES[i - 1];
        const edge = prev ? `${prev.key}->${node.key}` : "";
        return (
          <div key={node.key} className="flex w-full flex-col items-center">
            {i > 0 && <Connector height={gap} label={EDGE_LABEL[edge]} />}
            <FlowNodeCard
              nodeKey={node.key}
              selected={selected === node.key}
              onSelect={onSelect}
              ws={ws}
              bulletCount={bulletCount}
              size={size}
            />
            {node.key === "jev" && (
              <span className="mt-1 text-[10px] text-zinc-600">
                otherwise, skip research
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
