## ADDED Requirements

### Requirement: Command palette opens from global UI and keyboard shortcut
The system SHALL provide a command palette dialog that can be opened from the global navigation rail and from a keyboard shortcut.

#### Scenario: Open command palette from global rail
- **WHEN** the user activates the global command/search control
- **THEN** a command palette dialog SHALL open
- **AND** focus SHALL move to the command input

#### Scenario: Open command palette from keyboard
- **WHEN** the user presses the configured command palette keyboard shortcut
- **THEN** a command palette dialog SHALL open
- **AND** focus SHALL move to the command input

#### Scenario: Close command palette
- **WHEN** the command palette is open
- **AND** the user dismisses it
- **THEN** the command palette SHALL close without changing workspace state

### Requirement: Command palette supports grouped deterministic commands
The system SHALL present deterministic command items grouped by purpose.

#### Scenario: Command groups are visible
- **WHEN** the command palette is opened
- **THEN** it SHALL include command groups for Navigation, Create, and Pipeline

#### Scenario: Command filtering narrows options
- **WHEN** the user types into the command input
- **THEN** visible command items SHALL be narrowed to matching deterministic commands

### Requirement: Command palette navigates between workspaces
The system SHALL allow command items to navigate to top-level workspaces using browser history.

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

### Requirement: Command palette triggers creation actions
The system SHALL expose route-appropriate creation actions from the command palette.

#### Scenario: Add opportunity command opens opportunity form
- **WHEN** the user selects the Add opportunity command
- **THEN** the Pipeline workspace SHALL be active
- **AND** the Add opportunity `SlideOver` SHALL open
- **AND** the command palette SHALL close

### Requirement: Command palette controls Pipeline saved views and filters
The system SHALL expose deterministic Pipeline commands for saved views, filter presets, sorting, and clearing filters.

#### Scenario: Select Pipeline saved view from command palette
- **WHEN** the user selects a Pipeline saved view command
- **THEN** the Pipeline workspace SHALL be active
- **AND** the selected Pipeline saved view SHALL become active
- **AND** the command palette SHALL close

#### Scenario: Clear Pipeline filters from command palette
- **WHEN** the user selects the clear Pipeline filters command
- **THEN** Pipeline raw filters SHALL return to their default state
- **AND** active filter chips SHALL no longer be shown
