# Slide-Over Panel

## Purpose
Defines the behaviour and accessibility contract of the `SlideOver` UI primitive: a right-anchored drawer that overlays the main content, supports multiple close gestures, and traps keyboard focus while open.

---

## Requirements

### Requirement: SlideOver renders content in a right-side drawer
The system SHALL provide a `SlideOver` component that renders its children in a fixed-position panel anchored to the right edge of the viewport, overlaying the main content with a semi-transparent backdrop.

#### Scenario: SlideOver is hidden when closed
- **WHEN** `SlideOver` is rendered with `isOpen={false}`
- **THEN** the panel SHALL be translated off-screen to the right and not visible to the user

#### Scenario: SlideOver is visible when open
- **WHEN** `SlideOver` is rendered with `isOpen={true}`
- **THEN** the panel SHALL slide into view from the right and be visible

#### Scenario: SlideOver has correct ARIA attributes when open
- **WHEN** `SlideOver` is open
- **THEN** its root element SHALL have `role="dialog"` and `aria-modal="true"`

---

### Requirement: SlideOver can be closed by the user
The system SHALL allow users to close the `SlideOver` by clicking the backdrop, pressing the Escape key, or clicking an explicit close button.

#### Scenario: Clicking the backdrop closes the panel
- **WHEN** the user clicks the semi-transparent backdrop behind the open panel
- **THEN** the `onClose` callback SHALL be called

#### Scenario: Pressing Escape closes the panel
- **WHEN** the `SlideOver` is open and the user presses the Escape key
- **THEN** the `onClose` callback SHALL be called

#### Scenario: Clicking the close button closes the panel
- **WHEN** the user clicks the close button inside the panel header
- **THEN** the `onClose` callback SHALL be called

---

### Requirement: SlideOver traps focus while open
The system SHALL confine keyboard focus within the open `SlideOver` panel so that tabbing does not reach content behind the overlay.

#### Scenario: Tab key cycles within the panel
- **WHEN** the `SlideOver` is open and the user presses Tab
- **THEN** focus SHALL move to the next focusable element inside the panel, wrapping at the last element back to the first

#### Scenario: Focus is restored on close
- **WHEN** the `SlideOver` is closed
- **THEN** focus SHALL return to the element that triggered the panel to open
