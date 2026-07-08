## MODIFIED Requirements

### Requirement: Sidebar contains navigation and filtering controls
The system SHALL render the app title, active application count, route-backed workspace navigation, pipeline controls (filter/sort/search), and follow-up work panels inside the sidebar.

#### Scenario: Sidebar contains pipeline controls
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the sidebar navigation landmark

#### Scenario: Sidebar contains follow-up work
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Follow-up work" SHALL be inside the sidebar navigation landmark

#### Scenario: Sidebar workspace navigation reflects active route
- **WHEN** the application is rendered at `/roles`
- **THEN** the Roles workspace navigation item SHALL be presented as active
- **AND** the Pipeline and Memory workspace navigation items SHALL NOT be presented as active

#### Scenario: Sidebar workspace navigation changes route
- **WHEN** the user activates the Memory workspace navigation item
- **THEN** the browser location SHALL be `/memory`
