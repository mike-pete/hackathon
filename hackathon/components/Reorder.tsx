"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

export type Orientation = "vertical" | "horizontal";

export type ReorderHandleProps = {
  onPointerDown: (e: ReactPointerEvent) => void;
};

/**
 * Pointer-based drag reorder. Works for mouse, trackpad and touch, and is far
 * more predictable than HTML5 drag-and-drop.
 *
 * Attach `containerRef` to the list container (its children are the items in
 * order), `onPointerDown(index)` to each grab handle, and use `dragIndex` /
 * `overIndex` for visual feedback.
 */
export function useDragReorder({
  orientation,
  count,
  onReorder,
}: {
  orientation: Orientation;
  count: number;
  onReorder: (from: number, to: number) => void;
}): {
  containerRef: RefObject<HTMLDivElement | null>;
  dragIndex: number | null;
  overIndex: number | null;
  onPointerDown: (index: number) => (e: ReactPointerEvent) => void;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const indexAt = (clientX: number, clientY: number): number | null => {
    const el = containerRef.current;
    if (!el) return null;
    const children = Array.from(el.children).slice(0, count) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const r = children[i].getBoundingClientRect();
      const inside =
        orientation === "vertical"
          ? clientY >= r.top && clientY <= r.bottom
          : clientX >= r.left && clientX <= r.right;
      if (inside) return i;
    }
    return null;
  };

  const finish = () => {
    const from = dragRef.current;
    const to = overRef.current;
    if (from != null && to != null && from !== to) onReorder(from, to);
    dragRef.current = null;
    overRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const onPointerDown = (index: number) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = index;
    overRef.current = index;
    setDragIndex(index);
    setOverIndex(index);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragRef.current == null) return;
    const i = indexAt(e.clientX, e.clientY);
    if (i != null && i !== overRef.current) {
      overRef.current = i;
      setOverIndex(i);
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (dragRef.current == null) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    finish();
  };

  // Return move/up handlers too by attaching them where the handle is rendered.
  return {
    containerRef,
    dragIndex,
    overIndex,
    onPointerDown: (index: number) => (e: ReactPointerEvent) => {
      onPointerDown(index)(e);
      const target = e.currentTarget as HTMLElement;
      const move = (ev: PointerEvent) => onPointerMove(ev as unknown as ReactPointerEvent);
      const up = (ev: PointerEvent) => {
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        target.removeEventListener("pointercancel", up);
        onPointerUp(ev as unknown as ReactPointerEvent);
      };
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      target.addEventListener("pointercancel", up);
    },
  };
}

export function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Lets a section header render a drag handle without prop drilling. */
export const ReorderContext = createContext<{
  index: number;
  n: number;
  handleProps: ReorderHandleProps;
} | null>(null);

export const useReorderContext = () => useContext(ReorderContext);
