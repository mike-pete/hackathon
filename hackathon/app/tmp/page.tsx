"use client";

import dynamic from "next/dynamic";

// PDFViewer touches browser-only APIs, so load the preview client-side only.
const ResumePreview = dynamic(() => import("./ResumePreview"), { ssr: false });

export default function TmpResumePage() {
  return <ResumePreview />;
}
