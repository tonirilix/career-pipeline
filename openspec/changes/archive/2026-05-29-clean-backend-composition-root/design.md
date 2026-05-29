## Context

`apps/api/cmd/api/main.go` is the only runtime composition root today. It opens PostgreSQL, runs migrations, handles `migrate-only` and `seed-only`, decides whether to seed, constructs persistence adapters, constructs use cases, builds gqlgen resolvers, configures transports/playground/CORS, and starts the HTTP server.

That explicit wiring is useful for a hexagonal architecture learning project, but the file has crossed the point where explicitness and locality are in tension. The composition root should remain easy to inspect, while operational details should live in modules that can be tested directly.

## Goals / Non-Goals

**Goals:**
- Keep dependency wiring explicit and constructor-based.
- Make `cmd/api/main.go` thin enough to read as process orchestration.
- Move runtime configuration, database preparation, application composition, and HTTP router/server setup into focused packages.
- Make migration/seed command modes testable without invoking the full process.
- Preserve current GraphQL, persistence, migration, seed, CORS, playground, and port behavior.
- Add guardrails that keep composition/bootstrap/server concerns out of domain and application packages.

**Non-Goals:**
- Changing the GraphQL schema or resolver behavior.
- Changing repository/use-case contracts.
- Replacing migrations, sqlc, gqlgen, or the PostgreSQL driver.
- Adding a dependency injection container, reflection-based wiring, or lifecycle framework.
- Adding request timeout, logging, tracing, or graceful shutdown policies.

## Decisions

### 1. Keep `main.go` as process orchestration only

`main.go` should parse flags, load configuration, run database preparation/command modes, compose runtime dependencies, build the HTTP handler, and start the server. It should not directly construct every repository/use case/resolver or own SQL migration/seed details.

Alternative considered: leave all wiring in `main.go` because composition roots are allowed to be explicit. Rejected because the file also owns operational details; splitting those details preserves explicit wiring while improving scanability and testability.

### 2. Use focused internal packages, not a DI framework

The cleanup should introduce small Go packages under `internal/`, for example:
- `internal/config` for environment/flag-derived runtime configuration.
- `internal/bootstrap` or `internal/runtime` for database opening, migrations, seed decisions, and command-mode execution.
- `internal/composition` for adapter/use-case/resolver construction.
- `internal/server` for GraphQL handler, playground, CORS middleware, and route registration.

Alternative considered: introduce a dependency injection framework such as Wire or Fx. Rejected because the project values visible constructor wiring, and a framework would obscure the hexagonal architecture lesson for little benefit at this size.

### 3. Keep adapters and generated code behind existing boundaries

The composition package may import infrastructure persistence, use cases, GraphQL resolvers, clocks, and ID generators because it is the outermost wiring layer. Domain and application packages must not import the composition, bootstrap, server, GraphQL, or persistence packages.

Alternative considered: move convenience constructors into use-case or resolver packages. Rejected because it would pull infrastructure or transport knowledge inward.

### 4. Make command modes return decisions, not exit the process

Migration-only and seed-only behavior should be represented as ordinary functions that return whether the process should continue serving or exit after the command. `main.go` remains responsible for logging fatal errors and returning from `main`.

Alternative considered: keep `log.Fatal` inside bootstrap helpers. Rejected because helpers with process exits are hard to test and hide control flow.

## Risks / Trade-offs

- [Risk] Too many small packages make wiring harder to follow. -> Mitigation: keep package count minimal and name modules by responsibility; avoid creating abstractions until a coherent responsibility exists.
- [Risk] A composition package becomes a service locator. -> Mitigation: return concrete resolver/server dependencies from explicit constructors; do not expose global registries or package-level mutable state.
- [Risk] Tests overfit exact file length or package names. -> Mitigation: architecture tests should protect boundaries and high-level composition shape, not brittle line counts alone.
- [Risk] Seed/migration behavior changes accidentally while moving code. -> Mitigation: add tests for migrate-only, seed-only empty database, seed-only non-empty database, and normal startup preparation decisions.

## Migration Plan

1. Extract configuration parsing and validation while keeping existing defaults.
2. Extract database preparation and command-mode behavior behind testable functions.
3. Extract dependency composition from `main.go` while preserving the existing constructor graph.
4. Extract HTTP handler/router construction and CORS middleware.
5. Simplify `main.go` to orchestration and fatal logging.
6. Add or update tests and run `go test ./...`.

Rollback is straightforward: revert the structural extraction. No data migration or API migration is involved.

## Open Questions

None. Package names can be finalized during implementation, but responsibilities and boundaries are clear.
