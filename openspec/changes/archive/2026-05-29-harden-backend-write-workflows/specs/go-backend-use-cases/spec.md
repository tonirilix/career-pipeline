## MODIFIED Requirements

### Requirement: Create application use case
The system SHALL implement a `CreateApplication` use case that accepts a command with company, roleTitle, postingUrl, source, location, compensation, and employmentType, validates required intake fields, creates a `JobApplication` with stage Saved, persists it, creates an initial timeline event, and returns the created application. The Job Application write and initial timeline event write SHALL execute atomically through the transaction seam.

#### Scenario: Application is created with Saved stage
- **WHEN** CreateApplication is called with valid inputs
- **THEN** the returned application SHALL have stage Saved and a createdAt set by the Clock port

#### Scenario: Missing company returns a domain error
- **WHEN** CreateApplication is called with an empty company
- **THEN** it SHALL return `ErrCompanyRequired` and make no persistence changes

#### Scenario: Missing role title returns a domain error
- **WHEN** CreateApplication is called with an empty roleTitle
- **THEN** it SHALL return `ErrRoleTitleRequired` and make no persistence changes

#### Scenario: Initial timeline failure rolls back application creation
- **WHEN** CreateApplication saves the Job Application but fails while saving the initial timeline event
- **THEN** the entire workflow SHALL be rolled back with no persisted Job Application
