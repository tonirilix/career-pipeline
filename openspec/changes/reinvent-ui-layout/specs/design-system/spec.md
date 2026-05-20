## ADDED Requirements

### Requirement: SlideOver is a first-class layout primitive
The system SHALL include a `SlideOver` component in `src/presentation/components/ui/` that is used consistently for all drawer/panel interactions in the application.

#### Scenario: SlideOver is available for use throughout the presentation layer
- **WHEN** any presentation component needs to render content in an overlay panel
- **THEN** it SHALL use the `SlideOver` primitive rather than an ad-hoc fixed-position div

### Requirement: Sidebar is a first-class layout primitive
The system SHALL include a `Sidebar` component that provides the fixed-width left navigation container used in the main application layout.

#### Scenario: Sidebar provides consistent padding and border styling
- **WHEN** the `Sidebar` component is rendered
- **THEN** it SHALL apply the project's border and spacing tokens consistently without ad-hoc overrides
