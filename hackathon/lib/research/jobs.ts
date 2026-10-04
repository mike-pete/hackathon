import { createHash } from "node:crypto";
import type { Job } from "./types";

type Raw = Record<string, unknown>;

function pick(raw: Raw, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

// The job listing JSON schema is not fixed yet, so accept the common field names.
export function normalizeJob(input: unknown): Job {
  if (!input || typeof input !== "object") throw new Error("Job must be an object");
  const raw = input as Raw;

  const companyObj =
    raw.company && typeof raw.company === "object" ? (raw.company as Raw) : undefined;

  const title = pick(raw, ["title", "jobTitle", "job_title", "position", "role", "name"]);
  const company =
    (companyObj && pick(companyObj, ["name", "companyName", "company_name"])) ??
    pick(raw, ["company", "companyName", "company_name", "employer", "organization"]);

  if (!title || !company) {
    throw new Error(`Job needs a title and a company, got: ${JSON.stringify(raw).slice(0, 200)}`);
  }

  const companyUrl =
    (companyObj && pick(companyObj, ["website", "url", "domain"])) ??
    pick(raw, ["companyUrl", "company_url", "companyWebsite", "company_website", "companyDomain", "company_domain"]);

  const id =
    pick(raw, ["id", "jobId", "job_id"]) ??
    createHash("sha1").update(`${company}|${title}`).digest("hex").slice(0, 12);

  return {
    id: String(id),
    title,
    company,
    companyUrl,
    location: pick(raw, ["location", "jobLocation", "job_location", "city"]),
    description: pick(raw, ["description", "jobDescription", "job_description", "summary", "details"]),
    url: pick(raw, ["url", "link", "jobUrl", "job_url", "applyUrl", "apply_url"]),
  };
}

export function normalizeJobs(input: unknown): Job[] {
  const list = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as Raw).jobs)
      ? ((input as Raw).jobs as unknown[])
      : [input];
  return list.map(normalizeJob);
}
