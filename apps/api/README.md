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

## Adding a migration

Create numbered up/down files in both locations (the embed requires files in `cmd/api/migrations/`):

```
apps/api/cmd/api/migrations/006_<name>.up.sql
apps/api/cmd/api/migrations/006_<name>.down.sql
apps/api/internal/infrastructure/migrations/006_<name>.up.sql
apps/api/internal/infrastructure/migrations/006_<name>.down.sql
```

Migrations run automatically at startup via golang-migrate.
