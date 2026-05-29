## ADDED Requirements

### Requirement: Frontend GraphQL operations are generated from schema-validated documents
The frontend SHALL use GraphQL Code Generator to generate TypeScript operation artifacts from frontend-owned GraphQL documents validated against `apps/api/graph/schema.graphqls`.

#### Scenario: Codegen validates frontend operations against backend schema
- **WHEN** the frontend GraphQL codegen command runs
- **THEN** every frontend GraphQL operation document SHALL be validated against `apps/api/graph/schema.graphqls`

#### Scenario: Codegen emits operation result and variable types
- **WHEN** codegen succeeds
- **THEN** generated TypeScript artifacts SHALL include result and variables types for every Job Application GraphQL query and mutation used by the frontend gateway

#### Scenario: Operation documents are frontend-owned
- **WHEN** maintainers edit the frontend GraphQL selection set for Job Application data
- **THEN** they SHALL edit frontend-owned `.graphql` operation documents rather than editing operation strings embedded in the gateway implementation

### Requirement: GraphQL gateway consumes generated operation artifacts
The frontend GraphQL Job Application gateway SHALL use generated GraphQL operation artifacts to type operation variables and responses while preserving the `JobApplicationGateway` port and domain mapping boundary.

#### Scenario: Gateway request variables are generated types
- **WHEN** the gateway sends a Job Application GraphQL query or mutation
- **THEN** the variables object SHALL be typechecked against the generated variables type for that operation

#### Scenario: Gateway response data is generated type
- **WHEN** the gateway maps a GraphQL operation response
- **THEN** the response data SHALL be typechecked against the generated result type for that operation

#### Scenario: Domain mapping boundary remains
- **WHEN** generated GraphQL data is returned from the request helper
- **THEN** the gateway SHALL map it into existing domain/application types before returning through `JobApplicationGateway`

### Requirement: GraphQL codegen is part of frontend verification
The frontend SHALL provide a repeatable codegen command and include generated artifact freshness or generation in the frontend verification workflow.

#### Scenario: Codegen command is available
- **WHEN** a developer works in `apps/web`
- **THEN** package scripts SHALL expose a command to regenerate frontend GraphQL artifacts

#### Scenario: Build verifies generated types
- **WHEN** the frontend build or verification workflow runs
- **THEN** stale or invalid generated GraphQL artifacts SHALL fail before the application is considered releasable
