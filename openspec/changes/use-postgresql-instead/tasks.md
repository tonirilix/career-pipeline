## 1. Dependencies and Configuration

- [x] 1.1 Add PostgreSQL driver and golang-migrate PostgreSQL dependencies to `apps/api/go.mod`.
- [x] 1.2 Remove SQLite driver and golang-migrate SQLite dependencies after the code no longer imports them.
- [x] 1.3 Replace `DB_PATH` startup configuration with `DATABASE_URL` connection-string handling.
- [x] 1.4 Ensure missing or invalid `DATABASE_URL` fails startup with an actionable error.

## 2. Runtime Wiring and Migrations

- [x] 2.1 Change `cmd/api/main.go` to open PostgreSQL through `database/sql` and pgx stdlib.
- [x] 2.2 Change startup migration wiring from the SQLite migrate driver to the PostgreSQL migrate driver.
- [x] 2.3 Convert embedded migration files under `cmd/api/migrations/` to PostgreSQL-compatible SQL.
- [x] 2.4 Convert test migration files under `internal/infrastructure/migrations/` to PostgreSQL-compatible SQL or remove the duplicate test copy if no longer needed.

## 3. Persistence Adapters

- [x] 3.1 Rename SQLite repository adapter types and constructors to PostgreSQL names.
- [x] 3.2 Replace SQLite `?` placeholders with PostgreSQL `$1`, `$2`, ... placeholders in all repository queries.
- [x] 3.3 Update timestamp persistence and scanning to use PostgreSQL timestamp values directly.
- [x] 3.4 Compile-check each PostgreSQL adapter against its application repository port.
- [x] 3.5 Verify domain and application packages still do not import infrastructure or PostgreSQL driver packages.

## 4. Seed Data and Local Workflow

- [x] 4.1 Convert `cmd/api/seed.sql` and persistence seed SQL to PostgreSQL-compatible SQL.
- [x] 4.2 Add a documented local PostgreSQL startup workflow using Docker Compose or an equivalent Makefile target.
- [x] 4.3 Update `apps/api/Makefile` targets to pass `DATABASE_URL` for run, migrate, seed, and test workflows.
- [x] 4.4 Update `apps/api/README.md` to remove SQLite instructions and document PostgreSQL setup, reset, migration, and seeding.

## 5. Tests and Verification

- [x] 5.1 Update persistence adapter integration tests to use `TEST_DATABASE_URL` and skip with a clear message when absent.
- [x] 5.2 Ensure persistence tests isolate data by truncating or recreating schema between test cases.
- [x] 5.3 Run `go test ./...` for domain, application, GraphQL, and non-database tests.
- [ ] 5.4 Run PostgreSQL-backed persistence tests with `TEST_DATABASE_URL` configured.
- [ ] 5.5 Run `go run ./cmd/api --migrate-only` and `go run ./cmd/api --seed-only` against PostgreSQL.
