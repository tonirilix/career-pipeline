## Context

Career Pipeline now tracks applications and has the AI foundation for candidate profile, structured memory, AI artifacts, and provider boundaries. The AI Career OS roadmap says the next product loop is search topics and role intake before fit ranking, triage, and application packet generation.

Today, a job only enters the system once it is already an application opportunity. That skips an important earlier state: roles the user has searched for, found, pasted, bookmarked, or wants to evaluate before committing to apply. The ChatGPT-assisted workflow used active role discovery heavily, so this proposal includes a limited user-triggered search workflow while still avoiding broad scraping, LinkedIn automation, scheduled scans, and crawler infrastructure.

## Goals / Non-Goals

**Goals:**

- Add saved search topics/query profiles that describe what the user is looking for.
- Add user-triggered role search runs from a saved search topic.
- Add a replaceable backend role search provider boundary with fake/test support.
- Add role records independent from job applications.
- Support manual URL intake and pasted job description intake as supporting import paths.
- Store normalized role metadata needed by future fit triage and application packets.
- Add an inbox workspace where the user can review, save, reject, revisit, and promote roles.
- Promote a role into the existing application pipeline without deleting or collapsing the role record.
- Keep implementation aligned with the existing React, Go, GraphQL, PostgreSQL, sqlc, and hexagonal architecture patterns.

**Non-Goals:**

- No autonomous web crawler.
- No LinkedIn automation.
- No browser extension.
- No shared public job index.
- No scheduled scans or background queue.
- No guarantee that every possible job board can be searched in the first provider.
- No AI fit ranking.
- No generated application packet.
- No vector embeddings.
- No automatic application submission.

## Decisions

### Store search topics separately from roles

Search topics will be first-class records with fields such as name, target titles, preferred stack, location, remote preference, employment type, company type, compensation, seniority, and notes. Roles may optionally reference the topic that found or inspired them.

Rationale:

- Search topics are reusable intent, while role records are concrete opportunities.
- Future background scans can run from the same topic records.
- Future fit analysis can compare role metadata against both candidate profile and topic intent.

Alternative considered: store search topics only as UI filters or candidate profile fields. That would make initial implementation smaller, but it would lose the search history and source intent future role search jobs need.

### Add a limited role search provider boundary

The backend will define an application-layer `RoleSearchProvider` port that accepts a saved search topic plus explicit run parameters and returns normalized role candidates. A user-triggered use case will call the provider, dedupe returned roles, persist new role records, and return a search run result with imported roles and duplicate/skipped counts.

Rationale:

- This is closer to the ChatGPT workflow: the user asks from a topic and gets possible jobs back.
- Keeping the provider behind a port avoids coupling domain/use cases to a scraping library, search API, or browser automation.
- Tests and local development can use a fake/static provider without network calls.
- Future changes can replace or deepen the provider with job-board APIs, curated search APIs, browser-assisted import, or background workers.

Alternative considered: keep proposal #2 manual-only. That would be safer technically, but it would miss the product expectation that role discovery means the app can return possible jobs from search topics.

Alternative considered: implement heavy scraping now. That better resembles a full automated scout, but it expands scope into source-specific parsing, bot protection, retries, and background jobs before the role inbox data model is proven.

### Model role candidates independently from applications

Role records will live in their own backend domain and persistence tables rather than being represented as `JobApplication` rows in the `Saved` stage. A role can later be promoted into a tracked application.

Rationale:

- A role is not yet an application process.
- Rejections and revisit decisions should not pollute the active application pipeline.
- Fit triage and application packets need role details even before an application exists.
- Keeping both records preserves provenance after promotion.

Alternative considered: reuse the existing application table and add pre-application stages. That would be faster, but it would blur the CRM pipeline with discovery inventory and make the current board less focused.

### Keep intake user-driven and normalization-first

The change should support three intake paths: limited role search from a topic, manual URL entry, and pasted job description. The system should store raw source text plus normalized fields. Search results should arrive already normalized by the provider contract, and users should still be able to edit saved role metadata.

Rationale:

