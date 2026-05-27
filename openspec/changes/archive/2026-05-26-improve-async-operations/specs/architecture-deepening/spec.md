## MODIFIED Requirements

### Requirement: Pipeline workspace behavior is isolated from presentation rendering
The frontend SHALL place Pipeline workspace behavior behind a module that owns filtering, sorting, follow-up grouping, selected application state, command error placement, and local read-model projections. Server request lifecycle and mutation cache updates MAY be delegated to a dedicated frontend async data layer, provided presentation rendering does not own those concerns directly.

#### Scenario: App renders workspace state
- **WHEN** `App` renders the Pipeline workspace
- **THEN** filtering, sorting, follow-up grouping, and command state SHALL be provided by the Pipeline workspace module rather than recomputed directly in `App`

#### Scenario: Workspace module handles command result updates
- **WHEN** a Job Application command succeeds from the Pipeline board or details panel
- **THEN** the Pipeline workspace module or its delegated async data layer SHALL update the rendered Job Application collection consistently for the current view

#### Scenario: Workspace delegates server async lifecycle
- **WHEN** the Pipeline workspace loads applications or executes server-backed Job Application commands
- **THEN** request pending state, request errors, mutation pending state, cache updates, and query invalidation MAY be handled by a dedicated async data layer rather than by hand-written component effect state
