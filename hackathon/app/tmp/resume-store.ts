import { create } from "zustand";
import type { ResumeData } from "./resume-types";

// Seed resume. The store is the source of truth — edit it via setResume (e.g.
// from an upload, the agent pipeline, or an editor) and the PDF re-derives.
const initialResume: ResumeData = {
  name: "Mike Peterson",
  contact: "mike@lemonshell.com | github.com/mike-pete",
  sections: [
    {
      title: "Skills",
      type: "skills",
      skills: [
        { label: "Languages:", items: "TypeScript, JavaScript, Python, SQL, GraphQL" },
        {
          label: "Tools:",
          items:
            "React, Next.js, Tailwind, PostgreSQL, TanStack Query, Zustand, Playwright, Git",
        },
      ],
    },
    {
      title: "Experience",
      type: "entries",
      entries: [
        {
          title: "Founding Software Engineer",
          subtitle: "Luca (YC W23)",
          right: "2024 – 2024",
          bullets: [
            "Took price plan deletions down from 30 minutes to 2 seconds by optimizing PostgreSQL table relationships",
            "Achieved instant user interactions by updating the UI before changing the DB, resulting in a snappy user experience",
            "Informed users of current pricing landscape by building price index summary notifications for Slack and email",
            "Enabled pre-launch feature testing using branch previews (Next.js/Vercel) and Launch Darkly feature flags",
            "Ensure smooth data ingestion by building and documenting REST APIs for our competitor intelligence provider",
          ],
        },
        {
          title: "Founding Software Engineer",
          subtitle: "Avogadro",
          right: "2023 – 2024",
          bullets: [
            "Streamlined lead generation by building a React/TypeScript tool to scrape and export prospects from LinkedIn",
            "Protected product stability by building an end-to-end test suite using Playwright and GitHub Actions",
            "Led team meeting to establish React state management coding standards for the frontend team",
          ],
        },
        {
          title: "Senior Software Engineer",
          subtitle: "Zillow",
          right: "2022 – 2023",
          bullets: [
            "Revamped mortgage processing system used by 120 loan officers to facilitate $72m in mortgages per month",
            "5x’ed the mortgage options available to loan officers for each borrower, taking 45 minute sessions down to 5 minutes",
            "Owned the business logic and input validation code for the forms that determine end-user mortgage qualification",
            "Extended Python/Go document generation microservices enabling loan officers to send customers custom PDFs",
            "Ensured user-entered data validity by using React Hook Form and Yup to control and verify form data",
            "Coordinated with design team and business analysts to ensure features met functional and usability requirements",
          ],
        },
        {
          title: "Software Engineer",
          subtitle: "STEMTaught",
          right: "2018 – 2021",
          bullets: [
            "Enabled site admins to create and edit content of digital textbook by building a custom page editor with React",
            "Improved content accessibility for students by highlighting words in the textbook as a recording read the text aloud",
            "Used Python and Google’s Speech-to-Text API to determine the timing of each word in textbook audio recordings",
          ],
        },
      ],
    },
    {
      title: "Projects",
      type: "entries",
      entries: [
        {
          title: "RPC Library for Iframes",
          right: "npmjs.com/package/@mike.pete/bime",
          bullets: [
            "Developed a TypeScript-based, promise-driven RPC library to simplify and standardize communication with iframes",
            "Added critical features such as message acknowledgments, automatic retries, message validation, and origin security",
            "Created simple API that allows developers to focus on application logic instead of communication intricacies",
          ],
        },
        {
          title: "Chrome Extension to Scrape Jobs on LinkedIn",
          right: "github.com/mike-pete/bolt",
          bullets: [
            "Architected the extension to host the UI externally, bypassing Chrome Store reviews for most feature iterations",
            "Built modular, remotely invoked scraping functions, enabling dynamic and context-aware operations",
            "Provided users with job relevancy insights by displaying the frequency of user-specified keywords found in job listing",
            "Reduced capital spend by migrating from initial MySQL database provider to a cost-effective PostgreSQL solution",
          ],
        },
        {
          title: "Webpage Editor",
          right: "github.com/mike-pete/webeditor",
          bullets: [
            "Created webpage builder that allows users to use “block” components and CSS properties to craft webpage layouts",
            "Stored page elements as a map for constant-time access and preserved hierarchical structure via child ID arrays",
          ],
        },
      ],
    },
  ],
};

type ResumeStore = {
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;
};

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: initialResume,
  setResume: (resume) => set({ resume }),
}));
