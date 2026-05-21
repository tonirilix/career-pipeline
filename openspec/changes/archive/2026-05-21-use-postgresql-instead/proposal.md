## Why

The backend persistence plan currently assumes SQLite for local development, but the application is already moving toward a real API with durable data and future deployment needs. PostgreSQL should be the default database now so schema, migrations, repository behavior, and local development match the production-grade database target from the start.

## What Changes

- Replace the backend's SQLite persistence target with PostgreSQL.
- Update migrations and seed data to use PostgreSQL-compatible SQL and constraints.
- Replace SQLite repository adapters and test setup with PostgreSQL-backed adapters.
- Add local development database configuration, including connection-string based startup and documented Docker Compose usage.
- Keep the domain, application port interfaces, use cases, and GraphQL schema unchanged.
- **BREAKING**: Existing local SQLite database files and SQLite-specific setup will no longer be supported by the backend.

## Capabilities

### New Capabilities

- `go-backend-postgresql-persistence`: PostgreSQL database configuration, migrations, seed data, repository adapters, and persistence tests for the Go backend.

### Modified Capabilities

<!-- No archived OpenSpec backend capability exists yet. This change supersedes the SQLite assumption in the active backend work rather than modifying a finalized capability. -->

## Impact

- Affected: `apps/api/internal/infrastructure/migrations/`
- Affected: `apps/api/internal/infrastructure/persistence/`
- Affected: `apps/api/cmd/api/main.go`
- Affected: `apps/api/README.md`, `apps/api/Makefile`, and local development configuration
- Dependencies: add PostgreSQL driver support for Go, likely `github.com/jackc/pgx/v5/stdlib`
- Test infrastructure: persistence adapter tests require an isolated PostgreSQL database instead of an in-memory or file-backed SQLite database
