## Context

The persistence layer currently uses raw `database/sql` with SQL strings centralised in `postgresql_queries.go` and hand-written scan functions (`scanFollowUp`, `scanFollowUpRows`, etc.) duplicated across five repository files. The scan functions must mirror column order in the SQL strings with no compile-time enforcement — a column added to a query and not added to the scan silently corrupts data or panics at runtime.

ADR 0003 documented this as an interim state and recommended sqlc as the migration target. The `go-backend-persistence` spec already requires that repository callers do not know SQL text or scan order, and that a developer can run query generation. This design delivers both.

The domain, ports, use-cases, and GraphQL resolver layers are already fully isolated from persistence internals via port interfaces — nothing above `internal/infrastructure/persistence/` changes.

## Goals / Non-Goals

**Goals:**
- Replace hand-written scan helpers with sqlc-generated type-safe query functions
- Move SQL strings from Go constants into `.sql` files that sqlc can parse and validate against the schema
- Keep the repository adapter structs as the only entry point to persistence — callers continue to use port interfaces unchanged
- Provide a `make sqlc` (or `go generate`) target so developers can regenerate after schema changes
- Update ADR 0003 status to Accepted

**Non-Goals:**
- Changing the PostgreSQL schema or migrations
- Changing domain structs, port interfaces, use-cases, or resolvers
- Adding new queries beyond what currently exists
- Switching to an ORM or query builder

## Decisions

### 1. sqlc over sqlx

sqlx removes scan boilerplate but SQL remains strings — mismatches are still runtime failures. sqlc validates SQL at generation time against the actual schema, so a bad column reference or type mismatch fails before the app runs. ADR 0003 already chose sqlc as the long-term target; this decision is already made.

### 2. Generated code lives in `internal/infrastructure/persistence/db/`

sqlc conventionally outputs to a `db/` package. Keeping it inside `persistence/` means the generated package is an implementation detail — nothing outside `persistence/` imports it. Repository adapter files import `db` internally, the same way they currently use unexported scan helpers.

### 3. SQL files live in `internal/infrastructure/persistence/queries/`

One `.sql` file per aggregate (e.g., `follow_ups.sql`, `interviews.sql`). This matches the existing one-repo-file-per-aggregate structure and makes it easy to find the SQL for a given domain concept.

### 4. `postgresql_queries.go` is deleted, not kept alongside

Keeping both would create two sources of truth for query text. Once generated code is wired up and tests pass, the hand-written constants file is removed entirely. The commit history preserves the before state.

### 5. Repository adapter structs gain a `*db.Queries` field

Each adapter currently holds a `sqlExecutor` (the `*sql.DB` or transaction). After migration, adapters hold both a `*db.Queries` (for non-transactional reads) and accept a `*db.Queries` built over a transaction executor for write use-cases. The `NewPostgreSQL*Repository` constructor signatures update accordingly. The transactor pattern already in place is preserved.

## Risks / Trade-offs

- **sqlc CLI as dev dependency** → Document installation in README and add to `Makefile`; generated files are committed so CI does not require the CLI at build time.
- **Generated code is not hand-edited** → Any query change goes through `.sql` → `sqlc generate` → commit generated output. This is a new workflow step; the `Makefile` target makes it one command.
- **Nullable columns need careful type mapping** → sqlc maps nullable columns to pointers or `sql.NullX` types. `completed_at` in `follow_up_reminders` is already handled as `*time.Time` in the current scan code; the sqlc type mapping must match. The `sqlc.yaml` `overrides` section will pin nullable timestamps to `*time.Time` to match domain structs.
- **Transaction support** → sqlc generates a `*Queries` struct that can be constructed from any `DBTX` interface (`*sql.DB` or `*sql.Tx`). The existing `sqlExecutor` interface already satisfies `DBTX`, so the transactor pattern needs only minor wiring updates.

## Migration Plan

1. Install sqlc locally (`brew install sqlc`)
2. Write `sqlc.yaml` at `apps/api/internal/infrastructure/persistence/sqlc.yaml` pointing at the existing schema migration files and the new `queries/` directory
3. Create `.sql` query files, copying SQL text from `postgresql_queries.go` and annotating each with `-- name: <FuncName> :one/:many/:exec`
4. Run `sqlc generate`; fix any type mapping issues in `sqlc.yaml` overrides
5. Update each repository adapter to use generated functions, one aggregate at a time (follow-ups → interviews → notes → job applications → timeline)
6. Run `go test ./...` after each adapter to catch regressions
7. Delete `postgresql_queries.go` and hand-written scan helpers once all adapters pass
8. Add `make sqlc` target
9. Update ADR 0003 status to Accepted

Rollback: the change is confined to one package. If sqlc introduces issues, reverting the persistence package to its prior state restores behaviour without touching any other layer.

## Open Questions

- None. ADR 0003 and the existing spec already resolve the key decisions. The migration is mechanical once sqlc type overrides for nullable timestamps are confirmed.
