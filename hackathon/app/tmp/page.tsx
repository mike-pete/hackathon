"use client";

import dynamic from "next/dynamic";
import ExperienceForm from "./ExperienceForm";

// PDFViewer touches browser-only APIs, so load the preview client-side only.
const ResumePreview = dynamic(() => import("./ResumePreview"), { ssr: false });

export default function TmpResumePage() {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="w-[480px] shrink-0 overflow-y-auto border-r border-zinc-200 p-6 dark:border-zinc-800">
        <ExperienceForm />
      </div>
      <div className="min-w-0 flex-1">
        <ResumePreview />
      </div>
    </div>
  );
}
