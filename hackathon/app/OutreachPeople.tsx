"use client";

import { useEffect, useState } from "react";
import {
  draftOutreachEmail,
  draftOutreachEmails,
  getOutreachState,
  type OutreachState,
  type PersonProfile,
} from "./actions";
import PersonCard from "./PersonCard";

type DraftStatus = "drafting" | "drafted" | { error: string };

// Researched people with buttons to draft an outreach email to each of them
// in the AgentMail inbox. Drafts are never sent from the app.
export default function OutreachPeople({ jobId, people }: { jobId: number; people: PersonProfile[] }) {
  const [state, setState] = useState<OutreachState | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, DraftStatus>>({});

  useEffect(() => {
    let cancelled = false;
    getOutreachState(jobId)
      .then((result) => {
        if (cancelled) return;
        setState(result);
        setStatus(Object.fromEntries(result.drafted.map((url) => [url, "drafted" as const])));
      })
      .catch((err) => !cancelled && setSetupError(err?.message ?? "Could not load drafts"));
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const draft = async (profileUrl: string) => {
    setStatus((s) => ({ ...s, [profileUrl]: "drafting" }));
    try {
      await draftOutreachEmail(jobId, profileUrl);
      setStatus((s) => ({ ...s, [profileUrl]: "drafted" }));
    } catch (err) {
      setStatus((s) => ({ ...s, [profileUrl]: { error: err instanceof Error ? err.message : "Failed to draft" } }));
    }
  };

  const draftAll = async (profileUrls: string[]) => {
    setStatus((s) => ({ ...s, ...Object.fromEntries(profileUrls.map((url) => [url, "drafting" as const])) }));
    let errors: Record<string, string>;
    try {
      errors = await draftOutreachEmails(jobId, profileUrls);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to draft";
      errors = Object.fromEntries(profileUrls.map((url) => [url, error]));
    }
    setStatus((s) => ({
      ...s,
      ...Object.fromEntries(profileUrls.map((url) => [url, errors[url] ? { error: errors[url] } : ("drafted" as const)])),
    }));
  };

  const undrafted = people.filter((p) => status[p.profileUrl] !== "drafted" && status[p.profileUrl] !== "drafting");

  return (
    <>
      {setupError ? (
        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">{setupError}</p>
      ) : (
        state && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
            <p>
              Emails are saved as drafts in {state.inbox} and never sent.{" "}
              {state.recipients.live
                ? "Drafts are addressed to the real contacts."
                : state.recipients.testRecipient
                  ? `Test mode: drafts are addressed to ${state.recipients.testRecipient}.`
                  : "Test mode: drafts have no recipient."}
            </p>
            {undrafted.length > 0 && (
              <button
                type="button"
                onClick={() => draftAll(undrafted.map((p) => p.profileUrl))}
                className="rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
              >
                Draft all ({undrafted.length})
              </button>
            )}
          </div>
        )
      )}

      <div className="mt-5 flex flex-col gap-4">
        {people.map((person) => {
          const s = status[person.profileUrl];
          return (
            <PersonCard
              key={person.profileUrl}
              person={person}
              action={
                state &&
                (s === "drafted" ? (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Draft saved</span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled={s === "drafting"}
                      onClick={() => draft(person.profileUrl)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      {s === "drafting" ? "Drafting…" : "Draft email"}
                    </button>
                    {typeof s === "object" && (
                      <span className="max-w-48 text-right text-xs text-amber-600 dark:text-amber-400">{s.error}</span>
                    )}
                  </div>
                ))
              }
            />
          );
        })}
      </div>
    </>
  );
}
