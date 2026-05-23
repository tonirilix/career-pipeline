# apps/api - Go GraphQL Backend

A Go backend for the job application tracker. Exposes a GraphQL API consumed by `apps/web`.

## Stack

| Concern | Choice |
|---|---|
| GraphQL server | [gqlgen](https://gqlgen.com) (schema-first) |
| Database | PostgreSQL via pgx stdlib |
| Migrations | [golang-migrate](https://github.com/golang-migrate/migrate) (embedded, runs at startup) |
| Persistence | Hand-written `database/sql` repository adapters with centralized PostgreSQL query definitions |

## Architecture

Follows hexagonal architecture with four explicit layers:

```text
cmd/api/                        <- entrypoint, wiring
graph/
  schema.graphqls               <- GraphQL schema (source of truth)
  generated.go                  <- gqlgen-generated types
  resolvers/                    <- GraphQL adapter layer
    schema.resolvers.go         <- thin: parse input -> call use case -> map result
    mapping.go                  <- domain structs -> GraphQL DTOs
internal/
  domain/                       <- pure business rules, no imports from other layers
  application/
    ports/                      <- repository and supporting interfaces
    usecases/                   <- one file per use case
  infrastructure/
    migrations/                 <- SQL migration files (up + down)
    persistence/                <- PostgreSQL repository adapters
      postgresql_queries.go     <- centralized SQL text for interim raw-SQL strategy
```

Dependency direction: `resolvers -> usecases -> domain <- persistence`.
Neither domain nor use cases import gqlgen or `database/sql`.

## Running Locally

Start PostgreSQL:

```sh
make db-up
```

Run the API:

```sh
make run
```

The default local database URL is:

```text
postgres://tracker:tracker@localhost:5432/tracker?sslmode=disable
```

You can override it for any target:

```sh
DATABASE_URL="postgres://user:pass@localhost:5432/db?sslmode=disable" make run
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
| `DATABASE_URL` | _(required by binary)_ | PostgreSQL connection string |
| `APP_ENV` | _(unset)_ | Set to `development` to enable the GraphQL Playground at `/` |

The Makefile supplies a local `DATABASE_URL` by default. Running the binary directly requires setting `DATABASE_URL`.

## GraphQL Playground

```sh
make run
```

Open `http://localhost:8080/` in a browser.

## Building

```sh
go build -o api ./cmd/api
DATABASE_URL="postgres://tracker:tracker@localhost:5432/tracker?sslmode=disable" ./api
```

## Tests

```sh
go test ./...
```

- `internal/domain/` - stage transition and validation unit tests
- `internal/application/usecases/` - use case tests with fake repositories and a fake clock
- `internal/infrastructure/persistence/` - repository adapter integration tests against PostgreSQL

Persistence tests require `TEST_DATABASE_URL`. Without it, those tests skip with a clear message:

```sh
make test-db
```

## Makefile Targets

```sh
make db-up      # start local PostgreSQL
make db-down    # stop local PostgreSQL
make db-reset   # remove PostgreSQL volume and start fresh
make build      # go build ./cmd/api
make run        # run API with APP_ENV=development
make test       # go test ./...
make test-db    # run PostgreSQL persistence tests
make migrate    # run embedded migrations and exit
make seed       # run seed data and exit
make generate   # go generate ./...
```

## Schema Changes

Edit `graph/schema.graphqls`, then regenerate:

```sh
make generate
```

Implement any new resolver stubs in `graph/resolvers/schema.resolvers.go`.

## Database

### Query strategy

The current persistence implementation uses raw `database/sql` repository adapters with SQL text centralized in `internal/infrastructure/persistence/postgresql_queries.go`. Repository callers interact only with application-layer ports; they do not know SQL text, placeholder numbering, row scan order, or generated query types.

ADR 0003 still recommends sqlc as the long-term query strategy. To migrate:

1. Install sqlc with `brew install sqlc` or `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`.
2. Move reviewed SQL from `postgresql_queries.go` into `.sql` query files under `internal/infrastructure/persistence/queries/`.
3. Add `sqlc.yaml` and run `sqlc generate`.
4. Replace repository adapter internals with generated query calls while keeping application port interfaces unchanged.
5. Update ADR 0003 from Open to Accepted if sqlc becomes the committed strategy.

### How the database is created

On first `make run`:

1. The API connects to PostgreSQL using `DATABASE_URL`.
2. All embedded migrations run automatically.
3. If the `job_applications` table is empty, seed data is inserted automatically.

Subsequent starts skip step 3. Existing data is never overwritten.

### Seed data

The seed file is `cmd/api/seed.sql`. It inserts one application per pipeline stage so every part of the UI is exercisable immediately:

| ID | Company | Stage | Notes |
|---|---|---|---|
| seed-1 | Stripe | Saved | - |
| seed-2 | Vercel | Applied | Overdue follow-up attached |
| seed-3 | Linear | Screening | Recruiter screen interview + completed follow-up |
| seed-4 | Notion | Onsite | Full interview chain + two notes |
| seed-5 | Figma | Offer | Full interview chain + note |
| seed-6 | Atlassian | Rejected | - |
| seed-7 | GitHub | Withdrawn | - |

### Resetting the database

```sh
make db-reset
make migrate
make seed
```

### Re-seeding without resetting

Run the seed flag against an existing empty database. It intentionally fails on duplicate IDs if seed data already exists.

```sh
make seed
```

### Migration files

Migration files appear under both `cmd/api/migrations/` and `internal/infrastructure/migrations/`:

- `cmd/api/migrations/` - embedded into the binary via `//go:embed` and run at startup by the server.
- `internal/infrastructure/migrations/` - kept as infrastructure migration source for tests and review.

Both sets of files must be kept in sync. When adding a migration, create the numbered `.up.sql` / `.down.sql` pair in both locations.

### Rolling back a migration

golang-migrate supports down migrations but the server does not expose a rollback flag. To roll back manually:

```sh
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
migrate -source file://cmd/api/migrations -database "$DATABASE_URL" down 1
```
