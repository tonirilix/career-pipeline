## ADDED Requirements

### Requirement: Phase groups preserve orientation in dense layouts
The system SHALL keep phase labels and stage grouping legible when compact board spacing is applied.

#### Scenario: Phase labels remain visually distinct
- **WHEN** the pipeline board renders compact stage columns
- **THEN** each phase label SHALL remain visually distinct from stage headers and application card content

#### Scenario: Phase spacing separates groups without wasting space
- **WHEN** consecutive phase groups are rendered
- **THEN** spacing between phases SHALL separate the groups without using oversized vertical gaps

### Requirement: Closed phase compact state remains understandable
The system SHALL keep the Closed phase collapsed state understandable when compact board spacing is applied.

#### Scenario: Collapsed Closed phase keeps label and toggle
- **WHEN** the Closed phase is collapsed
- **THEN** its label and toggle control SHALL remain visible and keyboard-accessible

#### Scenario: Expanded Closed phase uses same compact column treatment
- **WHEN** the Closed phase is expanded
- **THEN** its stage columns SHALL use the same compact column and card spacing as other visible phases
