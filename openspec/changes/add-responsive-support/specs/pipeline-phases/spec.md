## MODIFIED Requirements

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
