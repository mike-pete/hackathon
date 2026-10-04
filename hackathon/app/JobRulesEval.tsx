"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useRulesStore } from "./rules-store";

type RuleResult = {
  id: string;
  key: string;
  pass: boolean;
  probability: number;
};

// Tracks whether the persisted rules store has rehydrated from localStorage, so
// we don't evaluate against an empty list on the first client render.
function useHydrated() {
  return useSyncExternalStore(
    (cb) => useRulesStore.persist.onFinishHydration(cb),
    () => useRulesStore.persist.hasHydrated(),
    () => false,
  );
}

// Runs the candidate's rules against a job via jev and lists the verdicts.
// Mount with a `key` tied to the job id so switching jobs re-evaluates.
export default function JobRulesEval({ jobId }: { jobId: number }) {
  const rules = useRulesStore((s) => s.rules);
  const hydrated = useHydrated();

  const activeRules = useMemo(
    () => rules.filter((r) => r.key.trim() && r.value.trim()),
    [rules],
  );

  const [results, setResults] = useState<RuleResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || activeRules.length === 0) return;

    const controller = new AbortController();

    fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, rules: activeRules }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to evaluate rules");
        if (!controller.signal.aborted) setResults(data.results as RuleResult[]);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to evaluate rules");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [jobId, activeRules, hydrated]);

  if (!hydrated) return null;

  const hasRules = activeRules.length > 0;

  return (
    <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h3 className="text-lg font-semibold">How this job fits your rules</h3>

      {!hasRules ? (
        <p className="mt-3 text-sm text-zinc-500">
          No rules yet.{" "}
          <Link
            href="/rules"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Add some rules
          </Link>{" "}
          to see how this job measures up.
        </p>
      ) : error ? (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{error}</p>
      ) : loading && !results?.length ? (
        <p className="mt-3 text-sm text-zinc-500">Evaluating rules…</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {results?.map((result) => (
            <li
              key={result.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  result.pass
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                }`}
              >
                {result.pass ? (
                  <IconCheck size={15} stroke={2.5} />
                ) : (
                  <IconX size={15} stroke={2.5} />
                )}
              </span>
              <span className="flex-1 text-sm font-medium">{result.key}</span>
              <span className="text-xs tabular-nums text-zinc-500">
                {Math.round(result.probability * 100)}% fit
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
