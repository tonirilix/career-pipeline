## MODIFIED Requirements

### Requirement: Pipeline workspace contains compact pipeline controls and secondary follow-up work
The system SHALL render active application count, Pipeline saved views, active view/filter context, and follow-up work inside the Pipeline workspace rather than inside global navigation. Raw Pipeline controls (filter/sort/search) SHALL be hidden behind a View options surface by default. Follow-up work SHALL be presented through the Needs attention view or secondary Pipeline context and SHALL NOT permanently reduce the board width.

#### Scenario: Pipeline workspace contains pipeline controls
- **WHEN** the application is rendered at `/pipeline`
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the Pipeline workspace or available from Pipeline View options
- **AND** raw search, stage, source, and sort controls SHALL NOT render as an always-visible toolbar by default

#### Scenario: Pipeline workspace contains follow-up work
- **WHEN** the application is rendered at `/pipeline`
- **THEN** follow-up work SHALL be reachable inside the Pipeline workspace
- **AND** follow-up work SHALL NOT be rendered as a persistent sidebar column beside the pipeline board

#### Scenario: Pipeline workspace contains application stats
- **WHEN** the application is rendered at `/pipeline`
- **THEN** active application count, overdue follow-up count, and upcoming follow-up count SHALL be presented as compact stats or contextual counters inside the Pipeline workspace

#### Scenario: Active filters render as chips
- **WHEN** the user applies a non-default Pipeline filter or sort
- **THEN** the Pipeline workspace SHALL show compact active filter or sort chips
- **AND** the raw filter controls SHALL remain hidden unless the user opens View options

#### Scenario: View options reveals raw controls
- **WHEN** the user opens Pipeline View options
- **THEN** raw search, stage, source, and sort controls SHALL be available
- **AND** closing View options SHALL return the main Pipeline workspace to the selected saved view
