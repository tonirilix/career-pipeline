# ADR 0001: Use `apps/web` and `apps/api` Workspace Layout

## Status

Accepted

## Context

Career Pipeline is a learning implementation of hexagonal architecture for a job application tracker. The first deliverable is a React frontend that uses GraphQL operations intercepted by MSW instead of a real backend. A future backend is planned using GraphQL Yoga, Pothos, Effect, TypeORM, and a SQL database.

The repository currently has no application scaffold, so the layout decision can be made before implementation starts.

## Decision

Use a workspace-style repository organized around deployable applications:

- `apps/web` for the React frontend.
- `apps/api` for the future GraphQL backend.
- Optional shared packages may be introduced later only when a stable cross-app contract exists.

During the first milestone, `apps/web` owns the runnable implementation, including client-side domain rules, application use cases, GraphQL gateway adapter, MSW GraphQL handlers, Zustand UI state, and React presentation code.

During the future backend milestone, `apps/api` will own the authoritative backend domain rules, backend application use cases, GraphQL API, Effect dependency layers, and TypeORM persistence adapter.

## Rationale

This layout keeps deployable boundaries explicit without forcing the project into a backend implementation too early. It also leaves room for future tools such as documentation, scripts, end-to-end tests, Storybook, or shared packages without making the root directory ambiguous.

The project intentionally avoids sharing frontend and backend domain code at the start. Sharing too early would blur the learning goal because the frontend-first implementation needs local domain behavior while MSW stands in for the backend. Once the real backend exists, the backend can become the authoritative owner of domain rules and the frontend can become thinner.

## Alternatives Considered

- Root-level `frontend` and `backend` folders: simple, but less flexible as the repository grows and less aligned with deployable application naming.
- A single React-only project: fastest for initial UI work, but it hides the planned backend boundary and makes the later API addition feel bolted on.
- Shared domain package from the beginning: attractive in theory, but premature for this learning project and likely to couple frontend and backend before the API contract is stable.

## Consequences

- The first implementation can focus on `apps/web` without blocking on backend infrastructure.
- The future backend has an obvious home in `apps/api`.
- Documentation and tests can refer to deployable app boundaries consistently.
- Any later shared package must justify itself by reducing stable duplication rather than merely avoiding similar names in frontend and backend code.
