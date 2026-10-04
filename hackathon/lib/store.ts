"use client";

import { create } from "zustand";
import { parseBigCV } from "./sample";
import type {
  Assessment,
  BigCVBullet,
  GeneratedCV,
  JevPlan,
  JobTarget,
  LogEntry,
  LogLevel,
  PipelineStatus,
  ProviderStatus,
} from "./types";

type State = {
  rawCV: string;
  bullets: BigCVBullet[];
  job: JobTarget;
  intent: string;
  jev: JevPlan | null;
  cv: GeneratedCV | null;
  assessment: Assessment | null;
  research: string | null;
  status: PipelineStatus;
  activeCapability: string | null;
  logs: LogEntry[];
  providers: ProviderStatus | null;
  usedMock: boolean;
  error: string | null;
  /** Which example is loaded, for the UI badge. */
  sampleLabel: string | null;
};

type Actions = {
  hydrateSample: () => void;
  loadResume: () => void;
  uploadResume: (file: File) => Promise<void>;
  clearAll: () => void;
  setRawCV: (text: string) => void;
  parseFromRaw: () => void;
  toggleBullet: (id: string) => void;
  addBullet: (text: string) => void;
  removeBullet: (id: string) => void;
  setJob: (patch: Partial<JobTarget>) => void;
  setIntent: (intent: string) => void;
  log: (level: LogLevel, message: string, detail?: string) => void;
  refreshProviders: () => Promise<void>;
  runPipeline: () => Promise<void>;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useAgentStore = create<State & Actions>((set, get) => ({
  rawCV: "",
  bullets: [],
  job: { title: "", company: "", url: "", description: "" },
  intent: "",
  jev: null,
  cv: null,
  assessment: null,
  research: null,
  status: "idle",
  activeCapability: null,
  logs: [],
  providers: null,
  usedMock: false,
  error: null,
  sampleLabel: null,

  hydrateSample: () => {
    import("./sample").then(({ SAMPLE_BIG_CV, SAMPLE_JOB }) => {
      set({
        rawCV: SAMPLE_BIG_CV,
        bullets: parseBigCV(SAMPLE_BIG_CV),
        job: SAMPLE_JOB,
        intent:
          "Tailor this for the payments platform role and emphasise reliability and scale. Keep it to one page, ATS-friendly.",
        jev: null,
        cv: null,
        assessment: null,
        research: null,
        status: "idle",
        logs: [],
        usedMock: false,
        error: null,
        sampleLabel: "Payments sample",
      });
    });
  },

  loadResume: () => {
    import("./rahul-resume").then(({ RAHUL_RESUME, RAHUL_DEFAULT_INTENT }) => {
      set({
        rawCV: RAHUL_RESUME,
        bullets: parseBigCV(RAHUL_RESUME),
        intent: RAHUL_DEFAULT_INTENT,
        jev: null,
        cv: null,
        assessment: null,
        research: null,
        status: "idle",
        logs: [],
        usedMock: false,
        error: null,
        sampleLabel: "Rahul Tuladhar (real resume)",
      });
    });
  },

  uploadResume: async (file: File) => {
    const { log } = get();
    set({ error: null, status: "idle" });
    log("info", `Uploading ${file.name}…`);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body });
      const data = (await res.json()) as {
        text?: string;
        kind?: string;
        pages?: number;
        error?: string;
      };
      if (!res.ok || !data.text) {
        set({ error: data.error || "Could not parse that file." });
        log("error", "Resume parse failed", data.error);
        return;
      }
      const bullets = parseBigCV(data.text);
      set({
        rawCV: data.text,
        bullets,
        jev: null,
        cv: null,
        assessment: null,
        research: null,
        status: "idle",
        logs: [],
        usedMock: false,
        sampleLabel: `${file.name} · ${bullets.length} bullets`,
      });
      log(
        "info",
        `Imported ${file.name}: ${bullets.length} bullets`,
        `${data.kind ?? "text"}${data.pages ? ` · ${data.pages} page(s)` : ""}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      log("error", "Resume upload failed", message);
    }
  },

  clearAll: () =>
    set({
      rawCV: "",
      bullets: [],
      job: { title: "", company: "", url: "", description: "" },
      intent: "",
      jev: null,
      cv: null,
      assessment: null,
      research: null,
      status: "idle",
      activeCapability: null,
      logs: [],
      usedMock: false,
      error: null,
      sampleLabel: null,
    }),

  setRawCV: (text) => set({ rawCV: text }),

  parseFromRaw: () => {
    const bullets = parseBigCV(get().rawCV);
    set({ bullets });
    get().log(
      "info",
      `Parsed ${bullets.length} bullets from the Big CV`,
      bullets.slice(0, 3).map((b) => `[${b.id}] ${b.text.slice(0, 64)}…`).join("\n"),
    );
  },

  toggleBullet: (id) =>
    set((s) => ({
      bullets: s.bullets.map((b) =>
        b.id === id ? { ...b, selected: !b.selected } : b,
      ),
    })),

  addBullet: (text) =>
    set((s) => ({
      bullets: [
        ...s.bullets,
        {
          id: `m${s.bullets.length + 1}`,
          text,
          tags: [],
          source: "manual",
          selected: true,
        },
      ],
    })),

  removeBullet: (id) =>
    set((s) => ({ bullets: s.bullets.filter((b) => b.id !== id) })),

  setJob: (patch) => set((s) => ({ job: { ...s.job, ...patch } })),

  setIntent: (intent) => set({ intent }),

  log: (level, message, detail) =>
    set((s) => ({
      logs: [
        ...s.logs,
        { id: uid(), at: Date.now(), level, message, detail },
      ].slice(-200),
    })),

  refreshProviders: async () => {
    try {
      const res = await fetch("/api/health");
      const data = (await res.json()) as ProviderStatus;
      set({ providers: data });
    } catch {
      set({ providers: null });
    }
  },

  runPipeline: async () => {
    const { bullets, job, intent, log } = get();
    const selected = bullets.filter((b) => b.selected);

    if (selected.length === 0) {
      set({ status: "error", error: "Select at least one Big CV bullet first." });
      log("warn", "No bullets selected; nothing to tailor.");
      return;
    }
    if (!job.description.trim()) {
      set({ status: "error", error: "Paste a job description first." });
      log("warn", "No job description; nothing to target.");
      return;
    }

    set({
      status: "routing",
      jev: null,
      cv: null,
      assessment: null,
      research: null,
      activeCapability: null,
      usedMock: false,
      error: null,
      logs: [],
    });
    log("info", `Pipeline start: ${selected.length} bullets -> ${job.title || "role"}`);

    try {
      // --- Stage 1: JevRouter decides the capability plan -------------------
      log("jev", "Asking JevRouter to plan the capability order…");
      const jevRes = await fetch("/api/jev", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          intent,
          jobTitle: job.title,
          jobCompany: job.company,
        }),
      });
      if (!jevRes.ok) throw new Error(`JEV route failed: ${jevRes.status}`);
      const jev = (await jevRes.json()) as JevPlan;
      set({ jev });
      log(
        "jev",
        `JevRouter (${jev.transport}/${jev.provider}) -> ${jev.executionPlan.join(" \u2192 ")}`,
        `${jev.rationale}${jev.error ? `\n(CLI error: ${jev.error})` : ""}`,
      );

      let research: string | null = null;

      // --- Optional stage: research, if JevRouter chose it ------------------
      if (jev.executionPlan.includes("company_research")) {
        set({ activeCapability: "company_research", status: "routing" });
        log("jev", "Capability company_research: grounding the role…");
        try {
          const r = await fetch("/api/research", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ job, intent }),
          });
          if (r.ok) {
            const data = (await r.json()) as { findings: string; provider: string };
            research = data.findings;
            set({ research });
            log("llm", `Research (${data.provider}) ready`, data.findings.slice(0, 240));
          }
        } catch {
          log("warn", "Research step skipped");
        }
      }

      // --- Stage 2: generate the tailored CV -------------------------------
      set({ activeCapability: "cv_generate", status: "generating" });
      log("llm", "Capability cv_generate: tailoring the CV…");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bullets, job, intent, plan: jev.executionPlan, research }),
      });
      if (!genRes.ok) throw new Error(`Generate failed: ${genRes.status}`);
      const genData = (await genRes.json()) as {
        cv: GeneratedCV;
        provider: string;
        model: string;
      };
      set({ cv: genData.cv, usedMock: genData.provider === "mock" });
      log("llm", `Tailored CV generated via ${genData.provider}/${genData.model}`);

      // --- Stage 3: assess quality -----------------------------------------
      set({ activeCapability: "cv_assess", status: "assessing" });
      log("llm", "Capability cv_assess: scoring the CV…");
      const assessRes = await fetch("/api/assess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cv: genData.cv, job }),
      });
      if (!assessRes.ok) throw new Error(`Assess failed: ${assessRes.status}`);
      const assessData = (await assessRes.json()) as {
        assessment: Assessment;
        provider: string;
      };
      set({ assessment: assessData.assessment, status: "done", activeCapability: null });
      log("info", `Done. Quality score ${assessData.assessment.overall}/100`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ status: "error", error: message, activeCapability: null });
      log("error", "Pipeline failed", message);
    }
  },
}));
