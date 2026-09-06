## MODIFIED Requirements

### Requirement: Command palette navigates between workspaces
The system SHALL allow command items to navigate to top-level workspaces using browser history.

#### Scenario: Navigate to Today from command palette
- **WHEN** the user selects the Today navigation command
- **THEN** the browser location SHALL be `/today`
- **AND** the Today workspace SHALL render
- **AND** the command palette SHALL close

#### Scenario: Navigate to Memory from command palette
- **WHEN** the user selects the Memory navigation command
- **THEN** the browser location SHALL be `/memory`
- **AND** the Memory workspace SHALL render
- **AND** the command palette SHALL close

#### Scenario: Navigate to Roles from command palette
- **WHEN** the user selects the Roles navigation command
- **THEN** the browser location SHALL be `/roles`
- **AND** the Roles workspace SHALL render
- **AND** the command palette SHALL close
