## ADDED Requirements

### Requirement: Role can be promoted to tracked application
The system SHALL allow the user to promote a role record into a tracked job application using the role's company, title, posting URL, source, location, compensation, and employment type.

#### Scenario: Role is promoted
- **WHEN** the user promotes a role record to an application
- **THEN** the backend SHALL create a tracked job application in the existing pipeline and return both the updated role and created application reference

#### Scenario: Promotion uses existing application validation
- **WHEN** promotion creates a job application
- **THEN** the system SHALL enforce the same required company and role title validation used by normal application intake

### Requirement: Promotion preserves the source role record
The system SHALL keep the source role record after promotion, mark it as promoted, and store the created application id on the role record.

#### Scenario: Promoted role remains available
- **WHEN** a role is promoted to an application
- **THEN** the role record SHALL remain available for future fit analysis, application packets, vector indexing, and audit

#### Scenario: Promoted role references application
- **WHEN** promotion succeeds
- **THEN** the role record SHALL store the created application id and display the promoted status in the role inbox

### Requirement: Promotion is idempotent per role
The system SHALL prevent repeated promotion from the same role record once it already references a tracked application.

#### Scenario: Already promoted role is promoted again
- **WHEN** the user attempts to promote a role that already has a promoted application id
- **THEN** the backend SHALL return the existing promoted state or a domain error that prevents duplicate application creation

### Requirement: Promotion does not require fit analysis
The system SHALL allow role promotion without AI fit analysis, fit score, or generated application packet data.

#### Scenario: Role without fit analysis is promoted
- **WHEN** a role has no fit analysis artifact
- **THEN** the backend SHALL still allow promotion if required application intake fields are present
