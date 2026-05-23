# Capability: Go Backend GraphQL Adapter

## Purpose

The GraphQL adapter layer for the Go backend. Defines the schema as source of truth, generates resolver interfaces via gqlgen, and implements thin resolver methods that map inputs to use case commands and outputs to GraphQL DTOs.
## Requirements
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

### Requirement: GraphQL schema uses stable workflow value shapes
The GraphQL schema SHALL expose stable value shapes for application stages, job sources, employment types, interview types, and interview outcomes, and resolvers SHALL map those values explicitly to domain values.

#### Scenario: Invalid GraphQL enum or value is rejected before use case execution
- **WHEN** a GraphQL mutation receives a stage, source, employment type, interview type, or interview outcome that cannot be mapped to a domain value
- **THEN** the resolver SHALL return a structured GraphQL error without calling the use case

#### Scenario: Resolver mapping is covered by tests
- **WHEN** backend GraphQL adapter tests run
- **THEN** every supported GraphQL value for stages, sources, employment types, interview types, and interview outcomes SHALL be verified to map to the intended domain value

### Requirement: Frontend gateway contract is verified against backend schema
The frontend GraphQL gateway operations SHALL be verified against the backend GraphQL schema so the real backend can replace MSW without frontend operation changes.

#### Scenario: Frontend operations validate against schema
- **WHEN** contract tests run
- **THEN** every operation used by the frontend GraphQL gateway SHALL validate against `apps/api/graph/schema.graphqls`

#### Scenario: Gateway maps backend errors predictably
- **WHEN** the backend returns a known domain failure through GraphQL
- **THEN** the frontend GraphQL gateway SHALL expose the failure message through the existing application result path

