"use client";

import { useEffect } from "react";
import { useAgentStore } from "@/lib/store";

/** Seeds the demo with the sample Big CV on first load. */
export function Bootstrap() {
  const rawCV = useAgentStore((s) => s.rawCV);
  const hydrateSample = useAgentStore((s) => s.hydrateSample);

  useEffect(() => {
    if (!rawCV) hydrateSample();
  }, [rawCV, hydrateSample]);

  return null;
}
