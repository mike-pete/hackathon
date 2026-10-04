import "server-only";
import OpenAI from "openai";

// Shared client for the Neon AI Gateway. The gateway is OpenAI-SDK compatible,
// so we just point the SDK at the branch endpoint and authenticate with a Neon
// bearer token (scope: ai_gateway:invoke).
//
// Required env vars (set in .env.local):
//   NEON_AI_GATEWAY_TOKEN     Neon credential, e.g. nt_live_...
//   NEON_AI_GATEWAY_BASE_URL  Branch host, e.g. https://br-...-api.ai.<cell>.<region>.aws.neon.tech
//
// Optional:
//   NEON_AI_GATEWAY_MODEL     Model id (defaults to gpt-5-mini)

export const GATEWAY_MODEL = process.env.NEON_AI_GATEWAY_MODEL ?? "gpt-5-mini";

export function isGatewayConfigured() {
  return Boolean(
    process.env.NEON_AI_GATEWAY_TOKEN && process.env.NEON_AI_GATEWAY_BASE_URL,
  );
}

export function getGatewayClient() {
  const token = process.env.NEON_AI_GATEWAY_TOKEN;
  const baseUrl = process.env.NEON_AI_GATEWAY_BASE_URL;

  if (!token || !baseUrl) {
    throw new Error(
      "Neon AI Gateway is not configured. Set NEON_AI_GATEWAY_TOKEN and NEON_AI_GATEWAY_BASE_URL in .env.local.",
    );
  }

  return new OpenAI({
    apiKey: token,
    baseURL: `${baseUrl.replace(/\/$/, "")}/v1`,
  });
}
