## ADDED Requirements

### Requirement: GraphQL schema definition
The system SHALL define a schema-first GraphQL schema at `apps/api/graph/schema.graphqls` that covers all types, queries, and mutations required by the frontend gateway adapter.

#### Scenario: Schema includes all application fields
- **WHEN** a client queries a JobApplication
- **THEN** the response SHALL include: id, company, roleTitle, postingUrl, source, location, compensation, employmentType, stage, createdAt, notes, interviews, followUps, and timeline

#### Scenario: Schema includes all mutations
- **WHEN** the schema is loaded
- **THEN** it SHALL expose mutations: createApplication, advanceStage, scheduleInterview, recordInterviewOutcome, addFollowUp, completeFollowUp, addNote, rejectApplication, withdrawApplication, reopenApplication

#### Scenario: Schema includes all queries
- **WHEN** the schema is loaded
- **THEN** it SHALL expose queries: application(id), applications(filter, sort), upcomingFollowUps, overdueFollowUps

### Requirement: gqlgen code generation
The system SHALL use gqlgen to generate Go resolver interfaces from the GraphQL schema. The `gqlgen.yml` configuration SHALL map generated types to domain structs where shapes align and to separate DTO structs where they differ.

#### Scenario: Generated resolver interfaces are satisfied at compile time
- **WHEN** `go build ./...` is run
- **THEN** it SHALL fail if any resolver method is missing an implementation

### Requirement: Resolver implementations are thin adapters
The system SHALL implement all resolvers so that each resolver method: maps GraphQL input to an application command, calls exactly one use case, and maps the result or error to a GraphQL response type.

#### Scenario: Resolver does not contain business logic
- **WHEN** a resolver method is reviewed
- **THEN** it SHALL contain no conditional business rule logic — only input mapping, one use case call, and output mapping

#### Scenario: Resolver maps domain errors to GraphQL errors
- **WHEN** a use case returns a domain error (e.g., ErrInvalidStageTransition)
- **THEN** the resolver SHALL return a structured GraphQL error with a stable error code, not a generic 500

### Requirement: GraphQL input validation at resolver boundary
The system SHALL validate GraphQL inputs at the resolver boundary before constructing application commands. Required string fields SHALL be checked for emptiness; enum fields SHALL be checked against valid values.

#### Scenario: Invalid enum input returns GraphQL error
- **WHEN** a mutation is called with an invalid stage value
- **THEN** the resolver SHALL return a GraphQL error with a descriptive message without calling the use case

### Requirement: Schema compatibility with frontend gateway
The GraphQL schema SHALL be compatible with the existing frontend MSW handlers' operation shapes so that switching from MSW to the real backend requires only a URL change, not frontend code changes.

#### Scenario: Frontend operations resolve without modification
- **WHEN** the frontend gateway adapter points to the real backend URL
- **THEN** all existing GraphQL operations (queries and mutations) SHALL succeed without frontend code changes
