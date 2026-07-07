## Why

Career Pipeline now has candidate memory and AI artifact foundations, but there is still no durable place for roles before they become applications. The next slice should create the role discovery and intake workspace so future fit triage has real role records to evaluate instead of transient links, notes, or chat output.

## What Changes

- Add search topics/query profiles that capture role discovery intent: target title, stack, location, company type, compensation, employment type, work arrangement, seniority, and notes.
- Add a limited user-triggered role search workflow that runs from a saved search topic and imports returned roles into the role inbox.
- Add a backend role search provider boundary so the initial implementation can use a simple provider, API-backed provider, or fake/test provider without coupling domain logic to scraping or a specific search vendor.
- Add role records independent from tracked job applications, with structured fields for company, title, posting URL, source, description, location, remote eligibility, employment type, seniority, compensation, stack, freshness, and lifecycle status.
- Add manual job URL intake and paste-job-description intake as fallback/import paths that create normalized role records without requiring scraping automation.
- Add a role inbox/list UI for reviewing imported or found roles before they enter the application pipeline.
- Add explicit role decisions: save/shortlist, reject, revisit later, and promote to a tracked application.
- Add promotion from role candidate to existing job application while preserving the source role record for later fit analysis and application packet workflows.
- Prepare the data model for future role fit triage, role freshness checks, application packets, vector indexing, and background role search jobs.
- Do not add AI fit ranking, generated application packets, vector embeddings, scheduled scans, heavy scraping, LinkedIn automation, browser extensions, or a shared public job index in this change.

## Capabilities

### New Capabilities

- `role-search-topic-management`: Defines saved search topics/query profiles that describe what kinds of roles the user wants to find.
- `limited-role-search`: Defines a user-triggered role search run that uses a backend provider boundary and imports returned roles into the inbox.
- `role-record-intake`: Defines role records and intake flows for manual URL entry, pasted job descriptions, and normalized role metadata.
- `role-inbox-workspace`: Defines the role inbox UI and decision workflow for saving, rejecting, revisiting, and promoting role candidates.
- `role-application-promotion`: Defines how a role candidate becomes a tracked job application while remaining available as a source role record.

### Modified Capabilities

- None.

## Impact

- Backend domain, application-layer role search provider port, repository ports, sqlc queries, PostgreSQL migrations, use cases, composition wiring, GraphQL schema/resolvers, and backend tests for search topics, role search runs, role records, role decisions, and application promotion.
- Frontend domain/application ports, GraphQL documents/codegen, gateway mappings, TanStack Query hooks/cache helpers, MSW mock backend support, and presentation components for the role discovery/intake workspace.
- Existing application creation should remain compatible; promotion should reuse or align with the current application intake rules rather than bypassing them.
- Future changes for `add-role-fit-triage`, `add-application-packet-workspace`, `add-vector-memory-retrieval`, and `add-ai-background-jobs` should build on the role records introduced here.
