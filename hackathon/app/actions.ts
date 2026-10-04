"use server";

import { getPeopleStatus } from "@/lib/research";
import { toResearchJob } from "./researchJobs";

export type PersonProfile = {
  name: string;
  profilePicUrl: string;
  jobTitle: string;
  // Not every person has a findable work email; fall back to profileUrl.
  email?: string;
  profileUrl: string;
  description: string;
};

// Placeholder avatar with the person's initials when no profile photo is found.
function initialsAvatar(name: string) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#e4e4e7"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#52525b">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export type PeopleResearch =
  | { state: "queued" | "running"; startedAt: number }
  | { state: "done"; people: PersonProfile[] }
  | { state: "error"; error: string };

// Polled by the people section. The research itself runs on Exa, started at
// server boot (instrumentation.ts) or here if the job has no run yet.
export async function getPeopleResearch(jobId: number): Promise<PeopleResearch> {
  const status = await getPeopleStatus(toResearchJob(jobId));
  if (status.state !== "done") return status;

  return {
    state: "done",
    people: status.contacts.map((c) => ({
      name: c.name,
      profilePicUrl: c.photoUrl ?? initialsAvatar(c.name),
      jobTitle: c.title ?? "",
      email: c.email,
      profileUrl: c.profileUrl,
      description: [c.reason, c.hooks].filter(Boolean).join(" "),
    })),
  };
}
