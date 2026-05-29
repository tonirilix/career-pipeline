## Why

The backend entrypoint currently owns too many responsibilities: configuration lookup, database lifecycle, migration/seed commands, repository construction, use-case construction, resolver construction, HTTP handler setup, CORS, and server startup all live in `cmd/api/main.go`. That keeps wiring explicit, but it makes the composition root hard to scan and difficult to test without starting the full process.

## What Changes

- Extract backend runtime configuration parsing into a small configuration module with defaults and validation.
- Extract database bootstrapping, migration execution, seed decisions, and command-mode handling out of `main.go` into focused infrastructure/bootstrap modules.
- Extract application dependency wiring into a composition module that returns the GraphQL resolver dependencies from explicit constructors.
- Extract HTTP server/router construction into a server module that mounts GraphQL, optional development playground, and CORS middleware.
- Keep `cmd/api/main.go` as a thin composition root that parses flags, loads configuration, calls the bootstrap/composition modules, and starts or exits.
- Add tests around configuration defaults/validation, command-mode behavior, dependency composition shape, and HTTP route registration.
- Add architecture protection so backend domain and application layers remain independent from the new composition/bootstrap/server packages.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `go-backend-wiring`: The backend wiring requirement changes from "all wiring in `cmd/api/main.go`" to a thin `main.go` that delegates to focused composition, bootstrap, and server modules while preserving explicit constructor-based dependency injection.
- `architecture-deepening`: Add guardrails that prevent the backend composition root cleanup from leaking infrastructure or transport concerns into domain/application layers.

## Impact

- Affected backend files: `apps/api/cmd/api/main.go` and new focused packages under `apps/api/internal/`.
- Affected tests: backend unit tests for configuration/bootstrap/server/composition and architecture tests.
- Public GraphQL schema, resolver behavior, persistence behavior, migrations, seed data, and frontend behavior remain unchanged.
- No new runtime dependencies are expected.
