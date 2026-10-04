import { runJevPlan } from "@/lib/jev";
import type { JevPlan } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { intent?: string; jobTitle?: string; jobCompany?: string; steps?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const plan: JevPlan = await runJevPlan({
    intent: body.intent || "",
    jobTitle: body.jobTitle || "",
    jobCompany: body.jobCompany || "",
    steps: body.steps ?? 3,
  });

  return Response.json(plan);
}
