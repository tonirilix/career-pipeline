# Capability: Go Backend sqlc Tooling

## Purpose

Defines the sqlc-based code generation tooling for the Go backend persistence layer. Covers configuration, query file conventions, generated output location, and the developer workflow for regenerating query code after schema or query changes.

## Requirements

### Requirement: sqlc configuration and query files
The persistence layer SHALL include a `sqlc.yaml` configuration file and one `.sql` query file per aggregate under `internal/infrastructure/persistence/queries/`, containing all SQL used by the repository adapters annotated with sqlc name and cardinality directives.

#### Scenario: sqlc generates without errors
- **WHEN** a developer runs `sqlc generate` from `apps/api/internal/infrastructure/persistence/`
- **THEN** sqlc SHALL parse all `.sql` query files against the schema, report no errors, and write generated Go files to `internal/infrastructure/persistence/db/`

#### Scenario: Adding a new query requires only a SQL file change
- **WHEN** a developer adds a new annotated query to a `.sql` file and runs `sqlc generate`
- **THEN** a new type-safe Go function SHALL appear in the generated package with no manual scan code written by the developer

### Requirement: sqlc-generated query code replaces hand-written scan helpers
The persistence layer SHALL use sqlc-generated functions from `internal/infrastructure/persistence/db/` as the sole mechanism for executing queries and scanning rows. Hand-written scan helpers and SQL string constants SHALL NOT exist alongside generated code.

#### Scenario: Generated functions cover all existing queries
- **WHEN** the generated package is compiled
- **THEN** it SHALL expose a typed function for every query previously defined in `postgresql_queries.go`

#### Scenario: Repository adapters contain no scan helper functions
- **WHEN** the persistence package is compiled after migration
- **THEN** it SHALL contain no functions named `scan*` or equivalent hand-written row-scanning helpers

#### Scenario: Schema mismatch is caught at generation time
- **WHEN** a query references a column that does not exist in the schema
- **THEN** `sqlc generate` SHALL fail with an error before any Go code is compiled or run

### Requirement: Developer query generation workflow
The backend SHALL provide a documented, single-command workflow for regenerating query code after schema or query changes.

#### Scenario: Developer regenerates after adding a query
- **WHEN** a developer adds a new `.sql` query file entry and runs `make sqlc`
- **THEN** the generated package SHALL be updated and the backend SHALL compile without errors

#### Scenario: CI does not require sqlc CLI
- **WHEN** the CI pipeline builds the backend
- **THEN** it SHALL compile from committed generated files and SHALL NOT require `sqlc` to be installed in the CI environment
