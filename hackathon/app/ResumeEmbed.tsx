"use client";

import { useEffect, useMemo } from "react";
import { usePDF } from "@react-pdf/renderer";
import Resume from "./tmp/Resume";
import { buildResumeData, useResumeStore } from "./tmp/resume-store";

// Renders the resume (from the resume store) as a fit-to-width PDF preview.
export default function ResumeEmbed() {
  const experiences = useResumeStore((s) => s.experiences);
  const resume = useMemo(() => buildResumeData(experiences), [experiences]);

  const [instance, update] = usePDF({ document: <Resume data={resume} /> });
  useEffect(() => {
    update(<Resume data={resume} />);
  }, [resume, update]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {instance.url && (
        <iframe
          title="Resume"
          src={`${instance.url}#toolbar=0&navpanes=0&view=FitH`}
          className="h-full w-full border-0"
        />
      )}
    </div>
  );
}
