# apps/api — Go GraphQL Backend

A Go backend for the job application tracker. Exposes a GraphQL API consumed by `apps/web`.

## Stack

| Concern | Choice |
|---|---|
| GraphQL server | [gqlgen](https://gqlgen.com) (schema-first) |
| Database | SQLite via `modernc.org/sqlite` (pure Go, no CGO) |
| Migrations | [golang-migrate](https://github.com/golang-migrate/migrate) (embedded, runs at startup) |
| Persistence | Hand-written `database/sql` repository adapters |

## Architecture

Follows hexagonal architecture with four explicit layers:

```
cmd/api/                        ← entrypoint, wiring
graph/
  schema.graphqls               ← GraphQL schema (source of truth)
  generated.go                  ← gqlgen-generated types
  resolvers/                    ← GraphQL adapter layer
    schema.resolvers.go         ← thin: parse input → call use case → map result
    mapping.go                  ← domain structs → GraphQL DTOs
internal/
  domain/                       ← pure business rules, no imports from other layers
    stage.go                    ← ApplicationStage type, ValidateStageTransition
    job_application.go          ← all domain structs
    errors.go                   ← sentinel error values
  application/
    ports/                      ← repository and supporting interfaces
    usecases/                   ← one file per use case
  infrastructure/
    migrations/                 ← SQL migration files (up + down)
    persistence/                ← SQLite repository adapters
```

Dependency direction: `resolvers → usecases → domain ← persistence`.
Neither domain nor use cases import gqlgen or `database/sql`.

## Running locally

```sh
go run ./cmd/api
```

Flags:

| Flag | Effect |
|---|---|
| `--migrate-only` | Run migrations and exit |
| `--seed-only` | Seed the database and exit |

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP listen port |
| `DB_PATH` | `./data/tracker.db` | SQLite database path |
| `APP_ENV` | _(unset)_ | Set to `development` to enable the GraphQL Playground at `/` |

On first start the database is migrated and seeded automatically if it is empty. Subsequent starts skip seeding.

## GraphQL Playground

```sh
APP_ENV=development go run ./cmd/api
```

Open `http://localhost:8080/` in a browser.

## Building

```sh
go build -o api ./cmd/api
./api
```

## Tests

```sh
go test ./...
```

- `internal/domain/` — stage transition and validation unit tests
- `internal/application/usecases/` — use case tests with fake repositories and a fake clock
- `internal/infrastructure/persistence/` — repository adapter integration tests against an in-memory SQLite database

## Makefile targets

```sh
make build      # go build ./cmd/api
make run        # go run ./cmd/api
make test       # go test ./...
make generate   # go run github.com/99designs/gqlgen generate
```

## Schema changes

Edit `graph/schema.graphqls`, then regenerate:

```sh
make generate
```

Implement any new resolver stubs in `graph/resolvers/schema.resolvers.go`.

## Database

### How the database is created

On first `go run ./cmd/api`:

1. `data/tracker.db` is created if it does not exist.
2. All migrations run automatically (golang-migrate, embedded in the binary).
3. If the `job_applications` table is empty, seed data is inserted automatically.

Subsequent starts skip step 3 — existing data is never overwritten.

### Seed data

The seed file is `cmd/api/seed.sql`. It inserts one application per pipeline stage so every part of the UI is exercisable immediately:

| ID | Company | Stage | Notes |
|---|---|---|---|
| seed-1 | Stripe | Saved | — |
| seed-2 | Vercel | Applied | Overdue follow-up attached |
| seed-3 | Linear | Screening | Recruiter screen interview + completed follow-up |
| seed-4 | Notion | Onsite | Full interview chain + two notes |
| seed-5 | Figma | Offer | Full interview chain + note |
| seed-6 | Atlassian | Rejected | — |
| seed-7 | GitHub | Withdrawn | — |

### Resetting the database

Delete the file and restart — migrations and seeding run again from scratch:

```sh
rm data/tracker.db
go run ./cmd/api
```

### Re-seeding without resetting

Run the seed flag against an existing (empty) database. Only works if the tables are empty, otherwise the INSERT will fail on duplicate IDs.

```sh
go run ./cmd/api --seed-only
```

To force a re-seed on a populated database, reset instead (see above).

### Why migrations live in two places

Migration files appear under both `cmd/api/migrations/` and `internal/infrastructure/migrations/`:

- `cmd/api/migrations/` — embedded into the binary via `//go:embed` and run at startup by the server.
- `internal/infrastructure/migrations/` — used by the repository adapter integration tests, which spin up an in-memory SQLite database and apply the schema before each test run.

Both sets of files must be kept in sync. When adding a migration, create the numbered `.up.sql` / `.down.sql` pair in **both** locations.

### Adding a migration

```
apps/api/cmd/api/migrations/006_<name>.up.sql
apps/api/cmd/api/migrations/006_<name>.down.sql
apps/api/internal/infrastructure/migrations/006_<name>.up.sql
apps/api/internal/infrastructure/migrations/006_<name>.down.sql
```

Migrations run automatically at startup via golang-migrate. There is no separate migrate command needed.

### Rolling back a migration

golang-migrate supports down migrations but the server does not expose a rollback flag. To roll back manually:

```sh
# Install the migrate CLI
go install -tags 'sqlite' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Roll back one step
migrate -source file://cmd/api/migrations -database "sqlite://data/tracker.db" down 1
```
