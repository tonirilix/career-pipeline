## 1. Data Model and Persistence

- [x] 1.1 Add PostgreSQL migrations for candidate profiles, candidate memory records, and AI artifacts in both runtime and infrastructure migration directories.
- [x] 1.2 Add sqlc query files for candidate profile CRUD, memory record CRUD/archive/supersession, and AI artifact create/list/update/status operations.
- [x] 1.3 Regenerate sqlc persistence code and keep generated files committed.
- [x] 1.4 Implement PostgreSQL repository adapters for candidate profile, memory records, and AI artifacts.
- [x] 1.5 Add persistence adapter tests for profile round trips, memory approval/supersession metadata, artifact owner filtering, and edited-vs-generated content preservation.

## 2. Backend Domain and Use Cases

- [x] 2.1 Add domain structs and value types for candidate profile, memory record, memory type, artifact, artifact type, artifact status, owner reference, and provenance metadata.
- [x] 2.2 Add application repository ports for candidate memory and AI artifacts.
- [x] 2.3 Add use cases for getting/updating the active candidate profile.
- [x] 2.4 Add use cases for creating, listing, updating, archiving, and superseding memory records.
- [x] 2.5 Add a grounding-context use case that returns the active profile plus current approved memory records.
- [x] 2.6 Add use cases for creating, listing by owner, editing, approving, rejecting, and superseding AI artifacts.
- [x] 2.7 Add unit tests for memory filtering, supersession behavior, artifact status transitions, owner filtering, and edited content preservation.

## 3. AI Provider Boundary

- [x] 3.1 Define an application-layer AI provider port with request, context reference, generation parameter, response, and usage metadata types.
- [x] 3.2 Add a fake AI provider implementation for backend use case tests.
- [x] 3.3 Add configuration/composition seams for future concrete provider adapters without requiring a live provider workflow in this change.
- [x] 3.4 Add architecture tests ensuring domain code does not import AI provider SDKs or infrastructure packages.

## 4. GraphQL API

- [x] 4.1 Extend the GraphQL schema with candidate profile, memory record, AI artifact, owner reference, provenance, and input types.
- [x] 4.2 Add GraphQL queries and mutations for profile retrieval/update, memory management, grounding-context retrieval, and artifact management.
- [x] 4.3 Implement thin resolvers that map GraphQL inputs to use cases and domain objects back to DTOs.
- [x] 4.4 Add backend resolver/value-mapping tests for memory types, artifact statuses, owner references, sensitivity, approval, and supersession fields.
- [x] 4.5 Regenerate gqlgen output and verify backend compilation.

## 5. Frontend Data Access

- [x] 5.1 Add frontend GraphQL operation documents for candidate profile, memory records, grounding context, and AI artifacts.
- [x] 5.2 Regenerate frontend GraphQL types from the backend schema.
- [x] 5.3 Add frontend gateway/application functions that map GraphQL DTOs into frontend domain-friendly types.
- [x] 5.4 Add TanStack Query hooks/cache helpers for candidate profile, memory records, and AI artifacts.
- [x] 5.5 Add gateway and contract tests validating frontend operations against the backend schema.

## 6. Frontend UI

- [x] 6.1 Add a Profile/Memory workspace surface reachable from the existing app shell.
- [x] 6.2 Add candidate profile view/edit controls for target roles, stack, compensation, constraints, company preferences, tone, and positioning summary.
- [x] 6.3 Add memory record list/create/edit/archive/supersede interactions with approval and sensitivity controls.
- [x] 6.4 Add AI artifact list/edit/status controls sufficient to inspect foundation artifacts by owner where applicable.
- [x] 6.5 Add user-visible loading and error states for profile, memory, and artifact operations.
- [x] 6.6 Add presentation tests for profile editing, memory approval/sensitivity, memory supersession, and artifact edited-content display.

## 7. Verification

- [x] 7.1 Run backend tests with `make test-api`.
- [x] 7.2 Run frontend tests with `make test-web`.
- [x] 7.3 Run full verification with `make test`.
- [x] 7.4 Run build/codegen verification needed by the changed GraphQL schema.
- [x] 7.5 Review OpenSpec status and confirm all requirements in this change are covered by implementation and tests.
