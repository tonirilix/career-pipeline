## MODIFIED Requirements

### Requirement: Sidebar is hidden by default on mobile and revealed via a drawer
The system SHALL hide global navigation on viewports narrower than 768px and render a navigation trigger in a top bar that opens global navigation as a full-height drawer overlay.

#### Scenario: Sidebar is not visible on mobile by default
- **WHEN** the viewport is narrower than 768px and the drawer is closed
- **THEN** the sidebar navigation landmark SHALL not be visible

#### Scenario: Navigation trigger is visible on mobile
- **WHEN** the viewport is narrower than 768px
- **THEN** a navigation trigger button SHALL be visible in the top bar with an accessible label

#### Scenario: Tapping the navigation trigger opens the drawer
- **WHEN** the user taps the navigation trigger button on mobile
- **THEN** global navigation SHALL slide in as a full-height overlay

#### Scenario: Tapping the overlay backdrop closes the drawer
- **WHEN** the global navigation drawer is open and the user taps outside it
- **THEN** the drawer SHALL close

### Requirement: Sidebar is always visible on desktop
The system SHALL render global navigation as a persistent sidebar or rail on viewports 768px and wider, with no mobile navigation trigger visible.

#### Scenario: Sidebar is visible on desktop without toggling
- **WHEN** the viewport is 768px or wider
- **THEN** the sidebar navigation landmark SHALL be visible without requiring any user interaction

#### Scenario: Mobile navigation trigger is not rendered on desktop
- **WHEN** the viewport is 768px or wider
- **THEN** no mobile navigation trigger button SHALL be present in the layout

#### Scenario: Desktop sidebar can support icon collapse
- **WHEN** the viewport is 768px or wider
- **THEN** global navigation MAY collapse to an icon rail while preserving access to each workspace route

### Requirement: Drawer close button meets minimum touch target size
The system SHALL render a close button inside the mobile drawer with a minimum touch target size of 44×44px.

#### Scenario: Close button is large enough
- **WHEN** the mobile global navigation drawer is open
- **THEN** the close button SHALL have a minimum height and width of 44px
