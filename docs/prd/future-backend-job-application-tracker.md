# PRD: Backend Job Application Tracker

> **Status: Implemented** — The Go backend described in this document is live in `apps/api`. See [`apps/api/README.md`](../../apps/api/README.md) for how to run it and [`docs/adr/0002-use-go-for-backend.md`](../adr/0002-use-go-for-backend.md) for technology decisions. The only notable deviation from this PRD: sqlc was not used — repository adapters are written directly with `database/sql` (see ADR 0002).

## Problem Statement

The frontend-first job application tracker will initially use MSW to simulate GraphQL backend behavior. That is useful for learning and rapid iteration, but the application will eventually need a real backend to persist applications, centralize business rules, expose a stable GraphQL API, and prepare for future capabilities such as authentication, deployment, and multi-device use. The backend should preserve the same hexagonal architecture lessons rather than becoming a thin GraphQL-to-database CRUD layer.

## Solution

A Go backend using gqlgen and SQLite exposes a GraphQL API for the React frontend. It executes application use cases, enforces domain rules, and persists data through repository port interfaces. GraphQL resolvers and SQLite adapters are fully decoupled from the domain layer.

The frontend continues to depend on GraphQL operations through its gateway adapter. The backend owns the authoritative version of application state and business rule enforcement. MSW remains available for local development without the Go server (see root README for the two development modes).

## User Stories

1. As a job seeker, I want my applications to persist beyond a browser session, so that my job search data is not lost.
2. As a job seeker, I want the backend to store saved opportunities, so that I can build a durable list of roles before applying.
3. As a job seeker, I want the backend to store applied roles, so that my active pipeline is recoverable.
4. As a job seeker, I want the backend to store closed applications, so that I retain historical context.
5. As a job seeker, I want the backend to store company and role details, so that core application data remains consistent.
6. As a job seeker, I want the backend to store job posting URLs and sources, so that sourcing history is preserved.
7. As a job seeker, I want the backend to store compensation and location information, so that I can compare opportunities later.
8. As a job seeker, I want the backend to store application stages, so that pipeline state is authoritative.
9. As a job seeker, I want stage changes to be validated by the backend, so that invalid client behavior cannot corrupt data.
10. As a job seeker, I want stage changes to create timeline events on the backend, so that history is durable and trustworthy.
11. As a job seeker, I want rejected and withdrawn applications to deactivate reminders on the backend, so that closed work does not remain actionable.
12. As a job seeker, I want reopening closed applications to be explicit, so that unusual workflow changes are auditable.
13. As a job seeker, I want the backend to store interviews, so that interview history survives client refreshes and device changes.
14. As a job seeker, I want the backend to validate interview scheduling rules, so that interviews cannot be attached to invalid application states.
15. As a job seeker, I want the backend to store interview notes and outcomes, so that preparation and feedback history is durable.
16. As a job seeker, I want interview changes to create timeline events, so that the full application story remains intact.
17. As a job seeker, I want the backend to store follow-up reminders, so that upcoming tasks are recoverable.
18. As a job seeker, I want the backend to validate follow-up due dates, so that reminders remain meaningful.
19. As a job seeker, I want the backend to expose upcoming follow-ups, so that the frontend can show my next actions.
20. As a job seeker, I want the backend to expose overdue follow-ups, so that missed actions are visible.
21. As a job seeker, I want the backend to store notes, so that context is not trapped in local UI state.
22. As a job seeker, I want the backend to expose a timeline, so that the frontend can render a consistent application history.
23. As a job seeker, I want to query applications by stage, so that the frontend can render a pipeline board efficiently.
24. As a job seeker, I want to query applications by source, so that I can understand where opportunities are coming from.
25. As a job seeker, I want to search applications by company or role, so that I can find records quickly.
26. As a job seeker, I want to sort applications by last activity, so that stale applications are visible.
27. As a job seeker, I want to sort applications by follow-up date, so that urgent actions can be prioritized.
28. As a frontend client, I want a stable GraphQL schema, so that generated client operations can evolve safely.
29. As a frontend client, I want typed GraphQL errors, so that domain failures can be presented clearly.
30. As a frontend client, I want mutations to return updated application data, so that the UI can refresh without extra round trips.
31. As a frontend client, I want query shapes that match user workflows, so that the UI is not forced to compose many low-level calls.
32. As a learner, I want GraphQL resolvers to call use cases, so that GraphQL remains an adapter.
33. As a learner, I want sqlc-generated query code to stay outside the domain model, so that persistence remains an adapter.
34. As a learner, I want repository ports between use cases and sqlc, so that persistence can be swapped.
35. As a learner, I want Go interfaces and constructor injection to provide backend dependencies, so that dependency wiring is explicit and testable without a framework.
36. As a learner, I want backend use cases to return typed failures via Go's `(T, error)` convention, so that expected errors are not hidden in panics or untyped interfaces.
37. As a learner, I want GraphQL DTOs mapped separately from domain structs, so that the external API can evolve independently.
38. As a learner, I want sqlc query results mapped separately from domain structs, so that database schema changes do not leak into business rules.
39. As a developer, I want database migrations, so that schema changes are reviewable and repeatable.
40. As a developer, I want seed data for local development, so that the frontend can be exercised against a real backend later.
41. As a developer, I want backend tests with fake repositories, so that use cases are fast and deterministic.
42. As a developer, I want repository adapter tests, so that sqlc mappings are validated against a real test database.
43. As a developer, I want GraphQL API tests, so that query and mutation contracts are protected.
44. As a developer, I want backend error mapping tests, so that domain errors become predictable GraphQL responses.
45. As a developer, I want the backend to start locally with minimal setup, so that it can replace MSW when the frontend is ready.

