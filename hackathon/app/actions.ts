"use server";

import jobs from "./jobs";
import { getGatewayClient, GATEWAY_MODEL } from "./gateway";

// Summarizes a job description into a few tight bullet points via the Neon AI
// Gateway. Takes the job id so the summary is scoped to the selected listing.
export async function summarizeJob(jobId: number): Promise<string> {
  const job = jobs[jobId];
  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }

  const client = getGatewayClient();
  const response = await client.chat.completions.create({
    model: GATEWAY_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You summarize job postings for a candidate. Reply with 3-5 short bullet points covering the role, key responsibilities, and standout requirements. Be concise and specific. No preamble.",
      },
      {
        role: "user",
        content: `Summarize this job posting.\n\nCompany: ${job.company}\nTitle: ${job.title}\n\n${job.description.trim()}`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export type PersonProfile = {
  profilePicUrl: string;
  jobTitle: string;
  email: string;
  description: string;
};

// Dummy research result. Eventually this will run deep research on the backend
// to find relevant people at the target company and surface them to the
// candidate so they can reach out.
export async function researchPerson(): Promise<PersonProfile> {
  return {
    profilePicUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    jobTitle: "Senior Software Engineer",
    email: "jordan.rivera@example.com",
    description:
      "Senior Software Engineer with 8+ years building large-scale web platforms. Currently leads the frontend infrastructure team, focusing on performance, component systems, and developer experience. Previously worked on realtime collaboration tooling. A strong potential referral for engineering roles at the company.",
  };
}
