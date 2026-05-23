## MODIFIED Requirements

### Requirement: Sidebar contains navigation and filtering controls
The system SHALL render the app title, active application count, pipeline controls (filter/sort/search), funnel chart, and follow-up work panels inside the sidebar.

#### Scenario: Sidebar contains pipeline controls
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the sidebar navigation landmark

#### Scenario: Sidebar contains follow-up work
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Follow-up work" SHALL be inside the sidebar navigation landmark

#### Scenario: Sidebar contains funnel chart
- **WHEN** the application is rendered
- **THEN** a `region` labelled "Application funnel" SHALL be present inside the sidebar navigation landmark, positioned between the stats bar and the pipeline controls
