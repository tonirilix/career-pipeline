## ADDED Requirements

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
