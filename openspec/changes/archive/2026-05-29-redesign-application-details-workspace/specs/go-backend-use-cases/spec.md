## ADDED Requirements

### Requirement: Active work cannot be created for closed applications
The backend SHALL reject use cases that create active future work for applications in Rejected or Withdrawn stages.

#### Scenario: Follow-up rejected for rejected application
- **WHEN** AddFollowUp is called for an application in Rejected stage
- **THEN** it SHALL return a domain error without persisting a follow-up or timeline event

#### Scenario: Follow-up rejected for withdrawn application
- **WHEN** AddFollowUp is called for an application in Withdrawn stage
- **THEN** it SHALL return a domain error without persisting a follow-up or timeline event

## MODIFIED Requirements

### Requirement: Schedule interview use case
The system SHALL implement a `ScheduleInterview` use case that accepts applicationId, type, scheduledAt, and notes, validates that the application is in an interviewable stage, persists the interview with outcome `Scheduled`, creates a timeline event, and returns the updated application.

#### Scenario: Interview created for valid stage
- **WHEN** ScheduleInterview is called on an application in Applied, Screening, Technical Interview, or Onsite stage
- **THEN** the interview SHALL be persisted with outcome `Scheduled` and a timeline event SHALL be created

#### Scenario: Interview rejected for invalid stage
- **WHEN** ScheduleInterview is called on an application in Saved, Offer, Rejected, or Withdrawn stage
- **THEN** it SHALL return an error without persisting

#### Scenario: Schedule command ignores final outcomes
- **WHEN** ScheduleInterview is called
- **THEN** it SHALL not accept or persist a final outcome from the scheduling command

### Requirement: Record interview outcome use case
The system SHALL implement a `RecordInterviewOutcome` use case that accepts interviewId and outcome, updates the interview record, creates a timeline event, and returns the updated application.

#### Scenario: Outcome is recorded and timeline updated
- **WHEN** RecordInterviewOutcome is called with a valid interviewId and outcome
- **THEN** the interview outcome is updated and a timeline event is appended

#### Scenario: Scheduled outcome is not recorded as final result
- **WHEN** RecordInterviewOutcome is called with outcome `Scheduled`
- **THEN** it SHALL return a domain error without changing the interview
