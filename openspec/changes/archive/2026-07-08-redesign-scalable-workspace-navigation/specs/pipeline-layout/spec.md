## MODIFIED Requirements

### Requirement: App renders with global navigation and a main workspace area
The system SHALL render an application shell with global workspace navigation and a scrollable main workspace area. On viewports 768px and wider, global navigation SHALL remain available as a persistent sidebar or rail. On viewports narrower than 768px, global navigation SHALL be hidden by default and accessible through a navigation trigger while the main workspace fills the viewport width.

#### Scenario: Global navigation is available on desktop
- **WHEN** the application is rendered on a viewport 768px or wider
- **THEN** a `navigation` landmark SHALL be present containing app identity and workspace navigation items

#### Scenario: Main workspace area fills remaining space on desktop
- **WHEN** the application is rendered on a viewport 768px or wider
- **THEN** the `main` element SHALL occupy all horizontal space not used by global navigation

#### Scenario: Main workspace fills full width on mobile
- **WHEN** the application is rendered on a viewport narrower than 768px
- **THEN** the `main` element SHALL occupy the full viewport width when global navigation is closed

### Requirement: Main content area contains the funnel chart above the pipeline board
The system SHALL render a `FunnelChart` region in the Pipeline workspace main content area, positioned above the pipeline board and below the command error notice (if any).

#### Scenario: Pipeline workspace contains the funnel chart
- **WHEN** the application is rendered at `/pipeline`
- **THEN** a `region` labelled "Application funnel" SHALL be present inside the `main` element, above the pipeline board

#### Scenario: Global navigation does not contain the funnel chart
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Application funnel" SHALL NOT be inside the global navigation landmark

### Requirement: Global navigation excludes pipeline-only controls
The system SHALL render app identity and route-backed workspace navigation inside global navigation. The system SHALL NOT render pipeline stats, pipeline filters, follow-up work, or Add opportunity inside global navigation.

#### Scenario: Global navigation contains workspace navigation
- **WHEN** the application is rendered
- **THEN** global navigation SHALL include Pipeline, Memory, and Roles navigation items

#### Scenario: Global navigation omits pipeline controls
- **WHEN** the application is rendered at `/memory`
- **THEN** the `region` labelled "Pipeline controls" SHALL NOT be inside the global navigation landmark

#### Scenario: Global navigation omits follow-up work
- **WHEN** the application is rendered at `/roles`
- **THEN** the `region` labelled "Follow-up work" SHALL NOT be inside the global navigation landmark

#### Scenario: Global navigation reflects active route
- **WHEN** the application is rendered at `/roles`
- **THEN** the Roles workspace navigation item SHALL be presented as active
- **AND** the Pipeline and Memory workspace navigation items SHALL NOT be presented as active

#### Scenario: Global navigation changes route
- **WHEN** the user activates the Memory workspace navigation item
- **THEN** the browser location SHALL be `/memory`

### Requirement: Pipeline workspace contains compact pipeline controls and secondary follow-up work
The system SHALL render active application count, pipeline controls (filter/sort/search), and follow-up work inside the Pipeline workspace rather than inside global navigation. Pipeline controls SHALL use a compact responsive toolbar so they do not occupy a large vertical control block on desktop. Follow-up work SHALL be presented as secondary Pipeline content and SHALL NOT permanently reduce the board width.

#### Scenario: Pipeline workspace contains pipeline controls
- **WHEN** the application is rendered at `/pipeline`
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the Pipeline workspace
- **AND** the controls SHALL be presented as a compact toolbar that keeps search, stage, source, and sort controls in one row when desktop width permits

#### Scenario: Pipeline workspace contains follow-up work
- **WHEN** the application is rendered at `/pipeline`
- **THEN** the `region` labelled "Follow-up work" SHALL be inside the Pipeline workspace
- **AND** follow-up work SHALL NOT be rendered as a persistent sidebar column beside the pipeline board

#### Scenario: Pipeline workspace contains application stats
- **WHEN** the application is rendered at `/pipeline`
- **THEN** active application count, overdue follow-up count, and upcoming follow-up count SHALL be presented as compact stats inside the Pipeline workspace

### Requirement: Opportunity form opens in a SlideOver panel
The system SHALL trigger the `SlideOver` panel (instead of inline expansion) when the user initiates adding a new opportunity from the Pipeline workspace.

#### Scenario: Clicking "Add opportunity" opens the slide-over
- **WHEN** the user opens `/pipeline`
- **AND** the user clicks the "Add opportunity" button
- **THEN** a `SlideOver` SHALL open containing the `OpportunityForm`

#### Scenario: Submitting the form closes the slide-over
- **WHEN** the user successfully submits the `OpportunityForm`
- **THEN** the `SlideOver` SHALL close and the new application SHALL appear in the pipeline board

#### Scenario: Cancelling the form closes the slide-over
- **WHEN** the user clicks "Cancel" in the `OpportunityForm`
- **THEN** the `SlideOver` SHALL close without adding an application
