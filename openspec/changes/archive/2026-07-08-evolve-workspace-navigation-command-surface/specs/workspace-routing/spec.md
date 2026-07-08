## MODIFIED Requirements

### Requirement: Workspace navigation uses browser history
The system SHALL update browser history when users navigate among top-level workspaces from the global navigation shell, route-local UI, or command palette.

#### Scenario: Navigating to memory updates location
- **WHEN** the user activates the Memory workspace navigation item
- **THEN** the browser location SHALL be `/memory`

#### Scenario: Navigating to roles updates location
- **WHEN** the user activates the Roles workspace navigation item
- **THEN** the browser location SHALL be `/roles`

#### Scenario: Back returns to previous workspace
- **WHEN** the user navigates from `/pipeline` to `/memory` and then uses browser Back
- **THEN** the main content SHALL render the pipeline workspace

#### Scenario: Navigation item active state follows route
- **WHEN** the user opens `/roles`
- **THEN** the global navigation shell SHALL present Roles as the active workspace route

#### Scenario: Command navigation updates location
- **WHEN** the user navigates to `/memory` using the command palette
- **THEN** the browser location SHALL be `/memory`
- **AND** browser Back SHALL return to the previous workspace
