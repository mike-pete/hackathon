import { domainOf, exa } from "./exa";
import type { Contact, ContactRole, Job, Source } from "./types";

const ROLES: ContactRole[] = ["hiring_manager", "recruiter", "executive", "team_member"];

const contactsSchema = {
  type: "object",
  properties: {
    contacts: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string", description: "Current job title at the company" },
          role: { type: "string", enum: ROLES },
          profile_url: { type: "string", format: "uri", description: "LinkedIn or other public profile URL" },
          priority: { type: "integer", minimum: 1, maximum: 100, description: "How strongly to contact this person first" },
          reason: { type: "string", description: "One sentence: why this person matters for this application" },
          hook: {
            type: "string",
            description: "A specific detail (project, post, talk, background) to mention in a personal outreach message",
          },
        },
        required: ["name", "title", "role", "profile_url", "priority", "reason"],
      },
    },
  },
  required: ["contacts"],
};

const systemPrompt = `You help a job candidate decide who to reach out to about one specific job.
Only include people who currently work at the hiring company; verify this from their profile or the company site and leave out anyone you cannot verify. Never guess a name or profile URL.
Roles: hiring_manager = likely manager or team lead for this role; recruiter = recruiting, talent or people team; executive = founders and C-level/VP; team_member = people in the same or an adjacent role.
Order contacts by priority. The likely hiring manager ranks highest, then the recruiter for that area. At companies under ~200 people, founders and CTOs are often directly involved in hiring and should rank high.`;

type AgentContact = {
  name: string;
  title: string;
  role: ContactRole;
  profile_url: string;
  priority: number;
  reason: string;
  hook?: string;
};

// Finding stakeholders is list-building, which Exa routes to the Agent API rather than /search.
export async function researchPeople(job: Job): Promise<{ contacts: Contact[]; cost: number }> {
  const domain = domainOf(job.companyUrl);
  const query = `Find the people at ${job.company}${domain ? ` (${domain})` : ""} that a candidate applying for the "${job.title}" role${
    job.location ? ` in ${job.location}` : ""
  } should contact: the likely hiring manager, recruiters, people on the same team, and leadership if the company is small.`;

  const run = await exa().agent.runs.createAndWait<{ contacts: AgentContact[] }>(
    {
      query,
      systemPrompt,
      // The listing itself is the row to research; keeps the long description out of `query`.
      input: { data: [{ ...job, description: job.description?.slice(0, 4000) }] },
      outputSchema: contactsSchema,
      effort: "auto",
      budget: { maxCostDollars: Number(process.env.EXA_AGENT_MAX_COST ?? 2) },
    },
    { pollInterval: 4000, timeoutMs: 280_000 },
  );

  if (run.status !== "completed") {
    throw new Error(`Exa agent run ${run.id} ended with status ${run.status}: ${run.error?.message ?? "no error message"}`);
  }

  // Grounding fields look like "contacts[2].title"; collect citations per contact.
  const sources = new Map<number, Source[]>();
  for (const g of run.output?.grounding ?? []) {
    const i = Number(/contacts\[(\d+)\]/.exec(g.field)?.[1]);
    if (Number.isNaN(i)) continue;
    const list = sources.get(i) ?? [];
    for (const c of g.citations) {
      if (!list.some((s) => s.url === c.url)) list.push({ url: c.url, title: c.title ?? undefined });
    }
    sources.set(i, list);
  }

  const contacts = (run.output?.structured?.contacts ?? [])
    .map(
      (c, i): Contact => ({
        name: c.name,
        title: c.title,
        role: ROLES.includes(c.role) ? c.role : "team_member",
        profileUrl: c.profile_url,
        priority: Math.max(1, Math.min(100, Math.round(c.priority))),
        reason: c.reason,
        hooks: c.hook,
        sources: sources.get(i) ?? [],
      }),
    )
    .sort((a, b) => b.priority - a.priority);

  return { contacts, cost: run.costDollars?.total ?? 0 };
}
