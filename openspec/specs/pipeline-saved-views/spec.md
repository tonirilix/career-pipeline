# Pipeline Saved Views

## Purpose
Defines workflow-oriented saved views for the Pipeline workspace (Needs attention, Active, Interviewing, Offers, Closed, All) that determine which applications are visible and how the active view is presented.

---

## Requirements

### Requirement: Pipeline provides workflow-oriented saved views
The system SHALL provide Pipeline saved views for Needs attention, Active, Interviewing, Offers, Closed, and All.

#### Scenario: Saved views are available in Pipeline context
- **WHEN** the user opens `/pipeline`
- **THEN** the Pipeline secondary navigation SHALL include saved view controls for Needs attention, Active, Interviewing, Offers, Closed, and All

#### Scenario: Saved views are absent from unrelated workspaces
- **WHEN** the user opens `/memory`
- **THEN** Pipeline saved view controls SHALL NOT be presented as Memory workspace controls

### Requirement: Pipeline saved views determine visible applications
The system SHALL update visible Pipeline applications when a saved view is selected.

#### Scenario: Needs attention view shows actionable applications
- **WHEN** the user selects the Needs attention saved view
- **THEN** applications with overdue follow-ups or upcoming follow-ups SHALL be prioritized or shown according to the Needs attention view definition

#### Scenario: Active view shows active pipeline work
- **WHEN** the user selects the Active saved view
- **THEN** active non-closed applications SHALL be shown

#### Scenario: Interviewing view shows interview-stage work
- **WHEN** the user selects the Interviewing saved view
- **THEN** applications in interview-related stages SHALL be shown

#### Scenario: Offers view shows offer-stage work
- **WHEN** the user selects the Offers saved view
- **THEN** applications in the Offer stage SHALL be shown

#### Scenario: Closed view shows closed applications
- **WHEN** the user selects the Closed saved view
- **THEN** rejected and withdrawn applications SHALL be shown

#### Scenario: All view shows every application
- **WHEN** the user selects the All saved view
- **THEN** all applications SHALL be shown subject only to explicit raw filters

### Requirement: Pipeline saved view active state is visible
The system SHALL present the active saved view clearly in the Pipeline workspace.

#### Scenario: Active view is marked
- **WHEN** the user selects a Pipeline saved view
- **THEN** that saved view SHALL be presented as active
- **AND** other saved views SHALL NOT be presented as active

#### Scenario: Main workspace reflects selected view
- **WHEN** a Pipeline saved view is active
- **THEN** the Pipeline workspace SHALL present the selected view name in the workspace context
