## MODIFIED Requirements

### Requirement: App renders with a persistent left sidebar and a main content area
The system SHALL render a two-column layout with a fixed-width left sidebar (220px) and a scrollable main content area on viewports 768px and wider. On viewports narrower than 768px, the sidebar SHALL be hidden by default and the main content SHALL fill the full viewport width.

#### Scenario: Sidebar is always visible on desktop
- **WHEN** the application is rendered on a viewport 768px or wider
- **THEN** a `navigation` landmark SHALL be present containing the app title, stats bar, pipeline controls, and follow-up panels

#### Scenario: Main content area fills remaining space on desktop
- **WHEN** the application is rendered on a viewport 768px or wider
- **THEN** the `main` element SHALL occupy all horizontal space to the right of the sidebar

#### Scenario: Main content fills full width on mobile
- **WHEN** the application is rendered on a viewport narrower than 768px
- **THEN** the `main` element SHALL occupy the full viewport width with no sidebar beside it
