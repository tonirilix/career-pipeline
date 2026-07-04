# AI Job Search Operating System — Product Map

## 1. Product thesis

Most candidates do not need another generic job board or cover-letter generator. They need a persistent job-search operating system that understands their background, finds relevant opportunities, tracks each process, drafts high-quality communications, prepares them for interviews, and helps them make compensation/offer decisions.

The core product promise:

> An AI career copilot that remembers your profile, manages your job search end to end, and helps you make better application, interview, and offer decisions.

The strongest version of the product is not “AI writes cover letters.” It is a system that combines:

- live role discovery
- candidate-specific fit analysis
- application drafting
- process tracking
- recruiter communication support
- interview preparation
- offer and contract comparison
- persistent context across all applications

The product should optimize for **quality and control**, not blind auto-apply volume.

---

## 2. Users

### Primary user: active job seeker

A professional actively applying to roles and managing multiple processes.

Common needs:

- find roles that actually match their profile
- avoid dead job links and bad-fit roles
- tailor applications without wasting hours
- track each company and process stage
- prepare for different interview types
- respond well to recruiters
- compare offers and compensation structures

Best early segment:

- mid-senior software engineers
- remote job seekers
- candidates applying internationally
- candidates with complex preferences, such as contractor vs employee, product vs consultancy, location eligibility, compensation constraints, and role-level targeting

### Secondary user: career switcher or leveling-up candidate

Someone trying to reposition themselves, for example:

- frontend to full-stack
- senior to staff
- consultancy to product company
- local employment to remote international roles

Needs:

- profile gap analysis
- positioning strategy
- resume/story adaptation
- interview preparation by target level

### Secondary user: laid-off professional

Someone who needs more structure and speed.

Needs:

- daily role discovery
- pipeline discipline
- emotional/decision support
- consistent recruiter messaging
- offer deadline management

### Future B2B users

Potential later segments:

- bootcamps
- outplacement firms
- career coaches
- universities
- developer communities
- recruiting-prep programs

B2B value:

- structured job-search workflow for many candidates
- dashboards for progress
- reusable templates and coaching workflows
- anonymized aggregate insights

---

## 3. Core modules

### 3.1 Candidate profile and memory

The persistent “candidate brain.”

Stores:

- resume versions
- work history
- skills
- target roles
- preferred compensation
- location and time-zone constraints
- preferred company types
- dealbreakers
- writing tone
- interview stories
- approved facts
- sensitive limitations or gaps

Important behavior:

- never invent skills or experience
- distinguish confirmed experience from stretch positioning
- remember what the user already told each recruiter
- update profile as processes evolve

Example stored facts:

- “Strongest in React/TypeScript/frontend architecture.”
- “Comfortable full-stack, but frontend-leaning.”
- “Open to Senior, Lead, Staff roles.”
- “Prefers product companies; consultancies only if project/client is strong.”
- “Target compensation: $95k–$105k USD annual or 125k–140k MXN monthly depending on structure.”

---

### 3.2 Resume and document workspace

Manages candidate artifacts.

Features:

- upload resume
- parse resume into structured facts
- maintain multiple resume versions
- highlight gaps vs job posting
- suggest precise resume edits
- keep a “truth source” of approved claims
- store cover letters, application answers, recruiter emails, interview notes

Documents to support:

- PDF
- DOCX
- Markdown
- plain text
- pasted job descriptions
- contract/offer PDFs

---

### 3.3 Role discovery engine

Finds roles from the web and user-provided sources.

Sources:

- Greenhouse
- Lever
- Ashby
- company careers pages
- LinkedIn links provided by user
- remote job boards
- recruiter messages
- saved companies

Responsibilities:

- fetch live job pages
- detect closed/expired roles
- normalize job data
- dedupe reposts
- classify remote eligibility
- classify employment setup
- extract stack, seniority, location, compensation, interview hints, and red flags

Role metadata:

- company
- title
- URL
- status: live / closed / unknown
- location eligibility
- remote policy
- employment type: employee / contractor / EOR / unclear
- salary range
- seniority
- stack
- company type: product / consultancy / agency / unclear
- role risks
- fit score

Important requirement:

