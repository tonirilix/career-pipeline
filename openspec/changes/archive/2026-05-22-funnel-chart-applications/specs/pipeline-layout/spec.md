## MODIFIED Requirements

### Requirement: Main content area contains the funnel chart above the pipeline board
The system SHALL render a `FunnelChart` region in the main content area, positioned above the pipeline board and below the command error notice (if any).

#### Scenario: Main content area contains the funnel chart
- **WHEN** the application is rendered
- **THEN** a `region` labelled "Application funnel" SHALL be present inside the `main` element, above the pipeline board

#### Scenario: Sidebar does not contain the funnel chart
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Application funnel" SHALL NOT be inside the sidebar navigation landmark
