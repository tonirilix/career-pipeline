# Workspace Secondary Navigation

## Purpose
Defines a route-local secondary navigation panel, adjacent to the global rail and separate from main workspace content, that is collapsible and adapts on mobile without permanently constraining other workspaces.

---

## Requirements

### Requirement: Workspaces can render route-local secondary navigation
The system SHALL support a route-local secondary navigation panel adjacent to the global rail and separate from the main workspace content.

#### Scenario: Secondary navigation is route-local
- **WHEN** the user opens a workspace with secondary navigation
- **THEN** the secondary navigation panel SHALL present controls and views for that workspace only

#### Scenario: Secondary navigation does not replace global navigation
- **WHEN** secondary navigation is rendered
- **THEN** global workspace navigation SHALL remain available through the global rail or mobile drawer

### Requirement: Secondary navigation is collapsible
The system SHALL allow users to collapse and expand the route-local secondary navigation panel.

#### Scenario: Collapse secondary navigation
- **WHEN** the secondary navigation panel is open
- **AND** the user activates the collapse control
- **THEN** the secondary navigation panel SHALL collapse
- **AND** the main workspace content SHALL gain the released horizontal space

#### Scenario: Expand secondary navigation
- **WHEN** the secondary navigation panel is collapsed
- **AND** the user activates the expand control
- **THEN** the secondary navigation panel SHALL expand
- **AND** its route-local controls SHALL be visible again

### Requirement: Secondary navigation adapts on mobile
The system SHALL not render route-local secondary navigation as a permanent side-by-side column on mobile.

#### Scenario: Secondary navigation is not permanent on mobile
- **WHEN** the viewport is narrower than 768px
- **THEN** route-local secondary navigation SHALL be hidden by default or presented as an overlay/drawer
- **AND** the main workspace SHALL retain full mobile width when the panel is closed

### Requirement: Secondary navigation preserves unrelated workspace space
The system SHALL prevent one workspace's secondary navigation from permanently reducing another workspace's content width.

#### Scenario: Memory is not constrained by Pipeline views
- **WHEN** the user opens `/memory`
- **THEN** Pipeline saved views SHALL NOT occupy a persistent panel beside Memory content

#### Scenario: Roles is not constrained by Pipeline views
- **WHEN** the user opens `/roles`
- **THEN** Pipeline saved views SHALL NOT occupy a persistent panel beside Roles content