- Limited search makes the MVP meaningfully similar to the original ChatGPT-assisted role discovery flow.
- Manual/paste intake remains necessary for roles the provider misses or user-supplied links from recruiters, job boards, and company sites.
- Raw source text lets future AI extraction or vector indexing reprocess the role without losing context.
- Avoiding source-specific scraping in core use cases keeps the product boundary clear.

Alternative considered: fetch job pages server-side on URL submission. That can be useful later, but page access, bot protection, parsing quality, and source-specific rules should live behind the provider/import boundary rather than inside role intake use cases.

### Use explicit decision states

Role records should have lifecycle or decision state values such as `New`, `Saved`, `Rejected`, `Revisit later`, and `Promoted`. Rejection should optionally capture a reason such as wrong location, wrong stack, low compensation, seniority mismatch, consultancy, duplicate, closed, or other.

Rationale:

- The role inbox needs user decisions independent of fit ranking.
- Decision reasons become useful training signals for future recommendations.
- Promotion can mark the role as already connected to an application.

Alternative considered: use booleans like `saved` and `rejected`. That becomes ambiguous when revisit, promoted, duplicate, or archived states appear.

### Promotion reuses existing application intake rules

Promotion should create a normal tracked job application using the role's company, title, posting URL, source, location, compensation, and employment type. The role record should retain a reference to the created application.

Rationale:

- The existing pipeline remains the process/CRM center.
- Promotion does not bypass application validation or timeline creation.
- Future packet generation can trace from application back to source role.

Alternative considered: mutate the role into an application. That would discard the distinction between discovery and pipeline tracking.

### Keep AI generation out of this change

This change should not call the AI provider port for fit analysis or content generation. It should add a role search provider boundary for discovery and shape the records future AI workflows will consume.

Rationale:

- Proposal 3 needs clean role records before it can rank fit.
- The current user-visible value is search plus organization, not generated reasoning.
- Keeping search user-triggered and request-scoped avoids adding background jobs prematurely.

## Risks / Trade-offs

- [Risk] The first search provider may return imperfect or sparse results. -> Mitigation: keep manual URL and pasted description intake available, show source/freshness clearly, and keep provider replacement isolated.
- [Risk] A synchronous search request may be slow if the provider performs network lookups. -> Mitigation: keep the first provider limited, cap result counts, expose loading/errors, and defer scheduled/bulk search to the background jobs proposal.
- [Risk] Role search could drift toward heavy scraping. -> Mitigation: keep the domain/use cases provider-agnostic and explicitly exclude LinkedIn automation, broad crawling, scheduled scans, and source-specific scraping in this proposal.
- [Risk] Normalized role metadata may be incomplete for pasted descriptions. -> Mitigation: keep fields editable and preserve raw description/source text.
- [Risk] Role and application data may duplicate company/title/location fields. -> Mitigation: treat duplication as snapshot provenance; promotion copies current role data into the application while linking records.
- [Risk] Decision states may need refinement after real use. -> Mitigation: use string-like domain value types and keep rejection reasons explicit but extensible.
- [Risk] Promotion could create duplicate applications. -> Mitigation: prevent repeated promotion from a role that already has an application reference, and surface that state in the UI.

## Migration Plan

1. Add PostgreSQL migrations for search topics, role search runs if needed, and role records.
2. Add sqlc query files and regenerate persistence code.
3. Add backend domain structs, repository ports, role search provider port, use cases, persistence adapters, and tests.
4. Extend GraphQL schema, resolvers, generated code, and resolver mapping tests.
5. Add frontend GraphQL documents/codegen, gateway mappings, query hooks, MSW handlers, and tests.
6. Add the role discovery/intake workspace to the existing app shell.
7. Verify backend, frontend, full test suite, codegen, and builds.

Rollback before production data exists is a normal migration rollback. After real role data exists, rollback requires exporting or preserving role/search topic tables before dropping them.

## Open Questions

- Should role source be a constrained enum from the start or a freeform string with known presets?
- Which initial concrete provider should back limited search: static/fake only, a configurable external search API, or a simple web search adapter?
- Should search runs be persisted as separate audit records now, or is storing imported role source/search topic enough for this slice?
- Should promotion immediately open the created application details panel, or only confirm creation in the role inbox?
