## Why

The frontend currently uses MSW handlers to simulate a GraphQL backend. This is a temporary stand-in that prevents real data persistence, makes the app single-session only, and blocks future work like multi-device access or authentication. Implementing the Go backend defined in the PRD and ADR 0002 will replace MSW with a real server, make application data durable, and complete the hexagonal architecture learning exercise end-to-end.

## What Changes

- Introduce a new `apps/api` Go application with full hexagonal architecture (domain, application, infrastructure, GraphQL adapter layers)
- Implement a GraphQL API (gqlgen, schema-first) that is compatible with the existing frontend gateway adapter — no frontend changes required
- Persist data through repository ports backed by sqlc-generated SQL queries against SQLite (local dev)
- Replace MSW mock handlers with real GraphQL operations once the server is running
- Add database migrations (golang-migrate) and local dev seed data
- Wire all dependencies through constructor injection; no framework required

## Capabilities

### New Capabilities

- `go-backend-domain`: Core Go domain structs, value objects, and business rules for job applications, interviews, follow-up reminders, notes, and timeline events
- `go-backend-use-cases`: Application layer use cases with repository port interfaces, typed error returns via `(T, error)`, and supporting ports (clock, ID generation)
- `go-backend-graphql-adapter`: gqlgen schema-first GraphQL API — schema definition, resolver mapping, input-to-command mapping, domain-to-GraphQL type mapping
- `go-backend-persistence`: sqlc-generated repository adapters, SQL migrations (golang-migrate), SQLite driver for local dev, repository port implementations
- `go-backend-wiring`: Main entrypoint, constructor injection wiring of all layers, local development server setup

### Modified Capabilities

<!-- No existing frontend spec-level requirements are changing. MSW replacement is a backend concern only. -->

## Impact

- New: `apps/api/` directory with Go module (`go.mod`, `go.sum`)
- New: `apps/api/graph/schema.graphqls` — GraphQL schema (contract with frontend)
- New: `apps/api/internal/domain/` — domain structs and business rules
- New: `apps/api/internal/application/` — use cases and port interfaces
- New: `apps/api/internal/infrastructure/` — sqlc adapters and migrations
- New: `apps/api/cmd/api/` — main entrypoint
- Dependencies: `github.com/99designs/gqlgen`, `github.com/sqlc-dev/sqlc`, `modernc.org/sqlite`, `github.com/golang-migrate/migrate`
- Frontend: no changes required — existing GraphQL gateway adapter will point to the real server URL instead of MSW
