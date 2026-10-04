# Tailor — a personal CV + job + JEV agent

A personal agent that turns a **Big CV** (a messy dump of everything you have ever
done) plus a **target job** and an **intent** into a tailored, evidence-grounded CV
and an honest quality assessment.

This is the CV + Job + JEV slice of the **res-you-may-agents** team's build for the
[Build Personal Agents hack](https://build-personal-agents.com) (Oct 4, 2026, SF).

## What it does

1. **Big CV in.** Paste your whole career dump. It is parsed into candidate
   evidence bullets you can toggle on and off.
2. **JEV routes the work.** [JevRouter](https://github.com/BillionsBobby/JevRouter)
   is given the capability set and asked which capability handles each step of the
   request. It returns ordered steps with Jev probabilities, confidence, router
   rank, risk level, confirmation gates, filters and provenance hashes.
3. **Capabilities execute in plan order.** `company_research` (optional) →
   `cv_generate` → `cv_assess`.
4. **Tailored CV out.** A headline, summary, ATS skills, rewritten bullets with
   `← evidenceId` traces back to the Big CV, and a cover note.
5. **Quality assessment.** Six dimensions scored 0–100, matched/missing keyword
   coverage, and concrete suggested edits.

## Architecture

```
app/
  page.tsx                 three-column shell (Big CV · JEV · Output)
  api/jev/route.ts         JevRouter plan (HTTP → CLI → policy fallback)
  api/generate/route.ts    tailored CV (LLM, deterministic mock fallback)
  api/assess/route.ts      quality assessment (LLM, deterministic mock fallback)
  api/research/route.ts    Exa if keyed, else LLM knowledge brief, else stub
  api/health/route.ts      provider detection for the badges
components/                BigCVPanel, JobPanel, JevPanel, OutputPanel, PipelineLog
lib/
  jev.ts                   JevRouter client + decision normalisation
  capabilities.ts          the capability manifests handed to JevRouter
  llm.ts                   OpenAI-compatible client (LM Studio → OpenCode Zen)
  prompts.ts               generation + assessment prompts (strict JSON)
  mock.ts                  deterministic offline fallback (keyword overlap scoring)
  store.ts                 Zustand, in-memory only
```

**No database.** All state lives in a Zustand store for the session, exactly as the
team scoped it: `big CV and intent can change`, nothing persisted.

## JEV integration in detail

`lib/capabilities.ts` defines five manifests (`cv_generate`, `cv_assess`,
`company_research`, `cover_letter`, `email_send`). The last two carry risk and a
confirmation gate, so JevRouter reasons about them differently.

`lib/jev.ts` runs the plan over three transports, in order:

| Transport | How | When |
|---|---|---|
| `http` | `POST /route` to a running `jevrouter serve` | `JEV_HTTP_URL` reachable |
| `cli` | `npx jevrouter plan --provider demo --stdin` | default, fully offline |
| `policy` | deterministic local fallback | CLI unavailable |

The router is **decision-only**: nothing executes implicitly. When Jev confidence
is below policy it returns `no_decision` and a `low_confidence` fallback, and the
UI labels the executed capabilities as *best-ranked safe picks* rather than
pretending it was a confident choice.

`npm run jev` starts the HTTP server on `:8787` for the fast path.

## LLM

`lib/llm.ts` is an OpenAI-compatible client with a failover chain. The first
configured and reachable provider wins, and it falls through on any error:

1. **Neon AI Gateway** via `NEON_AI_GATEWAY_BASE_URL` + `NEON_AI_GATEWAY_TOKEN`
   (base `${NEON_AI_GATEWAY_BASE_URL}/v1`, default model `gpt-5-mini`).
2. **Vercel AI Gateway** via `AI_GATEWAY_API_KEY`
   (base `https://ai-gateway.vercel.sh/v1`, default model `anthropic/claude-sonnet-5`).
3. **Any OpenAI-compatible endpoint** via `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`.
4. **Local LM Studio** at `http://127.0.0.1:1234/v1`, auto-detected, never required.
   Set `LLM_LOCAL=0` to disable.
5. **OpenCode Zen** via `OPENCODE_API_KEY`.
6. **Deterministic mock** so the demo never dead-ends.

A local model is a convenience, not a requirement. With a gateway key set, the
app runs with no local inference at all.

## Run it

```bash
npm install

# LLM: point at a gateway (recommended). Copy and fill in Neon or Vercel keys.
cp .env.example .env.local

# Optional: a local model as a fallback with no keys at all.
# lms load qwen3-30b-a3b-abliterated --gpu max --ttl 7200 -y

# optional: serve JevRouter for the fast HTTP route
npm run jev

npm run dev
```

Open http://localhost:3000. The app seeds itself with a sample Big CV and job on
first load.

- **Upload** (top of the Big CV panel) parses a resume file into bullets. PDF via
  `unpdf`, DOCX via `mammoth`, TXT/MD/RTF as text. You can also drag a file onto
  the textarea. Max 8 MB.
- **Sample CV** loads the fictional payments persona.
- **My resume** loads Rahul's real resume (`lib/rahul-resume.ts`, from
  `~/Documents/Personal Mac Documents/Rahul_Tuladhar_Resume.pdf`) as the Big CV.
- **From the job board** in the Target job panel pulls jobs from Mike's shared
  `app/jobs.ts`, so the CV agent and the `/jobs` board use one source of truth.

The stepper under the header tracks the workflow: **Add resume → Pick a job →
Set intent → Run agent → Review**.

> If port 3000 is taken (e.g. by another local service), run `PORT=3100 npm run dev`.

## End-to-end walkthrough

1. Open http://localhost:3000.
2. Click **Upload** in the Big CV panel and choose a resume file (or drag it onto
   the textarea), or click **My resume** for the bundled real example. Either way
   the bullets appear in the list (22 for the PDF, 25 for the bundled text).
3. In **Target job → From the job board**, pick
   "Frontend Software Engineer, Codex App · OpenAI".
4. Click **Run agent**.
5. Watch the middle column: JevRouter returns a plan (capabilities ranked with
   probabilities, risk and confirmation gates), then the trace shows each
   capability executing.
6. Read the right column: the tailored CV with `← evidenceId` traces, then the
   **Quality** tab for the six-dimension score, keyword coverage and edits.


## Environment

See `.env.example`. Everything is optional; the app degrades gracefully.

- `EXA_API_KEY` — turns `company_research` into real web research.
- `OPENCODE_API_KEY` — fallback LLM provider.
- `JEV_HTTP_URL`, `JEV_PROVIDER`, `OPENROUTER_API_KEY` — route Jev live instead of
  the offline demo provider.

## What is real vs. stubbed

- **Real:** JevRouter decision/plan with its full contract; local LLM generation
  and scoring; Big CV parsing; keyword coverage math; the whole UI.
- **Stubbed / pluggable:** `email_send` is modelled as a gated capability but no
  mail is sent; `cover_letter` is produced inside the generation step rather than
  as its own routed capability; Exa research falls back to the model's knowledge
  when no key is present.
