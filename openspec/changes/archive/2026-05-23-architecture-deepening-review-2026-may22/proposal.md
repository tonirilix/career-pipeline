## Why

The architecture review found several shallow modules where workflow knowledge, read-model assembly, GraphQL contract details, and mock backend behavior are spread across callers. Deepening these modules now will improve locality before more Job Application workflows are added and before the frontend relies more heavily on the real Go backend.

## What Changes

- Add an explicit backend Job Application rehydration module so use cases stop carrying every child repository just to return a full Job Application.
- Add transactional workflow persistence for multi-step backend Job Application commands so stage changes, timeline events, follow-up deactivation, notes, interviews, and reminders do not partially persist.
- Extract frontend Pipeline workspace behavior from `App.tsx` into a deeper module that owns loading, command execution, local read-model updates, filtering, sorting, follow-up grouping, and command error state.
- Split the MSW GraphQL handlers from the in-memory mock backend so MSW remains a transport adapter and mock Job Application behavior has one implementation.
- Tighten the GraphQL contract between frontend and backend so schema values, operation shapes, DTO mapping, and domain error mapping are verified in one place.
- Move PostgreSQL query and scan boilerplate toward the ADR 0003 direction, keeping SQL visible while increasing type and mapping locality.

## Capabilities

### New Capabilities

- `architecture-deepening`: Covers module depth, locality, and test-surface requirements for the backend Job Application rehydration module, backend workflow transactions, frontend Pipeline workspace module, and MSW mock backend adapter.

### Modified Capabilities

- `go-backend-graphql-adapter`: Require the GraphQL schema and frontend gateway contract to use stable, verified enum and operation shapes rather than unchecked string drift.
- `go-backend-persistence`: Require PostgreSQL query mapping to concentrate raw SQL or generated query code behind repository adapters, with a path toward ADR 0003's sqlc recommendation.

## Impact

- Affected frontend files: `apps/web/src/presentation/App.tsx`, `apps/web/src/application/`, `apps/web/src/infrastructure/graphql/`, `apps/web/src/infrastructure/msw/`, and related tests.
- Affected backend files: `apps/api/internal/application/usecases/`, `apps/api/internal/application/ports/`, `apps/api/internal/infrastructure/persistence/`, `apps/api/graph/`, `apps/api/cmd/api/main.go`, and related tests.
- Public user-facing behavior should remain unchanged.
- The GraphQL schema and frontend gateway may need coordinated updates, but the intent is compatibility by verification rather than a breaking product change.
