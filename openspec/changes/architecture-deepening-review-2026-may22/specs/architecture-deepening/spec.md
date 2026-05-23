## ADDED Requirements

### Requirement: Backend full Job Application assembly is centralized
The backend application layer SHALL provide one module responsible for assembling a full Job Application with timeline events, interviews, follow-up reminders, and notes.

#### Scenario: Use case returns full application through assembly module
- **WHEN** a backend use case must return a full Job Application
- **THEN** it SHALL delegate child collection loading to the full Job Application assembly module instead of directly loading each child repository

#### Scenario: Assembly module preserves child collection ordering
- **WHEN** the full Job Application assembly module loads timeline events, interviews, follow-up reminders, and notes
- **THEN** each child collection SHALL be returned in the ordering expected by the current application behavior

### Requirement: Backend multi-step workflows are atomic
Backend Job Application workflows that write more than one persisted record SHALL execute those writes atomically.

#### Scenario: Stage advance rolls back on later failure
- **WHEN** advancing a Job Application stage succeeds at updating the stage but fails while writing a timeline event or deactivating follow-up reminders
- **THEN** the entire workflow SHALL be rolled back with no partial persistence

#### Scenario: Detail workflow rolls back on timeline failure
- **WHEN** scheduling an interview, creating a follow-up reminder, completing a follow-up reminder, or adding a note fails while writing the timeline event
- **THEN** the detail record change SHALL be rolled back

### Requirement: Pipeline workspace behavior is isolated from presentation rendering
The frontend SHALL place Pipeline workspace behavior behind a module that owns loading, filtering, sorting, follow-up grouping, local Job Application updates, selected application state, and command error state.

#### Scenario: App renders workspace state
- **WHEN** `App` renders the Pipeline workspace
- **THEN** filtering, sorting, follow-up grouping, and command state SHALL be provided by the Pipeline workspace module rather than recomputed directly in `App`

#### Scenario: Workspace module handles command result updates
- **WHEN** a Job Application command succeeds from the Pipeline board or details panel
- **THEN** the Pipeline workspace module SHALL update the local Job Application collection consistently for the rendered view

### Requirement: MSW handlers remain transport adapters
The MSW GraphQL handlers SHALL delegate Job Application state changes to an in-memory mock backend module.

#### Scenario: Handler delegates create opportunity
- **WHEN** the `CreateSavedOpportunity` MSW operation is received
- **THEN** the handler SHALL translate the GraphQL input and delegate creation to the mock backend module

#### Scenario: Mock backend owns generated values
- **WHEN** the mock backend creates timeline events, interviews, follow-up reminders, notes, or applications
- **THEN** IDs and timestamps SHALL be generated inside the mock backend module rather than in MSW handler functions

### Requirement: Architecture tests protect deepened seams
The test suite SHALL include architecture or module-level tests that prevent the deepened modules from collapsing back into callers.

#### Scenario: Backend use cases avoid direct child repository loading
- **WHEN** backend architecture tests run
- **THEN** use cases that return full Job Applications SHALL NOT directly call every child repository for rehydration

#### Scenario: MSW does not own mock backend state
- **WHEN** frontend architecture tests run
- **THEN** MSW handler modules SHALL NOT own mutable Job Application mock state
