## MODIFIED Requirements

### Requirement: Frontend gateway contract is verified against backend schema
The frontend GraphQL gateway operations SHALL be verified against the backend GraphQL schema so the real backend can replace MSW without frontend operation changes, and frontend GraphQL code generation SHALL use `apps/api/graph/schema.graphqls` as its schema source.

#### Scenario: Frontend operations validate against schema
- **WHEN** contract tests or frontend GraphQL codegen run
- **THEN** every operation used by the frontend GraphQL gateway SHALL validate against `apps/api/graph/schema.graphqls`

#### Scenario: Frontend generated types come from backend schema
- **WHEN** frontend GraphQL operation types are generated
- **THEN** the generator SHALL read `apps/api/graph/schema.graphqls` as the schema source rather than a copied frontend schema

#### Scenario: Gateway maps backend errors predictably
- **WHEN** the backend returns a known domain failure through GraphQL
- **THEN** the frontend GraphQL gateway SHALL expose the failure message through the existing application result path
