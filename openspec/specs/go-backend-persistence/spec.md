# Capability: Go Backend Persistence

## Purpose

Infrastructure layer for the Go backend. Defines the SQLite schema, migrations, repository adapter implementations, and seed data. All persistence concerns are hidden behind port interfaces defined in the application layer.

## Requirements

### Requirement: SQLite database with golang-migrate migrations
The system SHALL use SQLite as the local development database. Migration files SHALL be placed under `internal/infrastructure/migrations/` and applied at server startup using golang-migrate.

#### Scenario: Migrations run on clean database
- **WHEN** the server starts with no existing database file
- **THEN** golang-migrate SHALL create all tables in the correct order without errors

#### Scenario: Migrations are idempotent
- **WHEN** the server restarts with an already-migrated database
- **THEN** golang-migrate SHALL detect the current version and skip already-applied migrations

### Requirement: Database schema
The system SHALL create tables for: job_applications, interviews, follow_up_reminders, application_notes, and timeline_events. Foreign keys SHALL enforce referential integrity from child tables to job_applications.

#### Scenario: Schema enforces application ownership
- **WHEN** an interview is inserted with a non-existent application_id
- **THEN** the database SHALL reject the insert with a foreign key violation

### Requirement: Repository adapter implementations
The system SHALL implement all repository port interfaces (defined in `internal/application/ports/`) with adapter structs in `internal/infrastructure/persistence/`. Each adapter SHALL use hand-written `database/sql` queries and map row results to domain structs.

#### Scenario: Domain structs have no persistence imports
- **WHEN** the domain package is compiled
- **THEN** it SHALL contain no imports from `internal/infrastructure/persistence`

#### Scenario: Adapter maps all fields correctly
- **WHEN** a `JobApplication` is saved and then retrieved through the adapter
- **THEN** all fields SHALL round-trip without data loss or type coercion

### Requirement: Transactor implementation
The system SHALL implement the `Transactor` port using `database/sql` transactions. Multi-step use cases (advance stage, schedule interview) SHALL execute their persistence operations inside a single transaction.

#### Scenario: Transaction rolls back on error
- **WHEN** a multi-step use case fails partway through (e.g., timeline insert fails)
- **THEN** the entire transaction SHALL be rolled back and no partial data persisted

### Requirement: Local dev seed data
The system SHALL provide a seed SQL file that populates a fresh database with representative job applications across all stages, including notes, interviews, follow-ups, and timeline events.

#### Scenario: Seed data loads without errors
- **WHEN** the seed file is executed against a freshly migrated database
- **THEN** it inserts successfully and the applications are queryable
