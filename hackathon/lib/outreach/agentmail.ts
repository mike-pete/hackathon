import "server-only";
import { createHash } from "node:crypto";

// Minimal AgentMail client for outreach drafts.
//
// Safety: this module can only create and list drafts. It deliberately has no
// way to send a draft or a message, and never sets `send_at` (AgentMail sends
// scheduled drafts on its own). On top of that, real contact addresses only go
// into `to` when OUTREACH_LIVE_RECIPIENTS=true; otherwise drafts are addressed
// to OUTREACH_TEST_RECIPIENT (or nobody), so even pressing "send" in the
// AgentMail console can't reach the people we researched.
//
// Env (set in .env.local):
//   AGENTMAIL_API_KEY          AgentMail API key
//   AGENTMAIL_INBOX_ID         Inbox to draft in, e.g. name@agentmail.to
//   OUTREACH_TEST_RECIPIENT    Optional: address drafts go to while not live
//   OUTREACH_LIVE_RECIPIENTS   "true" to address drafts to the real contacts

const BASE_URL = "https://api.agentmail.to/v0";
const OUTREACH_LABEL = "outreach";

export type OutreachMode =
  | { live: true }
  | { live: false; testRecipient?: string };

export function outreachMode(): OutreachMode {
  if (process.env.OUTREACH_LIVE_RECIPIENTS === "true") return { live: true };
  return { live: false, testRecipient: process.env.OUTREACH_TEST_RECIPIENT || undefined };
}

export function inboxId() {
  const id = process.env.AGENTMAIL_INBOX_ID;
  if (!id || !process.env.AGENTMAIL_API_KEY) {
    throw new Error("AgentMail is not configured. Set AGENTMAIL_API_KEY and AGENTMAIL_INBOX_ID in .env.local.");
  }
  return id;
}

async function agentmail<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/inboxes/${encodeURIComponent(inboxId())}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`AgentMail ${init?.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// Labels can't hold a URL, so contacts are tagged with a short hash of their profile URL.
export function contactKey(profileUrl: string) {
  return createHash("sha1").update(profileUrl).digest("hex").slice(0, 12);
}

const jobLabel = (jobId: string) => `job-${jobId}`;
const contactLabel = (profileUrl: string) => `contact-${contactKey(profileUrl)}`;

export type OutreachDraftInput = {
  jobId: string;
  profileUrl: string;
  recipientName: string;
  recipientEmail?: string;
  subject: string;
  text: string;
};

export async function createOutreachDraft(input: OutreachDraftInput) {
  const mode = outreachMode();
  let to: string[] = [];
  let text = input.text;

  if (mode.live) {
    if (input.recipientEmail) to = [input.recipientEmail];
  } else {
    if (mode.testRecipient) to = [mode.testRecipient];
    // Keep track of who the draft was meant for, since `to` doesn't say.
    const intended = input.recipientEmail ? `${input.recipientName} <${input.recipientEmail}>` : input.recipientName;
    text = `[Test draft, intended for ${intended} — ${input.profileUrl}]\n\n${text}`;
  }

  return agentmail<{ draft_id: string }>("/drafts", {
    method: "POST",
    body: JSON.stringify({
      to,
      subject: input.subject,
      text,
      labels: [OUTREACH_LABEL, jobLabel(input.jobId), contactLabel(input.profileUrl)],
      client_id: `outreach-${input.jobId}-${contactKey(input.profileUrl)}`,
    }),
  });
}

type DraftList = { drafts: { draft_id: string; labels: string[] }[]; next_page_token?: string };

// Contact keys that already have an outreach draft for this job.
export async function draftedContactKeys(jobId: string): Promise<Set<string>> {
  const keys = new Set<string>();
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ limit: "100" });
    params.append("labels", OUTREACH_LABEL);
    params.append("labels", jobLabel(jobId));
    if (pageToken) params.set("page_token", pageToken);
    const page = await agentmail<DraftList>(`/drafts?${params}`);
    for (const draft of page.drafts) {
      for (const label of draft.labels) {
        if (label.startsWith("contact-")) keys.add(label.slice("contact-".length));
      }
    }
    pageToken = page.next_page_token;
  } while (pageToken);
  return keys;
}
