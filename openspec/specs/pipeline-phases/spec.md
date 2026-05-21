# Pipeline Phases

## Purpose
Defines how the eight application stages are grouped into three named phases (Active, Interviewing, Closed) on the pipeline board, and specifies the default collapsed behaviour of the Closed phase when empty.

---

## Requirements

### Requirement: Pipeline board groups stage columns into phases
The system SHALL visually group the eight application stages into three named phases: **Active** (Saved, Applied), **Interviewing** (Screening, Technical interview, Onsite), and **Closed** (Offer, Rejected, Withdrawn). On mobile, stage columns within each phase SHALL stack vertically rather than sit side by side.

#### Scenario: Each phase renders a labelled section
- **WHEN** the pipeline board is rendered
- **THEN** three `region` elements SHALL be present labelled "Active phase", "Interviewing phase", and "Closed phase"

#### Scenario: Each phase contains its correct stage columns
- **WHEN** the pipeline board is rendered
- **THEN** the "Active phase" region SHALL contain columns for "Saved" and "Applied"; the "Interviewing phase" SHALL contain "Screening", "Technical interview", and "Onsite"; the "Closed phase" SHALL contain "Offer", "Rejected", and "Withdrawn"

#### Scenario: Stage columns stack on mobile
- **WHEN** the pipeline board is rendered on a viewport narrower than 768px
- **THEN** stage columns within each phase SHALL stack vertically, each occupying full available width

---

### Requirement: Closed phase is collapsed by default when empty
The system SHALL render the Closed phase in a collapsed state by default when all three of its columns (Offer, Rejected, Withdrawn) contain zero applications.

#### Scenario: Closed phase collapses when all closed-stage columns are empty
- **WHEN** the pipeline board is rendered and no applications are in the Offer, Rejected, or Withdrawn stages
- **THEN** the Closed phase columns SHALL not be visible by default

#### Scenario: Closed phase expands when it contains applications
- **WHEN** at least one application is in Offer, Rejected, or Withdrawn
- **THEN** the Closed phase SHALL be expanded and its columns SHALL be visible

#### Scenario: User can manually toggle the Closed phase
- **WHEN** the user clicks the Closed phase header
- **THEN** the phase SHALL toggle between expanded and collapsed regardless of whether it contains applications

---

### Requirement: Phase groups preserve orientation in dense layouts
The system SHALL keep phase labels and stage grouping legible when compact board spacing is applied.

#### Scenario: Phase labels remain visually distinct
- **WHEN** the pipeline board renders compact stage columns
- **THEN** each phase label SHALL remain visually distinct from stage headers and application card content

#### Scenario: Phase spacing separates groups without wasting space
- **WHEN** consecutive phase groups are rendered
- **THEN** spacing between phases SHALL separate the groups without using oversized vertical gaps

---

### Requirement: Closed phase compact state remains understandable
The system SHALL keep the Closed phase collapsed state understandable when compact board spacing is applied.

#### Scenario: Collapsed Closed phase keeps label and toggle
- **WHEN** the Closed phase is collapsed
- **THEN** its label and toggle control SHALL remain visible and keyboard-accessible

#### Scenario: Expanded Closed phase uses same compact column treatment
- **WHEN** the Closed phase is expanded
- **THEN** its stage columns SHALL use the same compact column and card spacing as other visible phases