- never recommend a role without indicating whether the link was validated recently.

---

### 3.4 Fit and ranking engine

Scores roles against the candidate profile.

Suggested scoring dimensions:

- location fit
- stack fit
- seniority fit
- company type fit
- compensation fit
- product/domain fit
- growth potential
- risk level
- application effort
- likelihood of response

Output should not be just a number. It should include reasoning:

- “Strong fit because…”
- “Credible stretch because…”
- “Weak fit because…”
- “Apply only if…”

Example classifications:

- Strong fit
- Good fit with minor gaps
- Credible stretch
- Low-priority stretch
- Skip

---

### 3.5 Application studio

Generates tailored application materials.

Features:

- cover letters
- application question answers
- salary expectation answers
- “Why this role?” answers
- “Why this company?” answers
- recruiter replies
- follow-up notes
- LinkedIn messages

Important rules:

- draft only after user approves the target role
- use only approved candidate facts
- avoid generic copy
- keep tone consistent with user preference
- preserve truthful framing around skill gaps

Example outputs:

- short answer under 255 characters
- full textarea answer
- warm recruiter reply
- concise compensation response
- cover letter with product/company alignment

---

### 3.6 Pipeline CRM

Tracks all job processes.

Stages:

- saved
- interested
- applied
- recruiter screen
- assessment
- technical interview
- onsite / loop
- offer
- negotiating
- accepted
- rejected
- withdrawn

Per-process memory:

- recruiter name
- recruiter contact
- salary quoted
- resume version used
- application answers used
- interview stages
- feedback received
- next action
- deadlines
- company-specific notes
- decision rationale

Notifications:

- follow up after X days
- upcoming interview
- offer deadline
- missing prep
- recruiter waiting for reply

---

### 3.7 Recruiter communication assistant

Helps manage messages without fully automating human decisions.

Capabilities:

- summarize recruiter emails
- identify what they are asking for
- draft replies
- track salary numbers already shared
- detect offer deadlines
- detect red flags
- suggest when to disclose competing offers
- suggest when not to mention sensitive information

Human-in-the-loop rule:

- never send messages without explicit user approval.

---

### 3.8 Interview preparation engine

Generates interview prep based on company, role, stage, and user background.

Interview types:

- recruiter screen
- coding / DSA
- practical coding
- frontend architecture
- system design
- deep dive
- behavioral / leveling
- hiring manager
- CEO / culture
- offer negotiation

Features:

- likely questions
- answer frameworks
- sample answers in user’s tone
- story bank mapping
- company-specific preparation
- level-specific prep, such as Senior vs Staff
- mock interview mode
- weakness drilling

Key differentiator:

- the system remembers the user’s actual stories and reuses them strategically across interviews.

---

### 3.9 Offer, compensation, and contract analyzer

Helps compare offers and understand tradeoffs.

Capabilities:

- compare employee vs contractor
- estimate net monthly income
- factor in benefits
- factor in unpaid time off
- factor in health insurance
- factor in taxes, with disclaimers
- extract contract clauses
- identify risks and questions to ask
- compare offers side by side

Contract signals:

- termination notice
- non-solicit
- non-compete
- IP ownership
- tax responsibility
- paid/unpaid leave
- bonus language
- equipment
- governing law
- arbitration

Important disclaimer:

- not legal/tax advice; recommend accountant/lawyer where appropriate.

---

### 3.10 Company intelligence and red-flag detector

Summarizes company context.

Signals:

- product vs consultancy
- funding / maturity
- Glassdoor-like sentiment if available
- public layoffs or instability
- intense work culture indicators
- weekend/overtime expectations
- suspicious recruiter messages
- scam detection
- domain verification

Examples of red flags:

- “work most weekends”
- vague client identity
- payment or identity requests too early
- inconsistent domains
- role listed as remote but actually country-restricted

---

### 3.11 Integrations

Early optional integrations:

- Gmail / email import
- Google Calendar
- LinkedIn manual import or extension
- Greenhouse / Lever / Ashby link parser
- PDF/DOCX import

Later integrations:

- browser extension
- Slack / Telegram notifications
- Google Drive
- Notion export
- ATS portal tracking

---

## 4. Key flows

