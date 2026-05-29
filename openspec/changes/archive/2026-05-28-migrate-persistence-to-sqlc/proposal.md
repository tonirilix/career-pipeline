## Why

Hand-written scan code in the persistence adapters must match SQL column order manually — a mismatch is a silent runtime bug that only surfaces when the app runs. ADR 0003 identifies sqlc as the recommended next step and the `go-backend-persistence` spec already requires it; this change delivers that migration.

## What Changes

- Add `sqlc.yaml` configuration pointing at the existing PostgreSQL schema and a new `queries/` directory
- Move all SQL strings from `postgresql_queries.go` into typed `.sql` files under `internal/infrastructure/persistence/queries/`
- Run `sqlc generate` to produce type-safe Go query functions in `internal/infrastructure/persistence/generated/`
- Replace hand-written `scanFollowUp`, `scanFollowUpRows`, and equivalent scan helpers in all five repo files with calls to the generated functions
- Delete `postgresql_queries.go` (SQL now lives in `.sql` files) and the manual scan helpers
- Update ADR 0003 status from Open to Accepted
- Add a `make sqlc` target (or equivalent) so developers can regenerate after schema changes

## Capabilities

### New Capabilities

- `go-backend-sqlc-tooling`: sqlc configuration, `.sql` query files, and the `make sqlc` generation step that turns them into typed Go code

### Modified Capabilities

- `go-backend-persistence`: the "query mapping is concentrated behind repository adapters" requirement advances from the interim hand-written state to the sqlc-generated state described in the same requirement

## Impact

- **Changed**: `internal/infrastructure/persistence/` — all five repo files, `postgresql_queries.go` removed, new `queries/*.sql` and `generated/` added
- **Unchanged**: domain, ports, use-cases, GraphQL resolvers, migrations, schema — no other layer is touched
- **New dev dependency**: `sqlc` CLI (install via `brew install sqlc` or `go install`)
- **ADR 0003**: status updated to Accepted
