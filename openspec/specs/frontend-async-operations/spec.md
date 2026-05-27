# frontend-async-operations Specification

## Purpose
Defines requirements for the frontend async data layer that manages server state for Job Applications using a managed query client, keeping server cache state separate from UI interaction state.

## Requirements

### Requirement: Frontend server state uses a query client
The frontend SHALL provide a single query client at the React application root for cacheable server request data and server-backed mutations.

#### Scenario: App renders with query client provider
- **WHEN** the React application root renders
- **THEN** descendants SHALL be able to run Job Application queries and mutations through the shared query client

#### Scenario: Query client is not recreated during normal renders
- **WHEN** the application re-renders after user interaction
- **THEN** the existing query client cache SHALL remain available to descendant components

### Requirement: Job Application loading uses managed query state
The frontend SHALL load the Job Application list through a managed query instead of hand-written effect loading state.

#### Scenario: Initial load shows loading state
- **WHEN** the Job Application list query is pending
- **THEN** the main content area SHALL render the existing loading status for applications

#### Scenario: Load success renders cached applications
- **WHEN** the Job Application list query succeeds
- **THEN** the Pipeline workspace SHALL derive visible applications, stage counts, selected application, and follow-up groups from the query data

#### Scenario: Load failure is visible
- **WHEN** the Job Application list query fails
- **THEN** the main content area SHALL display an error alert describing that applications could not be loaded

### Requirement: Job Application mutations update server-state cache consistently
The frontend SHALL execute Job Application commands through managed mutations and keep the cached Job Application list consistent after successful mutations.

#### Scenario: Stage update refreshes cached application
- **WHEN** changing an application's stage succeeds and returns a full Job Application
- **THEN** the cached Job Application list SHALL contain the returned application in place of the previous application with the same ID

#### Scenario: Detail workflow refreshes cached application
- **WHEN** scheduling an interview, creating a follow-up reminder, completing a follow-up reminder, or adding a note succeeds and returns a full Job Application
- **THEN** the cached Job Application list SHALL contain the returned application in place of the previous application with the same ID

#### Scenario: Create opportunity adds application to cached list
- **WHEN** creating a saved opportunity succeeds
- **THEN** the cached Job Application list SHALL include the created opportunity without requiring a full page reload

#### Scenario: Failed mutation does not mutate cache
- **WHEN** a Job Application mutation fails
- **THEN** the cached Job Application list SHALL remain unchanged by that failed mutation

### Requirement: Async operation state remains separated from UI state
The frontend SHALL keep server request cache state separate from client interaction state.

#### Scenario: Pipeline controls remain in UI state
- **WHEN** the user changes pipeline search, filters, or sorting
- **THEN** those values SHALL remain managed as client UI state rather than as server query cache data

#### Scenario: Local forms preserve input through mutation failure
- **WHEN** an add-opportunity, note, follow-up, or interview command fails
- **THEN** user-entered form input SHALL remain in the active form

### Requirement: Async implementation avoids Effect and AtomRpc
The frontend async data layer SHALL NOT require Effect, Effect Atom, or AtomRpc for this change.

#### Scenario: Async operations run through existing ports
- **WHEN** the frontend loads or mutates Job Applications
- **THEN** it SHALL call the existing application use cases and gateway port rather than introducing an Effect RPC or AtomRpc client

#### Scenario: GraphQL remains an infrastructure adapter
- **WHEN** query or mutation functions need remote Job Application data
- **THEN** GraphQL operation details SHALL remain behind the existing infrastructure gateway adapter
