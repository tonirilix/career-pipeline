## MODIFIED Requirements

### Requirement: Sidebar is always visible on desktop
The system SHALL render global navigation as a persistent labelled rail on viewports 768px and wider, with no mobile navigation trigger visible. The rail SHALL preserve access to each workspace route and the command palette.

Each navigation item SHALL display its workspace name as text, and SHALL display a count of outstanding items for workspaces that can carry one. The rail SHALL mark the active workspace with an accent marker in addition to any text weight change, so the active state does not rely on weight alone.

The rail SHALL NOT collapse to an icon-only presentation. Recognising a destination is the rail's primary job, and unlabelled glyphs defeat it.

#### Scenario: Sidebar is visible on desktop without toggling
- **WHEN** the viewport is 768px or wider
- **THEN** the sidebar navigation landmark SHALL be visible without requiring any user interaction

#### Scenario: Mobile navigation trigger is not rendered on desktop
- **WHEN** the viewport is 768px or wider
- **THEN** no mobile navigation trigger button SHALL be present in the layout

#### Scenario: Navigation items are labelled
- **WHEN** the viewport is 768px or wider
- **THEN** each navigation item SHALL display its workspace name as visible text

#### Scenario: Navigation items carry counts
- **WHEN** a workspace has outstanding items
- **THEN** its navigation item SHALL display the count of those items
- **AND** the count SHALL update when the underlying data changes

#### Scenario: Active workspace is marked with an accent
- **WHEN** a workspace is the active route
- **THEN** its navigation item SHALL carry an accent marker
- **AND** items for other workspaces SHALL NOT carry that marker

#### Scenario: Desktop rail exposes command palette entry
- **WHEN** the viewport is 768px or wider
- **THEN** global navigation SHALL include a control that opens the command palette

---

## REMOVED Requirements

### Requirement: Sidebar is hidden by default on mobile and revealed via a drawer
**Reason**: A trigger-and-drawer pattern hides the destinations and their counts behind an interaction, which is the problem this change exists to solve. On mobile the same four destinations are better served by a persistent bottom tab bar that keeps them and their counts continuously visible.

**Migration**: Replaced by "Global navigation is a persistent bottom tab bar on mobile" below. The navigation trigger button and the drawer overlay are removed from the layout; no route or navigation target changes.

---

### Requirement: Drawer close button meets minimum touch target size
**Reason**: The mobile drawer no longer exists, so it has no close button.

**Migration**: The touch target requirement carries over to the bottom tab bar items, specified below.

---

## ADDED Requirements

### Requirement: Global navigation is a persistent bottom tab bar on mobile
The system SHALL render global navigation as a persistent bottom tab bar on viewports narrower than 768px, with one tab per top-level workspace. The bar SHALL remain visible without user interaction, and SHALL NOT overlay or obscure the bottom of the main content region.

Each tab SHALL display its workspace name and, where applicable, its outstanding count. The active tab SHALL be marked with an accent marker.

#### Scenario: Tab bar is visible on mobile without interaction
- **WHEN** the viewport is narrower than 768px
- **THEN** the global navigation landmark SHALL be visible without requiring any user interaction

#### Scenario: No navigation trigger on mobile
- **WHEN** the viewport is narrower than 768px
- **THEN** no navigation trigger button SHALL be present in the layout
- **AND** no navigation drawer overlay SHALL be rendered

#### Scenario: Tabs are labelled and counted
- **WHEN** the viewport is narrower than 768px
- **THEN** each tab SHALL display its workspace name as visible text
- **AND** a workspace with outstanding items SHALL display its count

#### Scenario: Active tab is marked
- **WHEN** a workspace is the active route on mobile
- **THEN** its tab SHALL carry an accent marker

#### Scenario: Tabs meet touch target size
- **WHEN** the viewport is narrower than 768px
- **THEN** each tab SHALL have a minimum touch target height of 44px

#### Scenario: Content is not obscured by the tab bar
- **WHEN** the user scrolls the main content region to its end on mobile
- **THEN** the final content SHALL be fully visible above the tab bar
