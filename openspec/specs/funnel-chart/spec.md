## ADDED Requirements

### Requirement: Main content area displays an interactive funnel chart above the pipeline board
The system SHALL render a `FunnelChart` component in the main content area, above the pipeline board, showing the count of applications in each of the eight pipeline stages as a flowing horizontal funnel shape powered by `@nivo/funnel`.

#### Scenario: All eight stages are labelled
- **WHEN** the funnel chart is rendered
- **THEN** it SHALL display a labelled header button for each of the eight stages: Saved, Applied, Screening, Technical interview, Onsite, Offer, Rejected, Withdrawn

#### Scenario: Stage count is shown in the header
- **WHEN** a stage has applications
- **THEN** the application count SHALL be visible in that stage's header button

#### Scenario: Zero-count stage remains visible
- **WHEN** a stage has zero applications
- **THEN** its header button SHALL still be rendered with the label and a zero count

#### Scenario: Funnel updates when an application changes stage
- **WHEN** the user moves an application to a different stage on the pipeline board
- **THEN** the funnel chart counts SHALL update immediately to reflect the new stage distribution without a page reload

#### Scenario: Clicking a stage filters the pipeline board
- **WHEN** the user clicks a stage header button or a segment in the nivo chart
- **THEN** the pipeline board SHALL be filtered to show only applications in that stage
- **AND** the active filter badge SHALL appear in the funnel chart heading row

#### Scenario: Clicking the active stage clears the filter
- **WHEN** the user clicks the currently active stage button or segment
- **THEN** the pipeline board filter SHALL reset to show all stages

#### Scenario: Clear filter badge dismisses the filter
- **WHEN** an active stage filter is set and the user clicks the "Clear … filter" badge
- **THEN** the pipeline board filter SHALL reset to show all stages

#### Scenario: Conversion percentage is shown between stages
- **WHEN** both a stage and its preceding stage have at least one application
- **THEN** the header button SHALL display the conversion percentage from the previous stage

#### Scenario: Funnel chart is wrapped in an accessible region
- **WHEN** the funnel chart is rendered
- **THEN** it SHALL be inside a `region` landmark labelled "Application funnel"
