## Context

`apps/api` currently opens SQLite through `modernc.org/sqlite`, uses golang-migrate's SQLite driver, embeds SQLite migration SQL, seeds from SQL at startup, and wires repository adapters named `SQLite*Repository`. The application and domain layers depend only on repository ports, so the database replacement should stay inside infrastructure, entrypoint wiring, and developer tooling.

The existing active backend OpenSpec change planned SQLite as the local development database. This change revises that direction before the persistence layer becomes the stable baseline: PostgreSQL becomes the backend database for local development and future deployment alignment.

## Goals / Non-Goals

**Goals:**

- Make PostgreSQL the only supported backend database.
- Use a single `DATABASE_URL` connection string for runtime, migration, seed, and tests.
- Convert migration and seed SQL to PostgreSQL syntax.
- Replace SQLite driver and migration integration with PostgreSQL equivalents.
- Keep GraphQL schema, use-case APIs, domain structs, and application port interfaces unchanged.
- Provide a repeatable local development database setup.

**Non-Goals:**

- No production hosting, backups, replication, or cloud database provisioning.
- No multi-tenant data model or authentication.
- No GraphQL API shape changes.
- No ORM adoption.
- No backwards-compatible migration from existing local SQLite `.db` files.

## Decisions

### D1: Use `database/sql` with pgx stdlib

Use `github.com/jackc/pgx/v5/stdlib` as the PostgreSQL driver behind `database/sql`.

**Why**: The repository adapters already use `*sql.DB`, so this avoids changing application wiring beyond the driver name and connection string. pgx is the dominant modern PostgreSQL driver in Go and works both through its native API and the standard library compatibility layer.

**Alternative considered**: Use native pgx pools directly. Rejected for this change because it would broaden the adapter surface and require more wiring changes without improving the immediate database replacement.

### D2: Use `DATABASE_URL` as the required database configuration

Runtime startup, `--migrate-only`, `--seed-only`, Makefile targets, and tests must all use a PostgreSQL connection string such as `postgres://tracker:tracker@localhost:5432/tracker?sslmode=disable`.

**Why**: PostgreSQL is not a local file, so `DB_PATH` is the wrong abstraction. A URL is portable across local Docker, CI, and hosted PostgreSQL.

**Alternative considered**: Separate `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` variables. Rejected because it spreads one configuration value across several fields and makes Makefile/CI setup noisier.

### D3: Keep migrations embedded and run through golang-migrate

Keep the existing embedded startup migration pattern, but switch from the SQLite migrate driver to the PostgreSQL migrate driver.

**Why**: The startup behavior is already documented and useful for local development. The change is the database dialect, not the migration lifecycle.

**Alternative considered**: Move migrations to a separate CLI-only workflow. Rejected for now because it would change developer startup behavior and create more work before the backend has deployment requirements.

### D4: Replace SQLite SQL with PostgreSQL SQL

Migrations and seed SQL must use PostgreSQL-compatible column types, parameter semantics, timestamp handling, and constraints. Repository queries must use PostgreSQL placeholders (`$1`, `$2`, ...), not SQLite `?` placeholders.

**Why**: Relying on SQLite-compatible SQL would hide dialect differences and leave tests unable to prove PostgreSQL behavior.

**Alternative considered**: Keep SQL mostly generic. Rejected because the value of this change is to make PostgreSQL the concrete persistence contract.

### D5: Test persistence against PostgreSQL

Persistence adapter integration tests must run against an isolated PostgreSQL database. The test setup should skip with a clear message when `TEST_DATABASE_URL` is absent, while CI or local contributors can opt in by providing it.

**Why**: PostgreSQL behavior cannot be validated with SQLite. Skipping without configuration keeps ordinary unit tests usable while making true persistence verification available and explicit.

**Alternative considered**: Use testcontainers. Rejected for this first pass because it adds Docker orchestration code and another dependency; a documented `TEST_DATABASE_URL` is enough for the current repo.

## Risks / Trade-offs

- PostgreSQL requires a running external process → provide Docker Compose or Makefile targets to start it locally.
- Persistence integration tests need database setup → isolate tests with truncation or per-test schema reset and document `TEST_DATABASE_URL`.
- Startup migrations can fail if the database is unavailable → fail fast with an actionable error mentioning `DATABASE_URL`.
- Local SQLite data cannot be read after this change → explicitly document that local SQLite files are unsupported and must be reseeded into PostgreSQL.

## Migration Plan

1. Add PostgreSQL driver dependencies and remove SQLite-specific dependencies once unused.
2. Replace `DB_PATH` handling with required or defaulted `DATABASE_URL` handling.
3. Switch golang-migrate from SQLite to PostgreSQL.
4. Convert migration files and seed SQL to PostgreSQL-compatible SQL.
5. Rename and update persistence adapters from SQLite to PostgreSQL, including placeholders and timestamp scanning.
6. Update Makefile and README with local PostgreSQL startup, migration, seeding, and reset instructions.
7. Update persistence tests to run against `TEST_DATABASE_URL`.
8. Run Go unit tests and PostgreSQL-backed persistence tests.

**Rollback**: Revert this change and restore SQLite driver, migrations, README instructions, and adapter wiring. Local PostgreSQL data created under this change is not automatically migrated back to SQLite.

## Open Questions

- Should local PostgreSQL be managed by a committed `docker-compose.yml`, or should the README only document the command to run a container?
- Should `DATABASE_URL` have a local default, or should startup require it explicitly to avoid connecting to the wrong database?
