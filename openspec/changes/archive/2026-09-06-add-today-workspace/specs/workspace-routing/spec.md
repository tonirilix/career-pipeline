## MODIFIED Requirements

### Requirement: Top-level workspaces are URL-addressable
The system SHALL expose stable client routes for the existing top-level workspaces: `/today`, `/pipeline`, `/memory`, and `/roles`.

#### Scenario: Direct today route renders today workspace
- **WHEN** a user opens `/today`
- **THEN** the main content SHALL render the today workspace

#### Scenario: Direct pipeline route renders pipeline workspace
- **WHEN** a user opens `/pipeline`
- **THEN** the main content SHALL render the pipeline workspace

#### Scenario: Direct memory route renders candidate memory workspace
- **WHEN** a user opens `/memory`
- **THEN** the main content SHALL render the candidate memory workspace

#### Scenario: Direct roles route renders role discovery workspace
- **WHEN** a user opens `/roles`
- **THEN** the main content SHALL render the role discovery workspace

---

## REMOVED Requirements

### Requirement: Root route enters the pipeline workspace
**Reason**: The application's entry point moves from a data view to a derived action queue. Landing on Pipeline requires the user to determine what needs doing; landing on Today answers that directly, which is the purpose of this change.

**Migration**: `/pipeline` remains the canonical Pipeline route and is unchanged, so any existing link or bookmark to `/pipeline` continues to resolve to the Pipeline workspace. Only the behaviour of `/` changes.

---

## ADDED Requirements

### Requirement: Root route enters the today workspace
The system SHALL treat `/` as an entry point to the today workspace.

#### Scenario: Root route lands on today
- **WHEN** a user opens `/`
- **THEN** the main content SHALL render the today workspace

#### Scenario: Today has a canonical route
- **WHEN** the user navigates from another workspace to the today workspace
- **THEN** the browser location SHALL be `/today`

#### Scenario: Pipeline remains directly addressable
- **WHEN** a user opens `/pipeline`
- **THEN** the main content SHALL render the pipeline workspace
- **AND** the pipeline workspace SHALL NOT be reachable only through today
