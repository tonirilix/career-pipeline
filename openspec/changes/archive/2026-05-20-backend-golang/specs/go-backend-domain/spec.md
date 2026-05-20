## ADDED Requirements

### Requirement: Job application domain struct
The system SHALL define a `JobApplication` struct in the domain layer containing all fields required to represent a tracked job opportunity: id, company, roleTitle, postingUrl, source, location, compensation, employmentType, stage, and createdAt.

#### Scenario: Struct is free of infrastructure imports
- **WHEN** the domain package is compiled
- **THEN** it SHALL import only Go stdlib packages — no gqlgen, sqlc, or database/sql imports

### Requirement: Application stage value object
The system SHALL define an `ApplicationStage` type as a Go string type with a closed set of valid values: Saved, Applied, Screening, Technical Interview, Onsite, Offer, Rejected, Withdrawn.

#### Scenario: Stage transition validation
- **WHEN** a use case requests a stage transition
- **THEN** the domain SHALL expose a function that returns an error for invalid transitions (e.g., Saved → Offer directly is invalid)

#### Scenario: Closed stage detection
- **WHEN** code checks whether an application stage is closed
- **THEN** the domain SHALL expose a helper that returns true for Rejected and Withdrawn

### Requirement: Interview domain struct
The system SHALL define an `Interview` struct with fields: id, applicationId, type, scheduledAt, outcome, notes, and createdAt.

#### Scenario: Interview type is a closed set
- **WHEN** an interview is created
- **THEN** the type field SHALL only accept: Recruiter screen, Technical screen, Take-home, Onsite, Final round

#### Scenario: Interview outcome is a closed set
- **WHEN** an interview outcome is recorded
- **THEN** the outcome field SHALL only accept: Scheduled, Passed, Failed, Cancelled

### Requirement: Follow-up reminder domain struct
The system SHALL define a `FollowUpReminder` struct with fields: id, applicationId, dueAt, note, completedAt (nullable), and createdAt.

#### Scenario: Completed follow-up is distinguishable
- **WHEN** a follow-up has a non-nil completedAt
- **THEN** it SHALL be considered completed

### Requirement: Application note domain struct
The system SHALL define an `ApplicationNote` struct with fields: id, applicationId, body, and createdAt.

#### Scenario: Note body is non-empty
- **WHEN** a note is created
- **THEN** the domain SHALL enforce that body is not an empty string

### Requirement: Timeline event domain struct
The system SHALL define a `TimelineEvent` struct with fields: id, applicationId, description, and occurredAt.

#### Scenario: Timeline events are created by domain operations
- **WHEN** a stage transition, interview schedule, or follow-up completion occurs
- **THEN** the operation SHALL return a `TimelineEvent` to be persisted by the use case

### Requirement: Domain error types
The system SHALL define typed error values for expected domain failures: `ErrApplicationNotFound`, `ErrInvalidStageTransition`, `ErrInterviewNotFound`, `ErrFollowUpNotFound`, `ErrNoteBodyEmpty`, `ErrDueDateInPast`.

#### Scenario: Error types are recognizable by callers
- **WHEN** a use case returns a domain error
- **THEN** callers SHALL be able to use `errors.Is` to identify the specific failure
