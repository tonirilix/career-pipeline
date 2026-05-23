## ADDED Requirements

### Requirement: Go module setup
The system SHALL initialize a Go module at `apps/api/go.mod` with module path `github.com/tonirilix/career-pipeline/apps/api` and Go version 1.22 or later. All dependencies SHALL be recorded in `go.sum`.

#### Scenario: Module builds without external toolchain
- **WHEN** `go build ./...` is run from `apps/api/`
- **THEN** it SHALL succeed using only `go.mod` and `go.sum`, no manual steps

### Requirement: Main entrypoint wires all layers
The system SHALL provide `cmd/api/main.go` that: opens the SQLite connection, runs migrations, instantiates repository adapters, instantiates use cases with injected dependencies, instantiates resolvers with injected use cases, and starts an HTTP server on a configurable port (default 8080).

#### Scenario: All dependencies wired explicitly
- **WHEN** main.go is read
- **THEN** every dependency injection step SHALL be visible as a constructor call — no global variables, no init() side effects, no reflection-based wiring

#### Scenario: Server listens on configured port
- **WHEN** the server starts
- **THEN** it SHALL read the PORT environment variable (defaulting to 8080) and listen on that port

### Requirement: GraphQL HTTP handler
The system SHALL mount the gqlgen handler at `/query` and the GraphQL playground at `/` (development mode only).

#### Scenario: Query endpoint accepts POST requests
- **WHEN** a POST request is sent to /query with a valid GraphQL operation
- **THEN** the server SHALL respond with a 200 and valid GraphQL JSON response

#### Scenario: Playground is available in dev mode
- **WHEN** the server runs with APP_ENV=development
- **THEN** a GET request to / SHALL return the GraphQL Playground HTML

### Requirement: Makefile for developer workflow
The system SHALL provide a `Makefile` at `apps/api/` with targets: `build`, `run`, `generate` (runs go generate for gqlgen and sqlc), `migrate`, `seed`, and `test`.

#### Scenario: make generate produces all codegen output
- **WHEN** `make generate` is run
- **THEN** it SHALL run `go generate ./...` which triggers both gqlgen and sqlc code generation without manual steps

### Requirement: tools.go for codegen dependencies
The system SHALL provide a `tools.go` file with build tag `//go:build tools` that imports gqlgen and sqlc CLI packages to pin their versions in `go.mod`.

#### Scenario: Codegen tools versions are reproducible
- **WHEN** a developer runs go mod tidy
- **THEN** the gqlgen and sqlc tool versions SHALL remain pinned and not drift
