## ADDED Requirements

### Requirement: Sidebar displays a funnel chart of applications per stage
The system SHALL render a `FunnelChart` component inside the sidebar that shows the count of applications in each of the eight pipeline stages. Bar widths SHALL be proportional to the stage with the highest count (relative scale), and each bar SHALL have a minimum visible width so stages with zero or very low counts remain distinguishable.

#### Scenario: All eight stages are labelled
- **WHEN** the sidebar is rendered
- **THEN** the funnel chart SHALL display a labelled row for each of the eight stages: Saved, Applied, Screening, Technical interview, Onsite, Offer, Rejected, Withdrawn

#### Scenario: Bar width reflects relative stage count
- **WHEN** one stage has more applications than all others
- **THEN** that stage's bar SHALL render at full width and all other bars SHALL render proportionally narrower

#### Scenario: Stage count is shown alongside the bar
- **WHEN** a stage has applications
- **THEN** the application count SHALL be visible adjacent to the bar for that stage

#### Scenario: Zero-count stage remains visible
- **WHEN** a stage has zero applications
- **THEN** its row SHALL still be rendered with a label, a zero count, and a minimal bar indicator

#### Scenario: Funnel updates when an application changes stage
- **WHEN** the user moves an application to a different stage on the pipeline board
- **THEN** the funnel chart counts SHALL update immediately to reflect the new stage distribution without a page reload
