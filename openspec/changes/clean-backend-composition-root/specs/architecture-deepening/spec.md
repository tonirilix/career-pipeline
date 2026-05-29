## ADDED Requirements

### Requirement: Backend composition concerns stay at the outer layer
Backend configuration, bootstrap, composition, and HTTP server modules SHALL remain outer-layer concerns and SHALL NOT be imported by domain or application packages.

#### Scenario: Domain remains independent from runtime composition
- **WHEN** backend architecture tests inspect the domain package
- **THEN** domain files SHALL NOT import backend configuration, bootstrap, composition, server, GraphQL, persistence, database, migration, or HTTP packages

#### Scenario: Application remains independent from runtime composition
- **WHEN** backend architecture tests inspect the application packages
- **THEN** application files SHALL NOT import backend configuration, bootstrap, composition, server, GraphQL, persistence, database, migration, or HTTP packages

#### Scenario: Composition module is the only backend layer that wires adapters to use cases
- **WHEN** backend architecture tests inspect repository/use-case/resolver construction
- **THEN** infrastructure adapters and GraphQL resolvers SHALL be connected to application use cases from the composition root or its focused composition module, not from domain or application packages
