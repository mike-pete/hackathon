"use client";

import { useState, useEffect } from "react";
import { summarizeJob } from "./actions";

// Auto-summarizes a job via the Neon AI Gateway. Mount with a `key` tied to the
// job id so selecting a different job remounts and re-summarizes.
export default function JobSummary({ jobId }: { jobId: number }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    summarizeJob(jobId)
      .then((text) => {
        if (cancelled) return;
        setSummary(text);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to summarize");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return (
    <section className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          AI Summary
        </h3>
        {loading && <span className="text-sm text-zinc-500">Summarizing…</span>}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {error}
        </p>
      ) : summary ? (
        <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
          {summary}
        </div>
      ) : (
        !loading && (
          <p className="mt-3 text-sm text-zinc-500">No summary available.</p>
        )
      )}
    </section>
  );
}