### Flow 1: onboarding

1. User uploads resume.
2. App extracts structured profile.
3. User confirms or edits facts.
4. App asks preferences:
   - target roles
   - compensation range
   - remote/location constraints
   - company preferences
   - dealbreakers
5. App creates candidate memory.
6. App suggests first search configuration.

Output:

- candidate profile
- role-search preferences
- story bank seed
- compensation baseline

---

### Flow 2: role discovery and ranking

1. User triggers search or scheduled search runs.
2. App fetches roles from configured sources.
3. App validates links and detects closed roles.
4. App extracts structured job details.
5. App scores role against candidate profile.
6. App groups roles by priority.
7. User reviews shortlist.

Output:

- ranked roles
- “why fit” explanation
- risks/gaps
- recommended action

---

### Flow 3: applying to a role

1. User selects role.
2. App summarizes JD and requirements.
3. App compares role against candidate profile.
4. App recommends resume angle.
5. App drafts cover letter and form answers.
6. User edits/approves.
7. App stores submitted artifacts.
8. Pipeline stage moves to “applied.”

Output:

- tailored application package
- application history
- follow-up reminder

---

### Flow 4: recruiter email handling

1. User imports or pastes recruiter message.
2. App identifies intent:
   - screening
   - salary expectations
   - interview scheduling
   - reference check
   - offer
3. App checks process history.
4. App drafts reply consistent with prior context.
5. User approves and sends manually or via integration.
6. App updates pipeline.

Output:

- reply draft
- updated process state
- reminders/deadlines

---

### Flow 5: interview prep

1. User adds interview stage and details.
2. App identifies interview type.
3. App retrieves company, role, resume, and process context.
4. App builds prep plan.
5. App generates likely questions and sample answers.
6. User practices via mock mode.
7. App records weaknesses and follow-up prep.

Output:

- interview brief
- answer bank
- story mapping
- mock interview session

---

### Flow 6: offer and contract review

1. User uploads offer/contract.
2. App extracts compensation and terms.
3. App compares against expectations and other offers.
4. App identifies missing details.
5. App drafts clarification questions.
6. App helps user decide whether to accept, negotiate, or wait.

Output:

- offer summary
- risk list
- compensation model
- recruiter questions
- decision brief

---

## 5. High-level architecture diagram in words

A strong architecture can be local-first with optional cloud services.

### Client layer

Desktop app built with Electron or Tauri.

Responsibilities:

- UI
- local state display
- file uploads
- pipeline dashboard
- application workspace
- interview prep view
- offer comparison view

### Local application layer

Runs inside the desktop app or as a bundled local service.

Responsibilities:

- candidate memory
- workflow orchestration
- document parsing
- local database access
- local AI task preparation
- communication with external AI APIs

Possible implementation:

- Electron main process launches a bundled Python service or Node service.
- UI communicates with local service via HTTP, WebSocket, IPC, or stdin/stdout.
- User never manually starts a server.

### Local data layer

Local-first storage.

Responsibilities:

- resumes
- documents
- process history
- generated drafts
- recruiter notes
- contracts
- embeddings / semantic index

Suggested storage:

- SQLite for structured data
- local file store for documents
- SQLite vector extension, LanceDB, Chroma, or Qdrant local for retrieval if needed

### AI gateway layer

Abstraction over AI providers.

Responsibilities:

- route requests to OpenAI, Anthropic, Gemini, or local models
- manage prompt templates
- enforce approved-facts grounding
- store outputs with provenance
- support streaming where useful
- log cost and usage

### Job ingestion layer

Can be local, cloud, or hybrid.

Responsibilities:

- scrape/fetch job boards
- validate live postings
- normalize role data
- dedupe roles
- classify company and employment type

For MVP:

- local/manual import plus limited search.

For production:

- cloud workers that build a shared live job index.

### Optional cloud layer

Used later for:

- sync across devices
- centralized job index
- background search
- notifications
- backups
- account management
- collaboration or coaching features

### Data flow example

