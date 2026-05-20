## ADDED Requirements

### Requirement: Repository port interfaces
The system SHALL define Go interfaces in `internal/application/ports/` for all repository operations: `JobApplicationRepository`, `InterviewRepository`, `FollowUpRepository`, `NoteRepository`, `TimelineRepository`. Each interface SHALL define only the methods required by use cases.

#### Scenario: Interfaces are in the application layer
- **WHEN** a use case file is compiled
- **THEN** it SHALL import port interfaces from `internal/application/ports`, not from `internal/infrastructure`

### Requirement: Supporting port interfaces
The system SHALL define interfaces for: `Clock` (returns current time), `IDGenerator` (returns a new unique string ID), and `Transactor` (executes a function inside a database transaction).

#### Scenario: Clock port enables deterministic tests
- **WHEN** a use case test provides a fake Clock returning a fixed time
- **THEN** the use case SHALL use that time for all timestamp fields without calling time.Now() directly

### Requirement: Create application use case
The system SHALL implement a `CreateApplication` use case that accepts a command with company, roleTitle, postingUrl, source, location, compensation, and employmentType, creates a `JobApplication` with stage Saved, persists it, creates an initial timeline event, and returns the created application.

#### Scenario: Application is created with Saved stage
- **WHEN** CreateApplication is called with valid inputs
- **THEN** the returned application SHALL have stage Saved and a createdAt set by the Clock port

#### Scenario: Missing required fields return an error
- **WHEN** CreateApplication is called with an empty company or roleTitle
- **THEN** it SHALL return a domain error without persisting anything

### Requirement: Advance stage use case
The system SHALL implement an `AdvanceStage` use case that accepts applicationId and newStage, validates the transition, updates the application stage, creates a timeline event, deactivates open follow-ups if the new stage is Rejected or Withdrawn, and returns the updated application.

#### Scenario: Valid transition succeeds
- **WHEN** AdvanceStage is called with a valid transition (e.g., Applied → Screening)
- **THEN** the stage is updated and a timeline event is created

#### Scenario: Invalid transition returns domain error
- **WHEN** AdvanceStage is called with an invalid transition
- **THEN** it SHALL return `ErrInvalidStageTransition` and make no persistence changes

#### Scenario: Closing stage deactivates follow-ups
- **WHEN** AdvanceStage moves an application to Rejected or Withdrawn
- **THEN** all open follow-ups for that application SHALL have their completedAt set

### Requirement: Schedule interview use case
The system SHALL implement a `ScheduleInterview` use case that accepts applicationId, type, scheduledAt, and notes, validates that the application is in an interviewable stage, persists the interview, creates a timeline event, and returns the interview.

#### Scenario: Interview created for valid stage
- **WHEN** ScheduleInterview is called on an application in Screening, Technical Interview, or Onsite stage
- **THEN** the interview is persisted and a timeline event is created

#### Scenario: Interview rejected for invalid stage
- **WHEN** ScheduleInterview is called on an application in Saved or Rejected stage
- **THEN** it SHALL return an error without persisting

### Requirement: Record interview outcome use case
The system SHALL implement a `RecordInterviewOutcome` use case that accepts interviewId and outcome, updates the interview record, creates a timeline event, and returns the updated interview.

#### Scenario: Outcome is recorded and timeline updated
- **WHEN** RecordInterviewOutcome is called with a valid interviewId and outcome
- **THEN** the interview outcome is updated and a timeline event is appended

### Requirement: Add follow-up use case
The system SHALL implement an `AddFollowUp` use case that accepts applicationId, dueAt, and note, validates that dueAt is in the future, persists the follow-up, and returns it.

#### Scenario: Follow-up created with future due date
- **WHEN** AddFollowUp is called with a dueAt after the current clock time
- **THEN** the follow-up is persisted

#### Scenario: Past due date returns error
- **WHEN** AddFollowUp is called with a dueAt before the current clock time
- **THEN** it SHALL return `ErrDueDateInPast`

### Requirement: Complete follow-up use case
The system SHALL implement a `CompleteFollowUp` use case that accepts followUpId, sets completedAt to the current time, and returns the updated follow-up.

#### Scenario: Follow-up is marked complete
- **WHEN** CompleteFollowUp is called with a valid followUpId
- **THEN** completedAt is set to now and the record is persisted

### Requirement: Add note use case
The system SHALL implement an `AddNote` use case that accepts applicationId and body, validates that body is non-empty, persists the note, and returns it.

#### Scenario: Note persisted with valid body
- **WHEN** AddNote is called with a non-empty body
- **THEN** the note is persisted and returned

#### Scenario: Empty body returns error
- **WHEN** AddNote is called with an empty body
- **THEN** it SHALL return `ErrNoteBodyEmpty`

### Requirement: Reopen application use case
The system SHALL implement a `ReopenApplication` use case that accepts applicationId, validates that the current stage is Rejected or Withdrawn, transitions the stage back to Applied, creates a timeline event, and returns the updated application.

#### Scenario: Closed application can be reopened
- **WHEN** ReopenApplication is called on a Rejected application
- **THEN** the stage is set to Applied and a timeline event is created

#### Scenario: Active application cannot be reopened
- **WHEN** ReopenApplication is called on an application in Applied stage
- **THEN** it SHALL return an error

### Requirement: Query use cases
The system SHALL implement read use cases for: `GetApplication` (by id), `ListApplications` (with optional stage and source filters, search term, and sort option), `ListUpcomingFollowUps`, and `ListOverdueFollowUps`.

#### Scenario: ListApplications filters by stage
- **WHEN** ListApplications is called with a stage filter
- **THEN** only applications in that stage are returned

#### Scenario: ListApplications sorts by lastActivity
- **WHEN** ListApplications is called with sort=lastActivity
- **THEN** results are ordered by the most recent timeline event timestamp descending

#### Scenario: ListUpcomingFollowUps returns only future incomplete items
- **WHEN** ListUpcomingFollowUps is called
- **THEN** only follow-ups with dueAt after now and completedAt nil are returned

#### Scenario: ListOverdueFollowUps returns past incomplete items
- **WHEN** ListOverdueFollowUps is called
- **THEN** only follow-ups with dueAt before now and completedAt nil are returned
