# Responsive Sidebar

## Purpose
Defines the responsive behaviour of the application sidebar: hidden by default on mobile and revealed via a hamburger-triggered drawer overlay, while remaining a persistent fixed-width element on desktop.

---

## Requirements

### Requirement: Sidebar is hidden by default on mobile and revealed via a drawer
The system SHALL hide the sidebar on viewports narrower than 768px and render a hamburger toggle button in a top bar that opens the sidebar as a full-height drawer overlay.

#### Scenario: Sidebar is not visible on mobile by default
- **WHEN** the viewport is narrower than 768px and the drawer is closed
- **THEN** the sidebar navigation landmark SHALL not be visible

#### Scenario: Hamburger button is visible on mobile
- **WHEN** the viewport is narrower than 768px
- **THEN** a toggle button SHALL be visible in the top bar with an accessible label

#### Scenario: Tapping the hamburger opens the drawer
- **WHEN** the user taps the hamburger button on mobile
- **THEN** the sidebar SHALL slide in as a full-height overlay

#### Scenario: Tapping the overlay backdrop closes the drawer
- **WHEN** the sidebar drawer is open and the user taps outside it
- **THEN** the drawer SHALL close

---

### Requirement: Sidebar is always visible on desktop
The system SHALL render the sidebar as a persistent fixed-width element on viewports 768px and wider, with no hamburger toggle visible.

#### Scenario: Sidebar is visible on desktop without toggling
- **WHEN** the viewport is 768px or wider
- **THEN** the sidebar navigation landmark SHALL be visible without requiring any user interaction

#### Scenario: Hamburger button is not rendered on desktop
- **WHEN** the viewport is 768px or wider
- **THEN** no hamburger toggle button SHALL be present in the layout

---

### Requirement: Drawer close button meets minimum touch target size
The system SHALL render a close button inside the mobile drawer with a minimum touch target size of 44×44px.

#### Scenario: Close button is large enough
- **WHEN** the mobile sidebar drawer is open
- **THEN** the close button SHALL have a minimum height and width of 44px
