## 1. Data Model and Persistence

- [x] 1.1 Add PostgreSQL migrations for role search topics and role records in both runtime and infrastructure migration directories.
- [x] 1.2 Add role decision status, freshness status, remote eligibility, source kind, employment type, seniority, rejection reason, promoted application id, search topic id, provider source, and metadata columns needed by the specs.
- [x] 1.3 Add sqlc query files for search topic CRUD/list operations.
- [x] 1.4 Add sqlc query files for role record create/list/get/update, decision update, freshness update, duplicate URL lookup, and promotion-link update operations.
- [x] 1.5 Add optional role search run persistence if implementation chooses to store run audit summaries separately from imported role records.
- [x] 1.6 Regenerate sqlc persistence code and keep generated files committed.
- [x] 1.7 Implement PostgreSQL repository adapters for role search topics and role records.
- [x] 1.8 Add persistence adapter tests for topic round trips, search-result imports, role raw-source preservation, duplicate URL lookup, decision/freshness updates, and promoted application linkage.

## 2. Backend Domain and Use Cases

- [x] 2.1 Add domain structs and value types for role search topic, role record, role source kind, role decision status, freshness status, remote eligibility, employment type, seniority, company type, and rejection reason.
- [x] 2.2 Add domain structs and value types for role search requests, provider results, imported/skipped result summaries, and role search run output.
- [x] 2.3 Add typed domain errors for missing required role fields, duplicate active role URL, role not found, search topic not found, invalid role decision, invalid freshness status, already-promoted role, and role search provider failures.
- [x] 2.4 Add repository ports for role search topics and role records.
- [x] 2.5 Add an application-layer role search provider port with fake/test provider support.
- [x] 2.6 Add use cases for creating, listing, and updating role search topics.
- [x] 2.7 Add user-triggered role search use case that loads a topic, calls the provider, dedupes by active posting URL, persists returned roles, and returns imported/skipped counts.
- [x] 2.8 Add use cases for manual URL role intake and pasted description role intake.
- [x] 2.9 Add use cases for listing, retrieving, and editing role records while preserving raw source text.
- [x] 2.10 Add use cases for saving, rejecting with reason, and marking roles for revisit.
- [x] 2.11 Add use case for updating role freshness status and checked timestamp.
- [x] 2.12 Add promotion use case that creates a tracked job application through the existing application creation path and links the role to the created application.
- [x] 2.13 Add backend unit tests for topic management, role search provider calls, search-result import/dedupe summaries, role intake validation, duplicate URL handling, raw-source preservation, decision transitions, freshness updates, and idempotent promotion.

## 3. GraphQL API

- [x] 3.1 Extend the GraphQL schema with role search topic, role search run result, role record, role metadata, role decision, freshness, and promotion DTO/input types.
- [x] 3.2 Add GraphQL queries for listing search topics, listing role records with filters, and retrieving a role record.
- [x] 3.3 Add GraphQL mutations for creating/updating search topics, running limited role search, URL role intake, pasted role intake, editing role metadata, role decisions, freshness updates, and role promotion.
- [x] 3.4 Implement thin resolvers that map GraphQL inputs to role use cases and domain objects back to DTOs.
- [x] 3.5 Add resolver/value-mapping tests for role search run summaries, role statuses, freshness values, rejection reasons, duplicate URL errors, and promotion outputs.
- [x] 3.6 Regenerate gqlgen output and verify backend compilation.
- [x] 3.7 Wire role repositories and use cases in backend composition.

## 4. Frontend Data Access

- [x] 4.1 Add frontend domain types for role search topics, role search run results, role records, role status values, freshness values, and promotion results.
- [x] 4.2 Add frontend application port and use-case wrappers for role search topics, limited role search runs, role intake, role inbox decisions, role edits, freshness updates, and promotion.
- [x] 4.3 Add frontend GraphQL operation documents for role search topics, running role search, role records, role decisions, metadata edits, freshness updates, and promotion.
- [x] 4.4 Regenerate frontend GraphQL types from the backend schema.
- [x] 4.5 Add frontend GraphQL gateway mapping from DTOs into domain-friendly types.
- [x] 4.6 Add TanStack Query keys, cache helpers, and hooks for role search topics and role records.
- [x] 4.7 Add MSW/mock backend support for role search topic, limited search provider results, and role record operations.
- [x] 4.8 Add gateway and contract tests validating frontend role operations against the backend schema.

## 5. Frontend UI

- [x] 5.1 Add a Role Discovery workspace surface reachable from the existing app shell.
- [x] 5.2 Add search topic list/create/edit controls for title, stack, location, company type, compensation, employment type, work arrangement, seniority, and notes.
- [x] 5.3 Add run-search controls on search topics with loading, imported count, skipped/duplicate count, and provider error display.
- [x] 5.4 Add manual URL intake form with editable normalized metadata.
- [x] 5.5 Add pasted job description intake form with raw source preservation and editable normalized metadata.
- [x] 5.6 Add role inbox/list UI showing company, title, source, location, remote eligibility, employment type, seniority, compensation, stack, freshness, and decision status.
- [x] 5.7 Add role filters for decision status, freshness status, source, and company/title search.
- [x] 5.8 Add role detail/edit surface that shows raw source text and editable normalized metadata.
- [x] 5.9 Add role decision controls for save, reject with reason, and revisit later.
- [x] 5.10 Add role promotion control that creates an application and shows promoted state/application linkage.
- [x] 5.11 Add user-visible loading and error states for role topic loading, role search runs, role loading, intake commands, decisions, edits, freshness updates, and promotion.
- [x] 5.12 Add presentation tests for search topic editing, running search/importing results, URL intake, pasted description intake, role decisions, filtering, raw-source preservation, and promotion display.

## 6. Verification

- [x] 6.1 Run backend tests with `make test-api`.
- [x] 6.2 Run frontend tests with `make test-web`.
- [x] 6.3 Run full verification with `make test`.
- [x] 6.4 Run backend build with `make build-api`.
- [x] 6.5 Run frontend codegen, TypeScript, and Vite build verification.
- [x] 6.6 Run OpenSpec strict validation for `add-role-discovery-intake-workspace`.
- [x] 6.7 Review OpenSpec status and confirm all requirements in this change are covered by implementation and tests.
