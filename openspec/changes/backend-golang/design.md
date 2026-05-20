## Context

The React frontend at `apps/web` currently uses MSW (Mock Service Worker) to intercept GraphQL requests and return in-memory data. This works for development but provides no real persistence. The `apps/api` directory is currently a placeholder. The goal is to implement a real Go backend that the frontend's existing GraphQL gateway adapter can be pointed at with minimal changes.

The backend must follow hexagonal architecture: domain and application layers contain no framework or infrastructure concerns; GraphQL (gqlgen) and SQL (sqlc) are adapters that plug in from outside. This is both a functional requirement and a learning objective — the architecture must make layer boundaries visible.

ADR 0002 documents the technology choices. The PRD documents the full set of use cases and GraphQL operations required.

## Goals / Non-Goals

**Goals:**
- Implement all domain structs, business rules, and value objects for job applications in Go
- Implement all application use cases with repository port interfaces and typed error returns
- Implement a gqlgen-based GraphQL API with a schema compatible with the existing frontend gateway
- Implement sqlc-backed repository adapters with SQLite for local development
- Add database migrations with golang-migrate
- Wire everything with constructor injection — no DI framework
- Provide seed data for local development
- Support all queries and mutations used by the frontend: create application, advance stage, schedule interview, record outcome, add follow-up, complete follow-up, add note, reject, withdraw, reopen, and all read queries

**Non-Goals:**
- Authentication or multi-user data isolation (ADR 0002 and PRD explicitly defer this)
- Production deployment or hosted database setup
- Postgres support (SQLite only for now; Postgres is a later migration)
- Real-time subscriptions
- Frontend code changes (the gateway adapter's URL is the only change needed)
- Import/export, notifications, AI assistance

## Decisions

### D1: Directory layout inside `apps/api`

```
apps/api/
  cmd/api/            # main entrypoint — wires everything, starts HTTP server
  graph/
    schema.graphqls   # GraphQL schema (contract with frontend)
    resolver.go       # gqlgen-generated resolver interface
    resolvers/        # implementation of each resolver
  internal/
    domain/           # structs, value objects, business rules — no imports from other internal packages
    application/
      ports/          # repository + supporting port interfaces (Go interfaces)
      usecases/       # one file per use case
    infrastructure/
      persistence/    # sqlc-generated code + repository adapter implementations
      migrations/     # .sql migration files
  go.mod
  go.sum
  sqlc.yaml
  gqlgen.yml
  tools.go
```

**Why**: This layout makes the hexagonal layers visible as directory boundaries. `internal/domain` can only import stdlib; `internal/application` can only import `domain`; `infrastructure` and `graph` implement the ports and call use cases respectively.

### D2: Schema-first GraphQL with gqlgen

Write the `.graphqls` schema first. Run `go generate` to produce resolver interfaces. Implement resolvers as thin mapping functions: parse GraphQL input → construct command → call use case → map result or error to GraphQL type.

**Why**: Schema-first keeps the API contract explicit and independent of Go types. The generated interfaces enforce that every operation is implemented at compile time. Resolvers never contain business logic.

**Alternative considered**: Hand-writing resolvers against `graphql-go`. Rejected because gqlgen's generated types prevent accidental type coercion and keep the schema as the single source of truth.

### D3: sqlc for persistence

Write SQL queries in `.sql` files under `infrastructure/persistence/queries/`. Run `sqlc generate` to produce type-safe Go functions. Write adapter structs that implement the repository port interfaces using the generated functions, mapping sqlc row types to domain structs at the adapter boundary.

**Why**: SQL stays explicit and reviewable. Domain structs never see sqlc types. The adapter boundary is enforced structurally — domain layer has no sqlc import.

**Alternative considered**: GORM or sqlx. Rejected because GORM abstracts SQL in ways that make the persistence boundary leaky, and sqlx still requires manual row scanning without compile-time safety.

### D4: SQLite via `modernc.org/sqlite` for local dev

Use the pure-Go SQLite driver (no CGO required). Migration files managed by `golang-migrate` applied at startup.

**Why**: Zero external process dependency for local dev — just run the binary. `modernc.org/sqlite` avoids CGO so the binary is easily cross-compiled.

**Alternative considered**: Postgres from the start. Rejected because it requires a running Postgres process, which slows onboarding. The repository port interface means swapping the driver later only requires a new adapter, not domain or use case changes.

### D5: Typed errors via `(T, error)` with custom error types

Each use case returns `(Result, error)` where errors are sentinel values or typed structs (e.g., `ErrApplicationNotFound`, `ErrInvalidStageTransition`). Resolvers switch on error type to produce appropriate GraphQL errors.

**Why**: Go's convention. No library required. Expected domain failures are handled explicitly at the resolver boundary, matching what the frontend GraphQL client expects.

**Alternative considered**: Panic-based error handling or error codes as strings. Rejected because both hide expected failures from the type system and make resolver mapping fragile.

### D6: Constructor injection, no DI framework

Each use case struct accepts its dependencies (repository ports, clock, ID generator) as constructor parameters. `cmd/api/main.go` assembles the full dependency graph explicitly.

**Why**: The wiring is visible in code, not in a framework configuration file. This is a deliberate learning objective — hexagonal wiring should be readable as regular Go code.

## Risks / Trade-offs

- **sqlc generate and gqlgen generate are codegen steps** → Developers must run `go generate ./...` after schema or query changes. Document this in a Makefile and README.
- **Schema compatibility with existing frontend** → The GraphQL schema must exactly match what the MSW handlers return. Before implementing resolvers, audit the existing MSW handlers and frontend GraphQL operations to validate field names and types.
- **SQLite limitations** → No concurrent writes at scale. Acceptable for local dev and single-user use. Postgres migration is a later adapter swap, not a domain change.
- **No transactions across use cases** → If a use case needs to write multiple tables atomically (e.g., advancing stage + inserting timeline event), the transaction port must be passed into the use case. This must be designed into the port interface from the start to avoid retrofitting.
  → Mitigation: Define a `Transactor` port interface in `application/ports` from day one, even if only a subset of use cases use it initially.

## Migration Plan

1. Implement the full backend against `apps/api`
2. Add a `BACKEND_URL` environment variable or config to `apps/web`
3. In `apps/web`, switch the GraphQL gateway adapter from MSW to the real URL
4. Run both `apps/web` (Vite dev server) and `apps/api` (Go binary) locally
5. Remove MSW handlers once the real backend passes all gateway adapter tests

**Rollback**: MSW handlers remain in `apps/web` until explicitly removed. Switching back is a one-line URL change.

## Open Questions

- Should the GraphQL schema live in `apps/api/graph/` only, or should a copy be committed to `apps/web` for frontend codegen? (Lean: single source in `apps/api`, frontend reads it via an introspection or a symlink during codegen)
- Should `golang-migrate` run at binary startup, or should migrations be a separate CLI command? (Lean: run at startup for local dev simplicity; revisit for production)
- Seed data format: SQL file loaded at startup when DB is empty, or a `seed` CLI subcommand? (Lean: SQL file checked at startup)
