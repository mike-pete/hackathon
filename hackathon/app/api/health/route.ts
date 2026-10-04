import { jevHealth } from "@/lib/jev";
import { llmHealth } from "@/lib/llm";
import type { ProviderStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [llm, jev] = await Promise.all([llmHealth(), jevHealth()]);
  const payload: ProviderStatus = { llm, jev };
  return Response.json(payload);
}
