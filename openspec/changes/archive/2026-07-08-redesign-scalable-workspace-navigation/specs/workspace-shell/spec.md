## ADDED Requirements

### Requirement: Workspaces render inside a shared workspace shell
The system SHALL render each top-level workspace inside a shared workspace shell that provides a route-specific header, local action area, local tools area, and main content region.

#### Scenario: Pipeline renders with route-specific heading
- **WHEN** a user opens `/pipeline`
- **THEN** the workspace shell SHALL present a Pipeline heading
- **AND** the main content SHALL render the pipeline board workflow

#### Scenario: Memory renders with route-specific heading
- **WHEN** a user opens `/memory`
- **THEN** the workspace shell SHALL present a Memory heading
- **AND** the main content SHALL render the candidate memory workflow

#### Scenario: Roles renders with route-specific heading
- **WHEN** a user opens `/roles`
- **THEN** the workspace shell SHALL present a Roles heading
- **AND** the main content SHALL render the role discovery workflow

### Requirement: Workspace actions are route-local
The system SHALL place actions and controls that apply only to one workspace inside that workspace's shell, not inside global navigation.

#### Scenario: Pipeline primary action is local to Pipeline
- **WHEN** the user opens `/pipeline`
- **THEN** the Add opportunity action SHALL be available in the Pipeline workspace shell

#### Scenario: Pipeline primary action is absent from Memory
- **WHEN** the user opens `/memory`
- **THEN** the Add opportunity action SHALL NOT be presented as a Memory workspace action

#### Scenario: Pipeline primary action is absent from Roles
- **WHEN** the user opens `/roles`
- **THEN** the Add opportunity action SHALL NOT be presented as a Roles workspace action

### Requirement: Workspace shell preserves usable content width
The system SHALL keep workspace-local tools from permanently reducing content width on unrelated routes.

#### Scenario: Memory is not constrained by pipeline controls
- **WHEN** the user opens `/memory`
- **THEN** pipeline filters and follow-up work SHALL NOT occupy a persistent column beside the Memory workspace content

#### Scenario: Roles is not constrained by pipeline controls
- **WHEN** the user opens `/roles`
- **THEN** pipeline filters and follow-up work SHALL NOT occupy a persistent column beside the Roles workspace content

#### Scenario: Pipeline tools do not dominate Pipeline content
- **WHEN** the user opens `/pipeline`
- **THEN** workspace-local filters SHALL render as compact toolbar controls
- **AND** follow-up work SHALL be secondary to the funnel and board content
