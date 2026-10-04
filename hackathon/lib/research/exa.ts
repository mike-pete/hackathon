import Exa from "exa-js";

let client: Exa | undefined;

export function exa(): Exa {
  if (!process.env.EXA_API_KEY) throw new Error("EXA_API_KEY is not set (add it to .env.local)");
  client ??= new Exa(process.env.EXA_API_KEY);
  return client;
}

export function domainOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
