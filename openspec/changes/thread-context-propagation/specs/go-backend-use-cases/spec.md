## MODIFIED Requirements

### Requirement: Repository port interfaces
The system SHALL define Go interfaces in `internal/application/ports/` for all repository operations: `JobApplicationRepository`, `InterviewRepository`, `FollowUpRepository`, `NoteRepository`, `TimelineRepository`. Each interface SHALL define only the methods required by use cases. All interface methods SHALL accept `context.Context` as their first parameter.

#### Scenario: Interfaces are in the application layer
- **WHEN** a use case file is compiled
- **THEN** it SHALL import port interfaces from `internal/application/ports`, not from `internal/infrastructure`

#### Scenario: Repository methods accept context
- **WHEN** a repository port interface method is called
- **THEN** the caller SHALL provide a `context.Context` as the first argument, and the implementation SHALL forward it to the underlying database call

### Requirement: Supporting port interfaces
The system SHALL define interfaces for: `Clock` (returns current time), `IDGenerator` (returns a new unique string ID), and `Transactor` (executes a function inside a database transaction). The `Transactor.WithTransaction` method SHALL accept `context.Context` as its first parameter and forward it to all repository operations executed within the transaction.

#### Scenario: Clock port enables deterministic tests
- **WHEN** a use case test provides a fake Clock returning a fixed time
- **THEN** the use case SHALL use that time for all timestamp fields without calling time.Now() directly

#### Scenario: Transactor forwards context into transaction
- **WHEN** `WithTransaction` is called with a context that is subsequently cancelled
- **THEN** repository operations inside the transaction closure SHALL receive the cancelled context and MAY fail fast rather than continuing

## ADDED Requirements

### Requirement: Use case methods accept and forward context
All use case `Execute` methods SHALL accept `context.Context` as their first parameter and forward it to every port method they call. Use cases SHALL NOT create or replace context values.

#### Scenario: Use case forwards caller context to ports
- **WHEN** a use case Execute method is called with a context
- **THEN** every repository and transactor call inside that use case SHALL receive the same context

#### Scenario: Cancelled context propagates to persistence
- **WHEN** a use case is called with an already-cancelled context
- **THEN** the first port call that reaches the database layer SHALL return a context error without executing the SQL
