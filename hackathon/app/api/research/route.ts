import { normalizeJobs, researchJobs } from "@/lib/research";

// Deep search plus several people searches can take a while per job.
export const maxDuration = 300;

// POST { job } | { jobs: [...] } | [...]  (optional "refresh": true to bypass the cache)
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const payload = body as { job?: unknown; jobs?: unknown; refresh?: boolean };
  let jobs;
  try {
    jobs = normalizeJobs(payload.job ?? payload.jobs ?? body);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }

  const results = await researchJobs(jobs, { refresh: payload.refresh === true });
  return Response.json({ results });
}
