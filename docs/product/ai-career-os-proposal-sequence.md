# AI Career OS Proposal Sequence

## Purpose

This document records the intended OpenSpec proposal sequence for the AI Career OS direction.

The briefs are not full specifications. They are guidance for future proposal writing so the product intent survives between implementation phases.

## Current Sequence

### 1. `add-ai-memory-artifact-foundation`

Goal: establish the durable AI and context foundation.

Includes:

- Candidate profile.
- Approved facts and structured memory records.
- AI artifact persistence.
- AI provider port.
- Prompt input, output, model/provider, and provenance tracking.
- Approval, sensitive, superseded, and source metadata.
- Schema choices that make future vector indexing straightforward.

Excludes:

- Vector embeddings.
- Role search.
- Fit ranking.
- Application packet generation.
- Full chat assistant.

### 2. `add-role-discovery-intake-workspace`

Goal: create the role inbox and search/intake surface.

Includes:

- Search topics or query profiles, such as target title, stack, location, company type, compensation, and work arrangement.
- Manual job URL intake.
- Paste job description intake.
- Role records independent of tracked applications.
- Role source, freshness status, employment type, stack, location, remote eligibility, seniority, and compensation metadata.
- Role inbox/list UI.
- Save, reject, and promote-to-application decisions as explicit user actions.

Excludes:

- Heavy automated scraping.
- Browser extension.
- LinkedIn automation.
- Large shared job index.
- Fit ranking.

### 3. `add-role-fit-triage`

Goal: rank and triage role candidates against candidate memory.

Includes:

- AI fit analysis using candidate profile, preferences, approved facts, and role details.
- Fit classification such as strong fit, possible fit, credible stretch, low-priority stretch, or skip.
- Strengths, gaps, risks, red flags, and recommended action.
- Role triage queue grouped by fit outcome.
- Save, reject, apply, or revisit actions that can improve future recommendations.

Excludes:

- Application packet drafting.
- Vector retrieval.
- Global AI chat.

### 4. `add-application-packet-workspace`

Goal: generate and manage application-ready artifacts.

Includes:

- Application packet attached to a role and, once pursued, a tracked application.
- Cover letter.
- Short form answers.
- Salary expectation answer.
- Recruiter intro message.
- Positioning notes.
- Submission checklist.
- Editable saved artifacts with user-edited content preserved separately from generated content.

Excludes:

- Email sending.
- Full chat assistant.
- Interview prep.
- Offer analysis.

### 5. `add-scoped-ai-assistant-panel`

Goal: add a small context-aware assistant inside a role or application workspace.

Includes:

- Ask/refine actions scoped to the current role, application, or packet.
- Context assembly from candidate profile, role details, artifacts, notes, and timeline.
- Common actions such as make shorter, make warmer, explain risks, compare to another role, draft another version, or summarize this process.
- Ability to save useful outputs as AI artifacts.

Excludes:

- Global always-available chat history.
- Long-lived conversational memory.
- Autonomous agents.
- Vector retrieval unless proposal 6 has already landed.

### 6. `add-vector-memory-retrieval`

Goal: add semantic recall over saved domain objects.

Includes:

- `pgvector` setup.
- Embeddings for memory records, AI artifacts, notes, role analyses, recruiter messages, interview prep, and offer analyses when those records exist.
- Retrieval use cases that return relevant domain objects, not untyped text blobs.
- Context assembly that treats structured memory as the authority and vector hits as supporting context.
- Metadata to avoid using superseded, unapproved, or sensitive records in unsafe contexts.

Excludes:

- Fully autonomous agent behavior.
- Replatforming to a separate vector database unless Postgres becomes insufficient.

### 7. `add-ai-background-jobs`

Goal: make AI and role workflows reliable when they become long-running or retry-prone.

Includes:

- Job queue, likely River first if the system remains Go/Postgres-centered.
- AI run retries.
- Long-running generation jobs.
- Role import/search jobs.
- Future scheduled scans.
- Job status surfaced in the UI where needed.

Excludes:

- Large crawler infrastructure.
- BullMQ unless the project intentionally adds a TypeScript worker layer.
- Temporal unless workflows become long-running, resumable, multi-day, or heavily human-in-the-loop.

## Later Proposal Candidates

### `add-interview-prep-workspace`

Goal: generate stage-specific interview preparation from candidate memory, role context, application history, and interview details.

Possible includes:

- Interview prep packet per scheduled interview.
- Likely questions.
- Answer frameworks.
- Candidate story mapping.
- Questions to ask the company.
- Red flags to observe.
- Short prep summary.

### `add-recruiter-message-assistant`

Goal: help interpret and respond to recruiter communication without auto-sending messages.

Possible includes:

- Paste recruiter message or import message later.
- Detected situation and intent.
- Suggested replies in multiple tones.
- Salary, scheduling, follow-up, clarification, withdraw, and thank-you actions.
- Save draft and add to process timeline.

### `add-offer-contract-analysis`

Goal: help compare offers and understand contract/compensation tradeoffs.

Possible includes:

- Offer summary.
- Compensation and benefits fields.
- Contractor vs employee comparison.
- Contract risk extraction.
- Clarifying questions to ask.
- Offer comparison table.
- Legal/tax disclaimers and human-review guidance.

### `add-role-freshness-checks`

Goal: prevent the product from recommending stale or closed roles.

Possible includes:

- Freshness status.
- Last checked timestamp.
- Closed/unknown/live classification.
- User-visible warning before applying to stale roles.

### `add-local-first-private-vault`

Goal: revisit local-first/private storage if privacy, desktop packaging, or offline use becomes a primary product requirement.

Possible includes:

- Local file/document vault.
- Encrypted storage.
- Bring-your-own API key.
- Optional sync.
- Desktop app packaging.

## Sequencing Notes

- Proposal 1 should happen before vector memory so there is a trustworthy source of truth to index.
- Proposal 2 should happen before role fit triage so fit analysis has real role records to evaluate.
- Proposal 3 should happen before application packets so the user can choose which roles are worth pursuing.
- Proposal 4 creates durable generated artifacts and should make the product visibly AI-powered.
- Proposal 5 should remain scoped to the active workflow until vector retrieval and global memory are reliable.
- Proposal 6 should index domain objects, not random text chunks.
- Proposal 7 should wait until synchronous or request-driven AI workflows become operationally painful.
