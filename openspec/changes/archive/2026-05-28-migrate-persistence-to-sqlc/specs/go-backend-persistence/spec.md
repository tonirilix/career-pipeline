## MODIFIED Requirements

### Requirement: PostgreSQL query mapping is concentrated behind repository adapters
The PostgreSQL persistence layer SHALL keep SQL and row mapping localized behind repository adapters, using sqlc-generated query code. Hand-written SQL string constants and manual scan helpers SHALL NOT be used.

#### Scenario: Repository callers do not know query internals
- **WHEN** application use cases call repository ports
- **THEN** callers SHALL NOT know SQL text, row scan order, placeholder numbering, or generated query types

#### Scenario: Query mapping round-trips Job Application data
- **WHEN** a Job Application with persisted child data is saved and loaded through repository adapters
- **THEN** all persisted fields SHALL round-trip without data loss or unintended string/time conversion

#### Scenario: Nullable timestamp fields map to pointer types
- **WHEN** a record with a nullable timestamp column (e.g., `completed_at`) is loaded through a repository adapter
- **THEN** the domain struct field SHALL be a `*time.Time` that is nil when the column is NULL and non-nil when set

## MODIFIED Requirements

### Requirement: sqlc migration path is documented
The backend persistence documentation SHALL describe how to generate or update query code using sqlc, and ADR 0003 SHALL reflect the accepted decision.

#### Scenario: Developer can run query generation
- **WHEN** a developer follows the backend persistence documentation
- **THEN** they SHALL be able to install sqlc and run `make sqlc` to regenerate query code and rebuild the backend

#### Scenario: ADR 0003 status is Accepted
- **WHEN** the sqlc migration is complete
- **THEN** ADR 0003 status SHALL read "Accepted" and SHALL reflect sqlc as the chosen query strategy
