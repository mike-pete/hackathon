import type { CapabilityManifest } from "./types";

/**
 * The capability set this agent routes between with JevRouter.
 *
 * These mirror JevRouter inline candidate manifests. `risk` and `policy`
 * are honoured by the router's hard filters (e.g. email_send requires
 * confirmation and is medium risk, so it is surfaced but gated).
 */
export const CAPABILITIES: CapabilityManifest[] = [
  {
    id: "cv_generate",
    name: "Tailor CV",
    description:
      "Rewrite the user's experience bullets into a tailored CV for a specific job, grounded only in the Big CV evidence.",
    type: "mcp_tool",
    risk: { level: "low", categories: ["local_write"] },
    ui: { icon: "sparkles", accent: "emerald", kind: "Generation" },
  },
  {
    id: "cv_assess",
    name: "Assess quality",
    description:
      "Score a tailored CV against the job description: relevance, impact, keyword coverage, clarity and authenticity. Flags gaps.",
    type: "mcp_tool",
    risk: { level: "low", categories: ["local_read"] },
    ui: { icon: "gauge", accent: "sky", kind: "Evaluation" },
  },
  {
    id: "company_research",
    name: "Research role",
    description:
      "Look up the company and role on the web to ground the tailoring in what the team actually builds.",
    type: "mcp_tool",
    risk: { level: "low", categories: ["external_read"] },
    ui: { icon: "globe", accent: "violet", kind: "Research" },
  },
  {
    id: "cover_letter",
    name: "Draft cover note",
    description:
      "Write a short, specific cover note tying the strongest evidence bullets to the role's needs.",
    type: "mcp_tool",
    risk: { level: "low", categories: ["local_write"] },
    ui: { icon: "mail", accent: "amber", kind: "Writing" },
  },
  {
    id: "email_send",
    name: "Send application",
    description:
      "Email the tailored CV and cover note to a recruiter or to the user. Sends on the user's behalf.",
    type: "mcp_tool",
    risk: { level: "medium", categories: ["external_write"] },
    policy: { requires_confirmation: true },
    permissions: ["email.send"],
    ui: { icon: "send", accent: "rose", kind: "Action" },
  },
];

export const CAPABILITY_BY_ID = new Map(CAPABILITIES.map((c) => [c.id, c]));

/** Strips UI-only metadata so JevRouter sees clean manifests. */
export function toJevCandidates(caps: CapabilityManifest[] = CAPABILITIES) {
  return caps.map((c) => ({
    name: c.id,
    description: c.description,
    ...(c.risk ? { risk: c.risk } : {}),
    ...(c.policy ? { policy: c.policy } : {}),
    ...(c.permissions ? { permissions: c.permissions } : {}),
  }));
}

/** Capabilities this app can actually execute locally, in a safe default order. */
export const EXECUTABLE = new Set(["cv_generate", "cv_assess", "company_research"]);
