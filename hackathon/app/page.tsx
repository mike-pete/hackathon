import { Bootstrap } from "@/components/Bootstrap";
import { ContentsRail } from "@/components/ContentsRail";
import { DocumentView } from "@/components/DocumentView";
import { FlowOverlay } from "@/components/FlowOverlay";
import { JobTabs } from "@/components/JobTabs";
import { SplitPane } from "@/components/SplitPane";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <Bootstrap />
      <TopBar />
      <JobTabs />
      <SplitPane
        side="left"
        storageKey="tailor.railWidth"
        defaultSize={240}
        min={180}
        max={420}
        fixedClassName="hidden lg:flex"
        a={<ContentsRail />}
        b={<DocumentView />}
      />
      <FlowOverlay />
    </div>
  );
}
