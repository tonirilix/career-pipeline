## MODIFIED Requirements

### Requirement: Resolver implementations are thin adapters
The system SHALL implement all resolvers so that each resolver method: maps GraphQL input to an application command, calls exactly one use case passing the resolver's `context.Context`, and maps the result or error to a GraphQL response type. Resolvers SHALL NOT discard the gqlgen-provided context at the resolver boundary.

#### Scenario: Resolver does not contain business logic
- **WHEN** a resolver method is reviewed
- **THEN** it SHALL contain no conditional business rule logic — only input mapping, one use case call, and output mapping

#### Scenario: Resolver maps domain errors to GraphQL errors
- **WHEN** a use case returns a domain error (e.g., ErrInvalidStageTransition)
- **THEN** the resolver SHALL return a structured GraphQL error with a stable error code, not a generic 500

#### Scenario: Resolver forwards request context to use case
- **WHEN** a GraphQL resolver method is invoked
- **THEN** it SHALL pass the gqlgen-provided `ctx` as the first argument to the use case Execute call, not a new or background context
