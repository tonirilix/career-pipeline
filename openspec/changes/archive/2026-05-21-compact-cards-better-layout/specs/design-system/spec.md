## ADDED Requirements

### Requirement: Application cards use compact information hierarchy
The system SHALL render application cards with a compact hierarchy that prioritizes company, role title, key metadata, and workflow actions without adding nested cards or oversized spacing.

#### Scenario: Card primary content remains visible
- **WHEN** an `ApplicationCard` is rendered
- **THEN** the company name and role title SHALL be visible without requiring the user to open details

#### Scenario: Metadata is grouped compactly
- **WHEN** an `ApplicationCard` has source or location metadata
- **THEN** the metadata SHALL render in a compact grouped area that uses less vertical space than a separate full-width section per field

#### Scenario: Closed state remains identifiable
- **WHEN** an `ApplicationCard` represents a closed application
- **THEN** the card SHALL visibly indicate the closed state without hiding the company name, role title, or details action

### Requirement: Compact card actions preserve accessible names
The system SHALL allow compact visible action labels on application cards while preserving full accessible names for actions whose visible labels omit application-specific context.

#### Scenario: Details action has full accessible context
- **WHEN** an `ApplicationCard` renders a compact details action
- **THEN** the action SHALL have an accessible name that identifies the application whose details will open

#### Scenario: Stage action has full accessible context
- **WHEN** an `ApplicationCard` renders a compact stage-transition action
- **THEN** the action SHALL have an accessible name that identifies the application and target stage

### Requirement: Compact card controls remain usable on mobile
Interactive controls inside application cards SHALL meet mobile touch target expectations while allowing denser desktop presentation.

#### Scenario: Mobile card controls meet touch target size
- **WHEN** the viewport is narrower than 768px
- **THEN** each card button or stage selector SHALL provide a minimum touch target height of 44px

#### Scenario: Desktop card controls may be denser
- **WHEN** the viewport is 768px or wider
- **THEN** card controls MAY use reduced visual height while remaining keyboard-focusable and readable
