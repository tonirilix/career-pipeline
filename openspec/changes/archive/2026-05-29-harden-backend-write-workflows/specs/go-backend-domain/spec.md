## MODIFIED Requirements

### Requirement: Domain error types
The system SHALL define typed error values for expected domain failures: `ErrApplicationNotFound`, `ErrInvalidStageTransition`, `ErrInterviewNotFound`, `ErrFollowUpNotFound`, `ErrNoteBodyEmpty`, `ErrCompanyRequired`, `ErrRoleTitleRequired`, `ErrDueDateInPast`.

#### Scenario: Error types are recognizable by callers
- **WHEN** a use case returns a domain error
- **THEN** callers SHALL be able to use `errors.Is` to identify the specific failure

#### Scenario: Application intake errors are distinct from note errors
- **WHEN** CreateApplication receives a missing company or role title
- **THEN** it SHALL return an application intake error rather than `ErrNoteBodyEmpty`
