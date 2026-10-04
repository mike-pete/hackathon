"use client";

import { useEffect, useRef } from "react";
import { useAgentStore } from "@/lib/store";
import type { LogLevel } from "@/lib/types";
import { Card } from "./ui";

const LEVEL_STYLE: Record<LogLevel, string> = {
  info: "text-zinc-400",
  jev: "text-violet-300",
  llm: "text-emerald-300",
  warn: "text-amber-300",
  error: "text-rose-300",
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  info: "info",
  jev: "jev",
  llm: "llm",
  warn: "warn",
  error: "err",
};

export function PipelineLog() {
  const logs = useAgentStore((s) => s.logs);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card
      title="Agent trace"
      subtitle="Every capability call, in order"
      right={<span className="font-mono text-[10px] text-zinc-600">{logs.length} events</span>}
      className="min-h-[12rem]"
      bodyClassName="overflow-y-auto p-2 max-h-64"
    >
      {logs.length === 0 ? (
        <p className="px-2 py-6 text-center text-xs text-zinc-600">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-1">
          {logs.map((l) => (
            <div key={l.id} className="rounded-lg px-2 py-1.5 hover:bg-white/[0.03]">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-zinc-600">
                  {new Date(l.at).toLocaleTimeString([], {
                    hour12: false,
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase ${LEVEL_STYLE[l.level]}`}
                >
                  {LEVEL_LABEL[l.level]}
                </span>
                <span className="text-[11px] text-zinc-300">{l.message}</span>
              </div>
              {l.detail && (
                <p className="ml-14 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-600">
                  {l.detail}
                </p>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </Card>
  );
}