1. User uploads resume in desktop app.
2. Local service parses resume and stores facts in SQLite.
3. User imports a job link.
4. Local service fetches/parses job page.
5. AI gateway asks LLM to compare job vs candidate profile.
6. Fit result is stored locally.
7. User approves application draft.
8. Draft is generated and stored in the pipeline.
9. Optional sync pushes encrypted data to cloud.

---

## 6. MVP

### MVP goal

Help a serious job seeker manage a high-quality job search from discovery to interview preparation without losing context.

The MVP should not try to auto-apply at scale.

### MVP user promise

> Upload your resume, define your target, import or find roles, get fit rankings, draft tailored applications, and track every process in one place.

### MVP features

#### Must have

1. Candidate profile ingest
   - resume upload
   - structured profile extraction
   - manual fact correction

2. Role import
   - paste job URL
   - paste job description
   - parse role into structured fields

3. Fit analysis
   - score role fit
   - explain strengths, gaps, and risks
   - classify as strong fit / stretch / skip

4. Application drafting
   - cover letter
   - short application answers
   - recruiter reply draft
   - salary expectation draft

5. Pipeline tracker
   - company / role / stage / next action
   - notes
   - salary quoted
   - deadlines

6. Interview prep
   - stage-specific prep
   - likely questions
   - answer frameworks
   - candidate story bank

7. Offer/contract basic analysis
   - upload offer/contract
   - extract key terms
   - list questions to ask
   - basic comp comparison

#### Should have

- role freshness check
- basic company red-flag scan
- export to Markdown/PDF
- local search across processes
- reminders

#### Not in MVP

- blind auto-apply
- full email automation
- full LinkedIn automation
- fully automated tax/legal advice
- complex multi-user collaboration
- heavy scraping across the whole web

---

## 7. Suggested MVP stack

### Recommended first version: local-first desktop app

#### App shell

- Electron
- React
- TypeScript

Why:

- familiar web stack
- easy desktop packaging
- strong ecosystem
- good fit for local-first workflows

Alternative:

- Tauri if smaller app size and stronger native feel matter more.

#### Local backend/service

Option A: Node/TypeScript service

- Fastify or tRPC
- easier if most of the app is JS/TS
- simpler packaging with Electron

Option B: Python local service

- FastAPI or a lightweight worker process
- stronger for document parsing, AI tooling, OCR, embeddings, and ML-adjacent workflows
- Electron automatically launches bundled Python executable

Recommended MVP choice:

- Start with TypeScript for core app logic.
- Add Python worker only for document/OCR/AI processing that benefits from Python libraries.

If you already prefer Python-heavy AI workflows:

- Electron + React/TS + bundled Python FastAPI service is viable.

#### Local database

- SQLite

Why:

- no DB server to manage
- ideal for single-user desktop apps
- easy backups
- low operational friction

ORM/query layer:

- Drizzle ORM
- Prisma with SQLite
- SQLModel/SQLAlchemy if Python owns the DB

#### Local files

- app data directory
- encrypted document storage if possible

#### Retrieval / embeddings

MVP:

- start with simple keyword/local search
- add embeddings later

If embeddings are needed early:

- sqlite-vec
- LanceDB
- Chroma
- Qdrant local

#### AI providers

- OpenAI API
- Anthropic API
- optional Gemini
- optional local models via Ollama later

Useful SDK:

- Vercel AI SDK if staying JS/TS
- provider SDKs directly if you want more control

#### Scraping / role parsing

- Playwright for browser-based extraction
- simple HTTP fetch/parsing where possible

MVP approach:

- paste URL or JD first
- add automated search later

#### Background jobs

Local:

- simple scheduled jobs in Electron main process
- SQLite-backed task table

Cloud later:

- BullMQ
- Temporal
- serverless cron

#### Optional cloud later

- Supabase for auth, Postgres, storage, and sync
- Postgres + pgvector for shared cloud memory/search
- cloud workers for role ingestion

---

## 8. Monetizable features

### Subscription tiers

#### Free

- profile setup
- limited role imports per month
- basic fit analysis
- basic pipeline tracking

#### Pro

- unlimited role imports
- tailored application answers
- interview prep
- recruiter reply drafting
- salary expectation guidance
- offer comparison
- local-first private memory

#### Premium

