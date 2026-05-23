## MODIFIED Requirements

### Requirement: SlideOver renders content in a right-side drawer
The system SHALL provide a `SlideOver` component that renders its children in a fixed-position panel anchored to the right edge of the viewport, overlaying the main content with a semi-transparent backdrop when open.

#### Scenario: SlideOver is hidden when closed
- **WHEN** `SlideOver` is rendered with `isOpen={false}`
- **THEN** the panel SHALL not be visible to the user
- **AND** focusable panel descendants SHALL NOT be reachable by keyboard navigation or exposed inside an `aria-hidden` subtree

#### Scenario: SlideOver is visible when open
- **WHEN** `SlideOver` is rendered with `isOpen={true}`
- **THEN** the panel SHALL slide into view from the right and be visible

#### Scenario: SlideOver has correct ARIA attributes when open
- **WHEN** `SlideOver` is open
- **THEN** its root element SHALL have `role="dialog"` and `aria-modal="true"`
