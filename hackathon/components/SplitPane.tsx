"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

/**
 * Two-pane split with a draggable divider. The resizable pane sits on `side`
 * and its width is persisted to localStorage.
 */
export function SplitPane({
  side,
  storageKey,
  defaultSize,
  min = 160,
  max = 560,
  a,
  b,
  className = "",
  fixedClassName = "",
}: {
  side: "left" | "right";
  storageKey: string;
  defaultSize: number;
  min?: number;
  max?: number;
  a: ReactNode;
  b: ReactNode;
  className?: string;
  fixedClassName?: string;
}) {
  const [size, setSize] = useState(defaultSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(size);
  const dragging = useRef(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(stored) && stored >= min && stored <= max) {
      // Restore the persisted width after mount to avoid an SSR mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize(stored);
    }
  }, [storageKey, min, max]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    sizeRef.current = size;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const next = side === "left" ? e.clientX - rect.left : rect.right - e.clientX;
    const clamped = Math.min(max, Math.max(min, next));
    sizeRef.current = clamped;
    setSize(clamped);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.localStorage.setItem(storageKey, String(Math.round(sizeRef.current)));
  };

  const divider = (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize"
      className={`group relative flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-transparent ${fixedClassName}`}
    >
      <span className="h-full w-px bg-zinc-200 transition group-hover:bg-blue-400 dark:bg-zinc-800 dark:group-hover:bg-blue-500" />
    </div>
  );

  const fixed = (content: ReactNode) => (
    <div style={{ width: size }} className={`flex min-h-0 shrink-0 ${fixedClassName}`}>
      {content}
    </div>
  );
  const flexible = (content: ReactNode) => (
    <div className="flex min-h-0 min-w-0 flex-1">{content}</div>
  );

  return (
    <div ref={containerRef} className={`flex min-h-0 flex-1 ${className}`}>
      {side === "left" ? (
        <>
          {fixed(a)}
          {divider}
          {flexible(b)}
        </>
      ) : (
        <>
          {flexible(a)}
          {divider}
          {fixed(b)}
        </>
      )}
    </div>
  );
}
