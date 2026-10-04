import { BigCVPanel } from "@/components/BigCVPanel";
import { Bootstrap } from "@/components/Bootstrap";
import { JevPanel } from "@/components/JevPanel";
import { JobPanel } from "@/components/JobPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { PipelineLog } from "@/components/PipelineLog";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Bootstrap />
      <TopBar />
      <main className="mx-auto grid w-full max-w-[1700px] flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-4">
          <BigCVPanel />
          <JobPanel />
        </div>
        <div className="flex flex-col gap-3 lg:col-span-4">
          <JevPanel />
          <PipelineLog />
        </div>
        <div className="flex flex-col gap-3 lg:col-span-4">
          <OutputPanel />
        </div>
      </main>
      <footer className="border-t border-white/10 px-4 py-2.5 text-center text-[10px] text-zinc-600">
        In-memory only, no database · Big CV parsed locally · Capabilities routed by JevRouter ·
        Built for the Build Personal Agents hack
      </footer>
    </div>
  );
}
