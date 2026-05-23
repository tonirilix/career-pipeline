# Capability: Go Backend Persistence

## Purpose

Infrastructure layer for the Go backend. Defines the PostgreSQL schema, migrations, repository adapter implementations, and seed data. All persistence concerns are hidden behind port interfaces defined in the application layer.
## Requirements
### Requirement: PostgreSQL runtime database
The backend SHALL use PostgreSQL as its runtime database and SHALL open the database through a PostgreSQL `DATABASE_URL` connection string.

#### Scenario: Server starts with PostgreSQL
- **WHEN** `DATABASE_URL` points to a reachable PostgreSQL database and the API server starts
- **THEN** the server SHALL open the database connection, run migrations, and continue startup without SQLite dependencies

#### Scenario: Database configuration is missing
- **WHEN** the API server starts without a usable `DATABASE_URL`
- **THEN** startup SHALL fail with an actionable configuration error

### Requirement: PostgreSQL migrations
The backend SHALL define migration files using PostgreSQL-compatible SQL and SHALL apply them with golang-migrate's PostgreSQL database driver.

#### Scenario: Migrations run on clean PostgreSQL database
- **WHEN** migrations are applied to an empty PostgreSQL database
- **THEN** all application tables SHALL be created in the correct order without errors

#### Scenario: Migrations are idempotent
- **WHEN** migrations are applied to an already-migrated PostgreSQL database
- **THEN** golang-migrate SHALL report no pending changes and SHALL NOT modify existing data

### Requirement: PostgreSQL schema
The PostgreSQL schema SHALL create tables for `job_applications`, `interviews`, `follow_up_reminders`, `application_notes`, and `timeline_events`. Foreign keys SHALL enforce referential integrity from child tables to `job_applications`.

#### Scenario: Schema enforces application ownership
- **WHEN** an interview is inserted with an `application_id` that does not exist in `job_applications`
- **THEN** PostgreSQL SHALL reject the insert with a foreign key violation

#### Scenario: Schema stores timestamps as timestamps
- **WHEN** records with timestamp fields are inserted
- **THEN** PostgreSQL SHALL store them using timestamp column types rather than string-only columns

### Requirement: PostgreSQL repository adapters
The backend SHALL implement all repository port interfaces with PostgreSQL-backed adapter structs in `internal/infrastructure/persistence/`.

#### Scenario: Repository adapter implements port
- **WHEN** the Go compiler checks each PostgreSQL repository adapter
- **THEN** each adapter SHALL satisfy its corresponding application port interface

#### Scenario: Adapter uses PostgreSQL placeholders
- **WHEN** repository queries execute against PostgreSQL
- **THEN** SQL statements SHALL use PostgreSQL-compatible placeholders and SHALL NOT use SQLite-only placeholder syntax

#### Scenario: Domain structs have no PostgreSQL imports
- **WHEN** the domain package is compiled
- **THEN** it SHALL contain no imports from PostgreSQL driver packages or infrastructure persistence packages

### Requirement: PostgreSQL seed data
The backend SHALL provide PostgreSQL-compatible seed data that populates a fresh database with representative job applications across all stages, including notes, interviews, follow-ups, and timeline events.

#### Scenario: Seed data loads into PostgreSQL
- **WHEN** the seed command runs against a migrated empty PostgreSQL database
- **THEN** seed data SHALL insert successfully and the applications SHALL be queryable through repository adapters

#### Scenario: Seed data does not overwrite existing data
- **WHEN** the API starts against a PostgreSQL database that already contains job applications
- **THEN** automatic seeding SHALL be skipped and existing data SHALL remain unchanged

### Requirement: PostgreSQL local development workflow
The backend SHALL document and automate the local PostgreSQL workflow for running, migrating, seeding, testing, and resetting the API database.

#### Scenario: Developer starts local database
- **WHEN** a developer follows the documented local database setup
- **THEN** a PostgreSQL database SHALL be available at the documented `DATABASE_URL`

#### Scenario: Persistence tests target PostgreSQL
- **WHEN** persistence adapter tests run with `TEST_DATABASE_URL` configured
- **THEN** the tests SHALL execute against PostgreSQL and SHALL NOT use SQLite

### Requirement: PostgreSQL query mapping is concentrated behind repository adapters
The PostgreSQL persistence layer SHALL keep SQL and row mapping localized behind repository adapters, using sqlc-generated query code when available or a dedicated query module as an interim step.

#### Scenario: Repository callers do not know query internals
- **WHEN** application use cases call repository ports
- **THEN** callers SHALL NOT know SQL text, row scan order, placeholder numbering, or generated query types

#### Scenario: Query mapping round-trips Job Application data
- **WHEN** a Job Application with persisted child data is saved and loaded through repository adapters
- **THEN** all persisted fields SHALL round-trip without data loss or unintended string/time conversion

### Requirement: sqlc migration path is documented
The backend persistence documentation SHALL describe how to generate or update query code in the direction recommended by ADR 0003.

#### Scenario: Developer can run query generation
- **WHEN** a developer follows the backend persistence documentation
- **THEN** they SHALL be able to install or run the query generation step and rebuild the backend

#### Scenario: ADR 0003 status remains accurate
- **WHEN** the persistence query strategy is changed
- **THEN** ADR 0003 SHALL be updated to reflect whether sqlc is accepted, still open, or replaced by a documented alternative

