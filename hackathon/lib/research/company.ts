import { domainOf, exa } from "./exa";
import type { CompanyBrief, Job, NewsItem, Source } from "./types";

// Exa caps search object schemas at depth 2 and 10 properties.
const briefSchema = {
  type: "object" as const,
  properties: {
    overview: { type: "string", description: "2-3 sentences on what the company does and for whom" },
    product: { type: "string", description: "Main products or services" },
    stage: { type: "string", description: "Funding stage, investors, revenue or growth signals" },
    headcount: { type: "string", description: "Approximate number of employees" },
    headquarters: { type: "string", description: "City and country of headquarters" },
    culture: { type: "string", description: "Values, work style, engineering culture" },
    techStack: { type: "array", items: { type: "string" }, description: "Technologies the company uses" },
    hiringSignals: { type: "string", description: "Which teams are growing and why, based on open roles and news" },
    talkingPoints: {
      type: "array",
      items: { type: "string" },
      description: "3-5 specific, recent facts a candidate could mention in an outreach email to show they did their homework",
    },
  },
  required: ["overview", "talkingPoints"],
};

type BriefOutput = Partial<Omit<CompanyBrief, "name" | "website" | "recentNews" | "sources">>;

function parseOutput(content: unknown): BriefOutput {
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as BriefOutput;
    } catch {
      return { overview: content };
    }
  }
  return (content ?? {}) as BriefOutput;
}

// Wide schema whose fields live on different pages, so `deep` (several searches) instead of `auto`.
async function synthesizeBrief(job: Job) {
  const domain = domainOf(job.companyUrl);
  const res = await exa().search(`${job.company}${domain ? ` (${domain})` : ""} company`, {
    type: "deep",
    systemPrompt: `You are helping a candidate prepare to apply for "${job.title}" at ${job.company}. Prefer the company's own site, reputable press and recent sources. Leave a field empty rather than guessing.`,
    outputSchema: briefSchema,
    contents: { highlights: true },
  });

  const sources: Source[] = [];
  for (const g of res.output?.grounding ?? []) {
    for (const c of g.citations) {
      if (!sources.some((s) => s.url === c.url)) sources.push({ url: c.url, title: c.title });
    }
  }
  return { brief: parseOutput(res.output?.content), sources, cost: res.costDollars?.total ?? 0 };
}

async function recentNews(job: Job): Promise<{ news: NewsItem[]; cost: number }> {
  const res = await exa().search(`latest news about ${job.company}`, {
    type: "auto",
    // The UI shows a short news list per company.
    numResults: 5,
    contents: { highlights: true },
  });
  return {
    news: res.results.map((r) => ({
      title: r.title ?? r.url,
      url: r.url,
      publishedDate: r.publishedDate,
      snippet: r.highlights?.[0],
    })),
    cost: res.costDollars?.total ?? 0,
  };
}

export async function researchCompany(job: Job): Promise<{ company: CompanyBrief; cost: number }> {
  // A failure in one source should not sink the whole brief.
  const [brief, news] = await Promise.allSettled([synthesizeBrief(job), recentNews(job)]);
  for (const r of [brief, news]) {
    if (r.status === "rejected") console.warn(`[research] ${job.company}:`, r.reason);
  }
  if (brief.status === "rejected" && news.status === "rejected") throw brief.reason;

  const b = brief.status === "fulfilled" ? brief.value : undefined;
  const n = news.status === "fulfilled" ? news.value : undefined;

  return {
    cost: (b?.cost ?? 0) + (n?.cost ?? 0),
    company: {
      ...b?.brief,
      name: job.company,
      website: job.companyUrl,
      overview: b?.brief.overview ?? "",
      techStack: b?.brief.techStack ?? [],
      talkingPoints: b?.brief.talkingPoints ?? [],
      recentNews: n?.news ?? [],
      sources: b?.sources ?? [],
    },
  };
}
