## ADDED Requirements

### Requirement: Pipeline board groups stage columns into phases
The system SHALL visually group the eight application stages into three named phases: **Active** (Saved, Applied), **Interviewing** (Screening, Technical interview, Onsite), and **Closed** (Offer, Rejected, Withdrawn).

#### Scenario: Each phase renders a labelled section
- **WHEN** the pipeline board is rendered
- **THEN** three `region` elements SHALL be present labelled "Active phase", "Interviewing phase", and "Closed phase"

#### Scenario: Each phase contains its correct stage columns
- **WHEN** the pipeline board is rendered
- **THEN** the "Active phase" region SHALL contain columns for "Saved" and "Applied"; the "Interviewing phase" SHALL contain "Screening", "Technical interview", and "Onsite"; the "Closed phase" SHALL contain "Offer", "Rejected", and "Withdrawn"

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