- automated job scout
- daily shortlist
- company red-flag analysis
- interview mock mode
- contract review assistant
- multi-resume strategy
- compensation modeling

### Usage-based AI credits

Charge for heavy tasks:

- long contract analysis
- multiple mock interviews
- batch role ranking
- resume rewrite variations
- multi-offer comparison

### Job scout add-on

A paid feature that runs scheduled searches and sends curated roles.

Value:

- validated live links
- deduped postings
- fit-ranked shortlist
- company/employment setup classification

### Interview prep packs

Paid per interview or included in Pro.

Examples:

- Staff engineer leveling prep
- frontend system design prep
- coding interview drill
- CEO/culture interview prep
- company-specific prep brief

### Offer and contract analyzer

High-value premium feature.

Includes:

- compensation normalization
- contractor vs employee comparison
- contract risk extraction
- questions to ask recruiter
- negotiation language

### Browser extension

Premium convenience feature.

Capabilities:

- save job from LinkedIn/Greenhouse/Lever/Ashby
- auto-parse role
- show quick fit score
- send to pipeline

### Career coach / expert marketplace

Optional later marketplace.

Users can share a process package with a human coach:

- resume
- role
- AI analysis
- interview prep
- questions

Revenue:

- marketplace fee
- expert sessions

### B2B / team plans

For:

- bootcamps
- outplacement firms
- universities
- communities

Features:

- candidate dashboards
- progress tracking
- template libraries
- coach review workflows
- anonymized analytics

### Privacy-first premium

A local-first/private tier can be a differentiator.

Features:

- local-only mode
- encrypted sync
- bring-your-own API key
- private document vault
- data export/delete controls

---

## 9. Product principles

### 1. Human approval by default

The app can draft, recommend, and prepare. It should not auto-apply or auto-send messages without explicit user approval.

### 2. Truthfulness over optimization

Never invent experience. Never overstate skills. Always distinguish:

- confirmed experience
- adjacent experience
- stretch positioning
- missing skill

### 3. Persistent context is the moat

The product is valuable because it remembers the whole search, not because it generates one-off text.

### 4. Quality over volume

The app should optimize for better applications and better decisions, not hundreds of weak submissions.

### 5. Explain the reasoning

Every recommendation should say why.

### 6. Privacy-first by design

Resumes, contracts, recruiter messages, salary expectations, and personal notes are highly sensitive.

---

## 10. Suggested build sequence

### Phase 1: Personal-use prototype

- local app
- resume/profile ingestion
- paste JD / URL
- fit analysis
- application drafts
- pipeline tracking

### Phase 2: Serious MVP

- role freshness checks
- interview prep module
- offer/contract analyzer
- role search/import improvements
- saved prompts and story bank

### Phase 3: Productized beta

- onboarding polish
- encrypted local storage
- optional sync
- daily job scout
- browser extension
- email/calendar integrations

### Phase 4: Monetization

- Pro subscription
- AI credits
- interview prep premium
- offer analyzer premium
- B2B pilots

---

## 11. The first MVP screen set

### Dashboard

- active processes
- next actions
- upcoming interviews
- offer deadlines
- new role recommendations

### Profile

- resume facts
- target roles
- salary expectations
- constraints
- story bank

### Role inbox

- imported/found roles
- fit score
- status
- apply/skip buttons

### Role detail

- JD summary
- fit analysis
- gaps
- recommended angle
- application drafts

### Pipeline

- kanban or table by stage
- recruiter notes
- salary quoted
- artifacts used

### Interview prep

- role/stage prep
- likely questions
- sample answers
- mock mode

### Offer review

- comp summary
- benefits
- risks
- questions
- comparison table

---

## 12. MVP success metrics

User-value metrics:

- roles imported per week
- roles shortlisted per week
- applications submitted
- recruiter response rate
- interviews scheduled
- time saved per application
- user-rated draft usefulness
- number of avoided bad-fit applications

Product-quality metrics:

- role parsing accuracy
- closed-link detection rate
- hallucination rate in generated drafts
- user edit distance on drafts
- repeated weekly usage

Business metrics:

- free-to-paid conversion
- retained active job seekers
- average revenue per user
- paid feature usage
- interview prep conversion
- offer analyzer conversion

