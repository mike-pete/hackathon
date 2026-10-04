"use server";

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
