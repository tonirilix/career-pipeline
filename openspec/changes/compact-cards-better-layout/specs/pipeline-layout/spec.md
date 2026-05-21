## ADDED Requirements

### Requirement: Pipeline board supports dense card scanning
The system SHALL lay out pipeline columns and application cards so users can scan multiple opportunities per stage without excessive whitespace in the main content area.

#### Scenario: Column card list uses compact spacing
- **WHEN** a stage column contains multiple applications
- **THEN** the vertical spacing between application cards SHALL be compact and consistent

#### Scenario: Stage column chrome is space-efficient
- **WHEN** a stage column is rendered
- **THEN** the column header, count, content padding, and empty state SHALL avoid oversized spacing that reduces visible card capacity

#### Scenario: Board remains within the main content area
- **WHEN** the pipeline board is rendered inside the main content area
- **THEN** compact spacing SHALL NOT cause content to overlap the sidebar, command error area, or slide-over panels

### Requirement: Empty stage columns remain compact but discoverable
The system SHALL render empty stage columns with a compact empty state that preserves the column's identity and count.

#### Scenario: Empty column keeps stage label and count
- **WHEN** a stage column has zero applications
- **THEN** the stage label and zero count SHALL remain visible

#### Scenario: Empty state does not dominate the column
- **WHEN** a stage column has zero applications
- **THEN** the empty-state content SHALL consume less vertical space than an application card list with one card
