## ADDED Requirements

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
