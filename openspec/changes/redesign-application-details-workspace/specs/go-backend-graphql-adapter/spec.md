## ADDED Requirements

### Requirement: Schedule interview input excludes outcome
The GraphQL schedule-interview mutation SHALL accept only applicationId, type, scheduledAt, and notes as workflow input, and SHALL create interviews with outcome `Scheduled`.

#### Scenario: Schedule input has no outcome field
- **WHEN** the GraphQL schema is loaded
- **THEN** `ScheduleInterviewInput` SHALL not expose an outcome field

#### Scenario: Scheduled interview returns scheduled outcome
- **WHEN** a client schedules an interview through GraphQL
- **THEN** the returned application SHALL include the new interview with outcome `Scheduled`

### Requirement: Record interview outcome mutation updates existing interview
The GraphQL adapter SHALL expose a record-interview-outcome mutation that maps to the backend use case for updating an existing interview's outcome.

#### Scenario: Outcome mutation maps to one use case
- **WHEN** the record-interview-outcome resolver is called
- **THEN** it SHALL map input to one application command, call the RecordInterviewOutcome use case, and map the result without resolver business logic

#### Scenario: Outcome mutation returns updated application
- **WHEN** a client records an interview outcome through GraphQL
- **THEN** the mutation SHALL return the updated application containing the changed interview

## MODIFIED Requirements

### Requirement: Schema compatibility with frontend gateway
The GraphQL schema SHALL be compatible with the frontend gateway adapter's operation shapes so that switching between MSW and the real backend requires only a URL change, not divergent frontend behavior.

#### Scenario: Frontend operations resolve without modification
- **WHEN** the frontend gateway adapter points to the real backend URL
- **THEN** all current GraphQL operations used by the frontend gateway, including separate schedule-interview and record-interview-outcome operations, SHALL succeed without environment-specific code paths
