## MODIFIED Requirements

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
