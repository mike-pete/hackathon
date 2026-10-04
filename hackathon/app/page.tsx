import { Bootstrap } from "@/components/Bootstrap";
import { ContentsRail } from "@/components/ContentsRail";
import { DocumentView } from "@/components/DocumentView";
import { FlowOverlay } from "@/components/FlowOverlay";
import { JobTabs } from "@/components/JobTabs";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <Bootstrap />
      <TopBar />
      <JobTabs />
      <div className="flex min-h-0 flex-1">
        <ContentsRail />
        <DocumentView />
      </div>
      <FlowOverlay />
    </div>
  );
}
