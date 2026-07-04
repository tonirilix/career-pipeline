## ADDED Requirements

### Requirement: Role inbox lists role candidates before application tracking
The system SHALL provide a role inbox workspace that lists role records independently from the application pipeline and shows key scan fields: company, title, source, location, remote eligibility, employment type, seniority, compensation, stack, freshness, and decision status.

#### Scenario: Role inbox loads
- **WHEN** the user opens the role discovery workspace
- **THEN** the frontend SHALL display role records without adding them to the application board

#### Scenario: Empty role inbox loads
- **WHEN** no role records exist
- **THEN** the frontend SHALL show an empty state that still allows manual URL and pasted description intake

### Requirement: Role inbox can run limited search from a topic
The role discovery workspace SHALL let the user choose or create a search topic and trigger a limited role search that imports results into the role inbox.

#### Scenario: Search is triggered from inbox
- **WHEN** the user runs search from a visible search topic control
- **THEN** the frontend SHALL show search progress and refresh the role inbox with imported results after completion

#### Scenario: Search imports no new roles
- **WHEN** a role search completes with only duplicates or no results
- **THEN** the frontend SHALL show the result summary without clearing existing role records

### Requirement: Role inbox supports role review decisions
The system SHALL allow the user to set role decision status values including new, saved, rejected, revisit later, and promoted.

#### Scenario: Role is saved for later review
- **WHEN** the user marks a role as saved
- **THEN** the backend SHALL persist the role decision status as saved and the inbox SHALL reflect the updated status

#### Scenario: Role is rejected
- **WHEN** the user rejects a role with a reason
- **THEN** the backend SHALL persist the rejected status and rejection reason without deleting the role

#### Scenario: Role is marked for revisit
- **WHEN** the user marks a role to revisit later
- **THEN** the backend SHALL persist the revisit status and keep the role visible in the role inbox

### Requirement: Role inbox supports filtering by decision and freshness
The system SHALL allow frontend users to filter role records by decision status, freshness status, source, and text search over company or title.

#### Scenario: Filter by rejected roles
- **WHEN** the user filters the role inbox to rejected roles
- **THEN** the frontend SHALL show rejected roles and hide role records with other decision statuses

#### Scenario: Search role inbox by company
- **WHEN** the user searches by company name
- **THEN** the frontend SHALL show matching role records regardless of whether they are tracked applications

### Requirement: Role detail preserves raw and normalized information
The system SHALL provide a role detail or editable inspection surface where the user can review raw source text and normalized metadata for a role.

#### Scenario: User opens role details
- **WHEN** the user selects a role record from the inbox
- **THEN** the frontend SHALL show the role's raw description or source text along with editable normalized metadata

#### Scenario: User edits role metadata
- **WHEN** the user updates normalized fields on a role
- **THEN** the backend SHALL persist the updated fields while preserving the original raw source text

### Requirement: Role workspace exposes loading and error states
The system SHALL show user-visible loading and error states for role topic loading, role record loading, intake commands, decision updates, metadata edits, and promotion commands.

#### Scenario: Role inbox is loading
- **WHEN** role records are being loaded
- **THEN** the frontend SHALL show a loading state in the role discovery workspace

#### Scenario: Role command fails
- **WHEN** a role intake, decision, edit, or promotion command fails
- **THEN** the frontend SHALL show a visible error message without discarding unsaved form input
