import { create } from "zustand";
import type { ResumeData, ResumeEntry, SkillLine } from "./resume-types";

// A single work experience, edited via the form. The resume derives from these.
export type Experience = {
  id: string;
  jobTitle: string;
  company: string;
  timeRange: string;
  bullets: string[];
};

// Static parts of the resume for now (only experiences are form-driven).
const NAME = "Mike Peterson";
const CONTACT = "mike@lemonshell.com | github.com/mike-pete";

const SKILLS: SkillLine[] = [
  { label: "Languages:", items: "TypeScript, JavaScript, Python, SQL, GraphQL" },
  {
    label: "Tools:",
    items:
      "React, Next.js, Tailwind, PostgreSQL, TanStack Query, Zustand, Playwright, Git",
  },
];

const PROJECTS: ResumeEntry[] = [
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
];

const seedExperiences: Experience[] = [
  {
    id: "exp-luca",
    jobTitle: "Founding Software Engineer",
    company: "Luca (YC W23)",
    timeRange: "2024 – 2024",
    bullets: [
      "Took price plan deletions down from 30 minutes to 2 seconds by optimizing PostgreSQL table relationships",
      "Achieved instant user interactions by updating the UI before changing the DB, resulting in a snappy user experience",
      "Informed users of current pricing landscape by building price index summary notifications for Slack and email",
      "Enabled pre-launch feature testing using branch previews (Next.js/Vercel) and Launch Darkly feature flags",
      "Ensure smooth data ingestion by building and documenting REST APIs for our competitor intelligence provider",
    ],
  },
  {
    id: "exp-avogadro",
    jobTitle: "Founding Software Engineer",
    company: "Avogadro",
    timeRange: "2023 – 2024",
    bullets: [
      "Streamlined lead generation by building a React/TypeScript tool to scrape and export prospects from LinkedIn",
      "Protected product stability by building an end-to-end test suite using Playwright and GitHub Actions",
      "Led team meeting to establish React state management coding standards for the frontend team",
    ],
  },
  {
    id: "exp-zillow",
    jobTitle: "Senior Software Engineer",
    company: "Zillow",
    timeRange: "2022 – 2023",
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
    id: "exp-stemtaught",
    jobTitle: "Software Engineer",
    company: "STEMTaught",
    timeRange: "2018 – 2021",
    bullets: [
      "Enabled site admins to create and edit content of digital textbook by building a custom page editor with React",
      "Improved content accessibility for students by highlighting words in the textbook as a recording read the text aloud",
      "Used Python and Google’s Speech-to-Text API to determine the timing of each word in textbook audio recordings",
    ],
  },
];

type ResumeStore = {
  experiences: Experience[];
  addExperience: () => void;
  updateExperience: (
    id: string,
    patch: Partial<Pick<Experience, "jobTitle" | "company" | "timeRange">>,
  ) => void;
  removeExperience: (id: string) => void;
  addBullet: (id: string) => void;
  updateBullet: (id: string, index: number, text: string) => void;
  removeBullet: (id: string, index: number) => void;
};

export const useResumeStore = create<ResumeStore>((set) => ({
  experiences: seedExperiences,
  addExperience: () =>
    set((s) => ({
      experiences: [
        ...s.experiences,
        {
          id: crypto.randomUUID(),
          jobTitle: "",
          company: "",
          timeRange: "",
          bullets: [""],
        },
      ],
    })),
  updateExperience: (id, patch) =>
    set((s) => ({
      experiences: s.experiences.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    })),
  removeExperience: (id) =>
    set((s) => ({ experiences: s.experiences.filter((e) => e.id !== id) })),
  addBullet: (id) =>
    set((s) => ({
      experiences: s.experiences.map((e) =>
        e.id === id ? { ...e, bullets: [...e.bullets, ""] } : e,
      ),
    })),
  updateBullet: (id, index, text) =>
    set((s) => ({
      experiences: s.experiences.map((e) =>
        e.id === id
          ? { ...e, bullets: e.bullets.map((b, i) => (i === index ? text : b)) }
          : e,
      ),
    })),
  removeBullet: (id, index) =>
    set((s) => ({
      experiences: s.experiences.map((e) =>
        e.id === id
          ? { ...e, bullets: e.bullets.filter((_, i) => i !== index) }
          : e,
      ),
    })),
}));

// Derive the full resume JSON from the structured store state.
export function buildResumeData(experiences: Experience[]): ResumeData {
  return {
    name: NAME,
    contact: CONTACT,
    sections: [
      { title: "Skills", type: "skills", skills: SKILLS },
      {
        title: "Experience",
        type: "entries",
        entries: experiences
          .filter((e) => e.jobTitle.trim() || e.company.trim())
          .map((e) => ({
            title: e.jobTitle,
            subtitle: e.company || undefined,
            right: e.timeRange || undefined,
            bullets: e.bullets.filter((b) => b.trim()),
          })),
      },
      { title: "Projects", type: "entries", entries: PROJECTS },
    ],
  };
}
