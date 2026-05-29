## ADDED Requirements

### Requirement: Generated GraphQL artifacts stay inside infrastructure
Frontend generated GraphQL artifacts SHALL remain an infrastructure adapter detail and SHALL NOT be imported by domain, application, presentation, or port modules.

#### Scenario: Generated GraphQL imports are infrastructure-only
- **WHEN** frontend architecture tests scan imports of generated GraphQL artifacts
- **THEN** only modules under `apps/web/src/infrastructure/graphql/` SHALL import those artifacts

#### Scenario: Domain and application layers remain GraphQL-free
- **WHEN** frontend architecture tests inspect domain and application modules
- **THEN** those modules SHALL NOT import generated GraphQL types, GraphQL operation documents, or GraphQL Code Generator helper types

#### Scenario: Presentation remains behind workspace and gateway ports
- **WHEN** presentation components or hooks need Job Application data
- **THEN** they SHALL continue to use existing workspace hooks and application ports rather than generated GraphQL artifacts directly