## Implementation Decisions

- Treat this backend as future definition only; implementation will happen after the frontend-first version.
- Use a workspace-style repository layout organized around deployable applications.
- Place the future backend implementation under an `apps/api` application.
- Keep `apps/api` as documentation or placeholder structure until backend work begins.
- Keep the frontend implementation under `apps/web`.
- Let the backend domain and use cases become authoritative when the real API replaces the MSW-backed frontend mock API.
- Avoid sharing frontend and backend domain code initially; revisit shared packages only after the backend contract stabilizes.
- Use Go for the backend runtime.
- Use gqlgen as the GraphQL server and schema-first code generator.
- Use sqlc to generate type-safe Go from SQL queries; keep generated code behind repository adapters.
- Start with SQLite for low-friction local development unless there is a strong reason to start with Postgres.
- Keep Postgres as the likely later production-style database target.
- Use Go's standard `database/sql` with the appropriate driver (`modernc.org/sqlite` for SQLite, `lib/pq` or `pgx` for Postgres).
- Use `golang-migrate` or a similar tool for database migrations.
- Preserve a hexagonal architecture with domain, application, infrastructure, and GraphQL adapter boundaries.
- Define domain structs and value objects for job applications, interviews, follow-up reminders, notes, timeline events, and stages. Keep these free of persistence or transport concerns.
- Define repository ports as Go interfaces in the application layer; implement them with sqlc-backed adapters in the infrastructure layer.
- Define supporting ports as Go interfaces for clock, ID generation, transaction management, and logging.
- Wire dependencies through constructor injection; no dependency injection framework is required.
- Return typed errors from use cases using Go's `(T, error)` pattern with custom error types for expected domain failures.
- Keep GraphQL resolvers thin: parse inputs, call use cases, and map results or failures.
- Do not let resolvers directly perform business rule decisions.
- Do not let resolvers directly call sqlc queries for workflow mutations.
- Map sqlc query results to domain structs at the repository adapter boundary.
- Map domain structs to gqlgen-generated GraphQL types at the resolver boundary.
- Map GraphQL inputs to application commands before calling use cases.
- Return workflow-oriented GraphQL mutations rather than generic CRUD-only mutations.
- Include GraphQL queries for application detail, application pipeline, application search, upcoming follow-ups, and overdue follow-ups.
- Include GraphQL mutations for creating an application, advancing stage, scheduling an interview, recording interview outcome, adding a follow-up, completing a follow-up, adding a note, rejecting, withdrawing, and reopening.
- Model domain and application errors explicitly, then map them to GraphQL error responses.
- Keep authentication out of the first backend definition, but leave room to add user ownership later.
- Keep the backend compatible with the frontend GraphQL gateway adapter designed during the frontend-first implementation.
- Use MSW handlers as the temporary stand-in for this backend until it is implemented.

## Testing Decisions

- Good tests should verify behavior at public boundaries rather than implementation details.
- Domain tests should cover business rules, invariants, and timeline event creation.
- Use case tests should use fake repositories implementing the repository port interfaces, fake clocks, fake ID generators, and controlled constructor-injected dependencies.
- GraphQL resolver tests should verify that API operations call the intended use case behavior and return correct data or errors.
- GraphQL contract tests should cover the operations used by the frontend gateway.
- sqlc repository adapter tests should verify persistence mapping using a real local test database.
- Migration tests or checks should verify that the schema can be applied from an empty database.
- Error mapping tests should verify that expected domain failures become stable GraphQL responses.
- Transaction tests should verify that multi-step workflows do not partially persist on failure.
- No backend test prior art exists in the current repository because the codebase currently contains only a README and license.

## Out of Scope

- Backend implementation during the first frontend milestone.
- Authentication, authorization, and multi-user data isolation.
- Production deployment.
- Hosted database setup.
- Email, calendar, notification, or reminder delivery integrations.
- Resume parsing, AI assistance, or external job board scraping.
- Real-time GraphQL subscriptions.
- Full audit logging beyond application timeline events.
- Admin tools.
- Import/export workflows.

## Further Notes

- This backend should eventually replace the MSW GraphQL handlers without forcing a rewrite of frontend domain or presentation code.
- The backend will become the authoritative owner of business rule enforcement once implemented.
- The frontend can still keep client-side orchestration and UI state, but server-backed workflows should rely on backend use cases when the backend exists.
- Go was selected for the backend in place of Node.js/TypeScript. See ADR 0002 for rationale.
- sqlc was selected for persistence in place of TypeORM. Generated SQL query code stays behind repository port interfaces and never leaks into the domain.
- The most important backend architecture constraint is that GraphQL and sqlc remain adapters around the domain and application layers.
