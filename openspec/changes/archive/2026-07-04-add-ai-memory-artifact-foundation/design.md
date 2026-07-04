## Context

Career Pipeline currently tracks applications, stages, interviews, follow-ups, notes, and timeline events through a React frontend, Go GraphQL backend, and PostgreSQL persistence. The AI Career OS roadmap keeps this repo as the starting point and treats the existing tracker as the process/CRM center of a broader AI-assisted job-search workflow.

Before role discovery, fit ranking, application packets, scoped assistant behavior, or vector retrieval can be reliable, the system needs authoritative candidate context and durable AI artifact storage. The foundation must support future AI workflows without making chat the primary interface and without turning generated text into untraceable transient responses.

## Goals / Non-Goals

**Goals:**

- Add a single-user candidate profile and structured memory records as the authoritative grounding context for future AI workflows.
- Persist AI artifacts as domain objects with ownership, provenance, generated content, user-edited content, approval state, sensitivity, and supersession metadata.
- Define an AI provider boundary in the backend application layer so future use cases can call model providers without coupling domain or GraphQL code to a vendor SDK.
- Expose enough GraphQL and frontend UI to view and manage candidate profile and memory records.
- Design identifiers and metadata so a later vector-memory proposal can index records and retrieve domain objects by stable references.

**Non-Goals:**

- No role search, role ingestion, or role ranking.
- No fit analysis generation.
- No application packet generation.
- No vector embeddings or `pgvector` migration.
- No background job queue.
- No global chat assistant.
- No multi-user authentication or account ownership model.

## Decisions

### Store structured memory as first-class PostgreSQL records

The backend will introduce candidate profile and memory record tables rather than storing profile context only as markdown or chat transcript text.

Candidate profile fields should cover the stable grounding data future AI workflows need: target roles, preferred stack, compensation expectations, location/work constraints, company preferences, writing tone, and summary positioning. Memory records cover more granular facts such as approved skills, weaker areas, interview stories, red flags, compensation notes, and recruiter/process lessons.

Rationale:

- Structured memory is the source of truth; vector memory later becomes a search layer over these records.
- Explicit fields let the app distinguish approved facts, sensitive facts, superseded facts, and current preferences.
- Postgres/sqlc fits the existing architecture and keeps AI context inside the same durable data model as applications.

Alternative considered: store all memory as freeform notes and index them later. That would make initial implementation faster but would blur approved facts, outdated claims, and sensitive context.

### Use AI artifacts for generated outputs, not chat transcripts

AI outputs will be persisted as artifacts with `artifactType`, `ownerType`, `ownerId`, `title`, `sourceInputs`, `generatedContent`, `userEditedContent`, `status`, `sensitive`, `supersededBy`, provider/model metadata, and timestamps.

Rationale:

- Future outputs such as fit analyses, application answers, recruiter drafts, prep packets, and offer analyses need durable homes.
- Keeping generated content separate from user-edited content preserves provenance and lets the product learn from edits later.
- Owner metadata lets artifacts attach to future roles, applications, interviews, offers, or profile records without requiring a new table per output type.

Alternative considered: one table per artifact type from the start. That may become appropriate for complex artifacts later, but the foundation needs a generic persistence layer before exact artifact shapes settle.

### Keep AI provider calls behind an application-layer port

The backend will define an AI provider port in `internal/application/ports/`. Future AI use cases will depend on that port, not on OpenAI, Anthropic, Gemini, or local model SDKs directly. Domain structs remain provider-agnostic.

Rationale:

- The roadmap explicitly keeps provider choice replaceable.
- Tests can use fake providers without network calls.
- A provider boundary prevents AI concerns from leaking into GraphQL resolvers or domain entities.

This change can define the port and configuration seam without requiring a user-visible live generation workflow. Live provider adapters can be added when the first AI workflow needs them, or included behind configuration if implementation proves cheap.

### Expose candidate memory management before generation

The frontend should include a simple Profile/Memory surface or equivalent management UI that lets the user view and edit candidate profile and memory records before AI uses them.

Rationale:

- Truthful AI behavior depends on editable approved facts.
- The user should not need to edit hidden database rows to correct candidate context.
- This makes the foundation useful even before role search and generation land.

### Preserve single-user assumptions but avoid blocking future ownership

The current product has no authentication. This change should model a single active candidate profile but keep IDs and repository boundaries explicit so future auth/user ownership can be added without rewriting AI artifacts.

Rationale:

- Adding auth now would distract from the AI foundation.
- A single active profile matches the existing single-user tracker.
- Explicit IDs preserve a migration path.

## Risks / Trade-offs

- [Risk] The foundation may feel less exciting than visible AI generation. → Mitigation: include a minimal profile/memory UI and keep the next proposal focused on role discovery/intake.
- [Risk] Generic AI artifacts may become too loose. → Mitigation: require artifact type, owner type, owner ID, status, and provenance metadata; future proposals can add typed packet/detail tables when needed.
- [Risk] Sensitive memory could be used in the wrong context later. → Mitigation: store sensitivity and approval/current/supersession flags now, and require future context assembly to respect them.
- [Risk] AI provider design may overfit before real workflows exist. → Mitigation: keep the port small: request, context messages, generation parameters, response content, provider metadata, and usage metadata.
- [Risk] Adding new GraphQL schema and sqlc migrations increases implementation surface. → Mitigation: follow the existing backend pattern: domain structs, use cases, ports, sqlc-backed repositories, thin resolvers, frontend operation codegen.

## Migration Plan

1. Add PostgreSQL migrations for candidate profile, memory records, and AI artifacts.
2. Add sqlc queries and regenerate persistence code.
3. Add Go domain structs, repository ports, use cases, persistence adapters, and tests.
4. Add GraphQL schema types, queries, mutations, resolver mappings, and backend contract tests.
5. Add frontend GraphQL documents/codegen, gateway mappings, application functions, query cache integration, and profile/memory UI.
6. Verify with existing backend/frontend tests and codegen checks.

Rollback is straightforward before production data exists: revert the change and roll back the new migrations. After real profile/artifact data exists, rollback requires exporting or preserving the new tables before dropping them.

## Open Questions

- Should the first implementation include a concrete OpenAI adapter behind configuration, or only the provider port and fake/test adapter until the first generation workflow?
- Should memory records support tags as first-class rows or as JSON metadata in the foundation?
- Should AI artifacts allow `ownerId` to be empty for profile-level/global artifacts, or should every artifact attach to a profile by default?
