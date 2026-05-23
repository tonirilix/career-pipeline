## 1. Backend Application Deepening

- [x] 1.1 Add focused tests for full Job Application assembly, including timeline, interviews, follow-up reminders, notes, and ordering.
- [x] 1.2 Extract backend full Job Application assembly from `loadFullApplication` into an application-layer module.
- [x] 1.3 Update backend use case constructors and execution paths to depend on the assembly module instead of carrying every child repository where only rehydration is needed.
- [x] 1.4 Add or update backend architecture tests so use cases that return full Job Applications do not directly reimplement child repository loading.

## 2. Backend Transactional Workflows

- [x] 2.1 Add rollback tests for stage advancement when timeline writing or follow-up deactivation fails.
- [x] 2.2 Add rollback tests for scheduling interviews, creating follow-up reminders, completing follow-up reminders, and adding notes when timeline writing fails.
- [x] 2.3 Implement and wire the backend transaction adapter behind the existing `Transactor` port.
- [x] 2.4 Update multi-step backend Job Application workflows to execute persistence writes atomically.
- [x] 2.5 Verify backend use case tests and PostgreSQL persistence tests cover rollback behavior.

## 3. Frontend Pipeline Workspace Module

- [x] 3.1 Add tests for Pipeline workspace loading, filtering, sorting, follow-up grouping, selected application state, and command error state.
- [x] 3.2 Extract Pipeline workspace state and command handling from `App.tsx` into a frontend module.
- [x] 3.3 Update `App.tsx` to render workspace state and dispatch workspace commands without owning filtering, sorting, local replacement, or follow-up grouping logic.
- [x] 3.4 Preserve existing presentation behavior and update presentation tests where the test seam changes.

## 4. MSW Mock Backend

- [x] 4.1 Add tests for an in-memory mock Job Application backend covering creation, stage advancement, interviews, follow-up reminders, completion, notes, generated IDs, and generated timestamps.
- [x] 4.2 Move mutable mock Job Application state, ID generation, timestamp generation, and domain workflow execution out of MSW handlers into the mock backend module.
- [x] 4.3 Update MSW GraphQL handlers to translate GraphQL operation inputs and delegate to the mock backend module.
- [x] 4.4 Add or update architecture tests so MSW handler modules do not own mutable Job Application mock state.

## 5. GraphQL Contract Verification

- [x] 5.1 Add backend GraphQL adapter tests for mapping stages, job sources, employment types, interview types, and interview outcomes to domain values.
- [x] 5.2 Update the GraphQL schema and resolver mapping so unsupported workflow values are rejected before use case execution.
- [x] 5.3 Add contract tests that validate frontend GraphQL gateway operations against `apps/api/graph/schema.graphqls`.
- [x] 5.4 Verify known backend domain failures flow through the frontend GraphQL gateway using the existing application result paths.

## 6. PostgreSQL Query Locality

- [x] 6.1 Decide whether this implementation step will adopt sqlc now or use an interim query module that preserves the sqlc migration path.
- [x] 6.2 Concentrate PostgreSQL query text and row mapping behind repository adapters so application callers do not know SQL text, scan order, placeholders, or generated query types.
- [x] 6.3 Add repository adapter tests that round-trip Job Application data and persisted child data without field loss or unintended string/time conversion.
- [x] 6.4 Update backend persistence documentation and ADR 0003 to reflect the chosen query strategy status.

## 7. Verification

- [x] 7.1 Run `npm run test --workspace apps/web`.
- [x] 7.2 Run `go test ./...` in `apps/api`.
- [x] 7.3 Run any PostgreSQL-backed persistence tests with `TEST_DATABASE_URL` when a test database is available.
- [x] 7.4 Run `openspec status --change architecture-deepening-review-2026-may22` and confirm the change is apply-ready.
