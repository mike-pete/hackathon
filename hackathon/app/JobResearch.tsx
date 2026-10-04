"use client";

import { useState, useEffect } from "react";
import { researchPerson, type PersonProfile } from "./actions";
import PersonCard from "./PersonCard";

// Researches relevant people for a job. Mount this with a `key` tied to the
// job id so selecting a different job remounts it and resets state cleanly.
export default function JobResearch({ company }: { company: string }) {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [isResearching, setIsResearching] = useState(true);

  useEffect(() => {
    let cancelled = false;
    researchPerson().then((person) => {
      if (cancelled) return;
      setPeople((prev) => [...prev, person]);
      setIsResearching(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">People to reach out to</h3>
        {isResearching && (
          <span className="text-sm text-zinc-500">Researching…</span>
        )}
      </div>
      {people.length > 0 ? (
        <div className="mt-5 flex flex-col gap-4">
          {people.map((person, i) => (
            <PersonCard key={i} person={person} />
          ))}
        </div>
      ) : isResearching ? (
        <p className="mt-4 text-sm text-zinc-500">
          Finding relevant people at {company}…
        </p>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No people found yet.</p>
      )}
    </section>
  );
}
