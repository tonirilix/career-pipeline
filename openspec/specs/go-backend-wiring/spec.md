# Capability: Go Backend Wiring

## Purpose

Entrypoint and developer workflow for the Go backend. Covers the Go module setup, the main wiring in `cmd/api/main.go`, the HTTP server configuration, and the Makefile targets.

## Requirements

### Requirement: Go module setup
The system SHALL initialize a Go module at `apps/api/go.mod` with module path `github.com/tonirilix/career-pipeline/apps/api` and Go version 1.22 or later. All dependencies SHALL be recorded in `go.sum`.

#### Scenario: Module builds without external toolchain
- **WHEN** `go build ./...` is run from `apps/api/`
- **THEN** it SHALL succeed using only `go.mod` and `go.sum`, no manual steps

### Requirement: Main entrypoint wires all layers
The system SHALL keep `cmd/api/main.go` as the backend process composition root while delegating configuration parsing, database preparation, application dependency composition, and HTTP router construction to focused internal modules. Dependency injection SHALL remain explicit and constructor-based; the backend SHALL NOT use global registries, reflection-based wiring, or a dependency injection container.

#### Scenario: Main entrypoint remains thin
- **WHEN** `cmd/api/main.go` is read
- **THEN** it SHALL show process orchestration only: parse flags, load configuration, prepare the database or command mode, compose dependencies, build the HTTP handler, and start the server

#### Scenario: All dependencies wired explicitly
- **WHEN** backend runtime dependencies are composed
- **THEN** every repository, use case, resolver, clock, ID generator, transactor, and server dependency SHALL be created through visible constructor calls rather than package-level mutable globals, `init()` side effects, reflection, or a dependency injection container

#### Scenario: Server listens on configured port
- **WHEN** the server starts
- **THEN** it SHALL read the PORT environment variable, default to 8080 when unset, and listen on that port

#### Scenario: Database command modes are delegated
- **WHEN** the backend starts with migrate-only or seed-only mode enabled
- **THEN** the command behavior SHALL be handled by a focused bootstrap module that can be tested without starting the HTTP server

#### Scenario: Composition cleanup preserves existing runtime behavior
- **WHEN** the backend starts in normal mode with a configured PostgreSQL database
- **THEN** it SHALL open the database, run migrations, seed an empty database, construct GraphQL resolvers, mount the GraphQL endpoint, and serve the API with the same behavior as before the cleanup

### Requirement: GraphQL HTTP handler
The system SHALL mount the gqlgen handler at `/graphql` and the GraphQL playground at `/` (development mode only, when `APP_ENV=development`).

#### Scenario: Query endpoint accepts POST requests
- **WHEN** a POST request is sent to /graphql with a valid GraphQL operation
- **THEN** the server SHALL respond with a 200 and valid GraphQL JSON response

#### Scenario: Playground is available in dev mode
- **WHEN** the server runs with APP_ENV=development
- **THEN** a GET request to / SHALL return the GraphQL Playground HTML

### Requirement: Makefile for developer workflow
The system SHALL provide a `Makefile` at `apps/api/` with targets: `build`, `run`, `generate`, `migrate`, `seed`, and `test`.

#### Scenario: make generate produces all codegen output
- **WHEN** `make generate` is run
- **THEN** it SHALL run `go generate ./...` which triggers gqlgen code generation without manual steps

### Requirement: tools.go for codegen dependencies
The system SHALL provide a `tools.go` file with build tag `//go:build tools` that imports gqlgen CLI packages to pin their versions in `go.mod`.

#### Scenario: Codegen tools versions are reproducible
- **WHEN** a developer runs go mod tidy
- **THEN** the gqlgen tool version SHALL remain pinned and not drift
