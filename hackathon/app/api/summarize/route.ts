import jobs from "../../jobs";
import { getGatewayClient, GATEWAY_MODEL, isGatewayConfigured } from "../../gateway";

// Streams a short summary of a job description via the Neon AI Gateway.
// POST { jobId } -> text/plain stream of the summary as it's generated.
export async function POST(request: Request) {
  if (!isGatewayConfigured()) {
    return new Response(
      "Neon AI Gateway is not configured. Set NEON_AI_GATEWAY_TOKEN and NEON_AI_GATEWAY_BASE_URL in .env.local.",
      { status: 503 },
    );
  }

  const { jobId } = (await request.json()) as { jobId?: number };
  const job = jobId != null ? jobs[jobId] : undefined;
  if (!job) {
    return new Response(`Unknown job: ${jobId}`, { status: 404 });
  }

  const client = getGatewayClient();
  const stream = await client.chat.completions.create({
    model: GATEWAY_MODEL,
    max_tokens: 220,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You summarize job postings for a candidate. Reply with exactly 3 short bullet points covering the role, key responsibilities, and standout requirements. Be concise and specific. No preamble.",
      },
      {
        role: "user",
        content: `Summarize this job posting.\n\nCompany: ${job.company}\nTitle: ${job.title}\n\n${job.description.trim()}`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
