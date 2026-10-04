"use client";

import { useEffect, useMemo, useState } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { getDocumentProxy } from "unpdf";
import Resume from "./Resume";
import { buildResumeData, useResumeStore } from "./resume-store";

export default function ResumePreview() {
  const experiences = useResumeStore((s) => s.experiences);
  const resume = useMemo(() => buildResumeData(experiences), [experiences]);
  const [pages, setPages] = useState<number | null>(null);

  // Render the resume to a blob and read its page count via pdf.js (unpdf).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const blob = await pdf(<Resume data={resume} />).toBlob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const doc = await getDocumentProxy(bytes);
      if (!cancelled) setPages(doc.numPages);
    })();
    return () => {
      cancelled = true;
    };
  }, [resume]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        {pages == null
          ? "Measuring…"
          : `${pages} page${pages === 1 ? "" : "s"}`}
      </div>
      <div className="flex-1">
        <PDFViewer
          style={{ width: "100%", height: "100%", border: "none" }}
          showToolbar={false}
        >
          <Resume data={resume} />
        </PDFViewer>
      </div>
    </div>
  );
}
