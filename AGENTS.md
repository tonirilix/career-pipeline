# AGENTS.md

## Project Goal

Build a job application tracker as a learning project for hexagonal architecture in React.

## Architecture Rules

- Keep domain rules independent from React, Zustand, GraphQL, MSW, Effect, and persistence tools.
- Treat GraphQL, MSW, Zustand, and future TypeORM persistence as adapters around the domain and application layers.
- Implement the frontend first under `apps/web`.
- Keep the future backend under `apps/api`.
- Do not introduce shared frontend/backend domain packages until the backend contract stabilizes.
- Prefer deep, testable modules with small public interfaces over shallow technology wrappers.

## Current Implementation Direction

- Build the frontend first.
- Use MSW GraphQL handlers as the temporary backend substitute.
- Use Zustand for UI and interaction state only.
- Use Effect intentionally for use cases, dependency wiring, typed failures, and async workflows.
- Keep GraphQL types as transport DTOs, not domain entities.
- Keep future TypeORM entities as persistence records, not domain entities.

## Testing Expectations

- Prioritize domain and use case tests.
- Test behavior through public interfaces.
- Avoid tests coupled to implementation details.
- Use fake ports for clocks, ID generators, gateways, and repositories where possible.

## Reference Docs

- Frontend PRD: `docs/prd/frontend-job-application-tracker.md`
- Future Backend PRD: `docs/prd/future-backend-job-application-tracker.md`
- Workspace ADR: `docs/adr/0001-use-apps-web-and-apps-api-workspace.md`
