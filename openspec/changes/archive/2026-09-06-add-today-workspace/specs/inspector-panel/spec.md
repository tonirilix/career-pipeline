## ADDED Requirements

### Requirement: The inspector displaces main content rather than overlaying it
The system SHALL provide an `InspectorPanel` primitive that renders as a sibling of the main content region and reduces that region's width while open. It SHALL NOT render as an overlay above main content, and it SHALL NOT render a backdrop or scrim.

The main content region SHALL remain readable and interactive while the inspector is open.

#### Scenario: Main content remains visible
- **WHEN** the inspector is open on a viewport 768px or wider
- **THEN** the main content region SHALL remain visible beside it
- **AND** no backdrop element SHALL be rendered over the main content

#### Scenario: Main content narrows rather than overflowing
- **WHEN** the inspector opens
- **THEN** the main content region SHALL reduce in width
- **AND** its content SHALL reflow within the reduced width without introducing horizontal page scrolling

#### Scenario: Main content stays interactive
- **WHEN** the inspector is open
- **THEN** controls in the main content region SHALL remain clickable and focusable

---

### Requirement: The inspector does not trap focus or lock body scroll
The system SHALL NOT confine keyboard focus within the inspector, and SHALL NOT set the document body to a non-scrolling state while the inspector is open.

This distinguishes the inspector from the `SlideOver` primitive, whose modal contract requires both. List keyboard navigation SHALL continue to function while the inspector is open.

#### Scenario: Tab leaves the inspector
- **WHEN** the inspector is open and the user tabs past its last focusable element
- **THEN** focus SHALL move to the next focusable element outside the inspector

#### Scenario: Body scroll is not locked
- **WHEN** the inspector is open
- **THEN** the document body SHALL retain its normal overflow behaviour

#### Scenario: List navigation continues while open
- **WHEN** the inspector is open and the user presses the list navigation keys
- **THEN** the list selection SHALL move
- **AND** the inspector SHALL show the newly selected item

---

### Requirement: The inspector is dismissible without losing list position
The system SHALL close the inspector when the user activates its close control or presses `Escape`. Closing SHALL restore the main content region to full width and SHALL preserve the list's scroll position and current selection.

#### Scenario: Escape closes the inspector
- **WHEN** the inspector is open and the user presses `Escape`
- **THEN** the inspector SHALL close

#### Scenario: Close control closes the inspector
- **WHEN** the user activates the inspector's close control
- **THEN** the inspector SHALL close
- **AND** the control SHALL carry an accessible name

#### Scenario: List position survives closing
- **WHEN** the user scrolls the list, opens an item, and closes the inspector
- **THEN** the list SHALL retain its scroll position

---

### Requirement: The inspector presents a single scrolling column
The system SHALL render inspector content as one continuously scrolling column ordered by what the user is expected to do. It SHALL NOT present its content behind tabs or any other selector that hides sections from view.

#### Scenario: Content is not tabbed
- **WHEN** the inspector is open
- **THEN** its content SHALL NOT be divided into tab panels

#### Scenario: Header identifies the subject
- **WHEN** the inspector is open
- **THEN** it SHALL display the subject's title, its type, and its current stage

#### Scenario: Body scrolls independently
- **WHEN** inspector content exceeds the available height
- **THEN** the inspector body SHALL scroll within its own bounds
- **AND** the inspector header SHALL remain visible

---

### Requirement: The inspector occupies the full viewport on mobile
The system SHALL render the inspector as a full-width overlay on viewports narrower than 768px, since displacing content is not viable at that width. Its close affordance SHALL read as a back action rather than a dismissal.

#### Scenario: Full width on mobile
- **WHEN** the inspector is open and the viewport is narrower than 768px
- **THEN** the inspector SHALL occupy the full width of the viewport

#### Scenario: Close affordance reads as back on mobile
- **WHEN** the inspector is open and the viewport is narrower than 768px
- **THEN** its close control SHALL present a back affordance with an accessible name

#### Scenario: Close control meets touch target size
- **WHEN** the inspector is open and the viewport is narrower than 768px
- **THEN** the close control SHALL have a minimum height and width of 44px

---

### Requirement: The originating row remains identifiable while the inspector is open
The system SHALL mark the list row whose item is currently shown in the inspector, so the user can see where they are in the list without closing the panel.

#### Scenario: Open row is marked
- **WHEN** an item is open in the inspector
- **THEN** its originating row SHALL be visually distinguished from other rows

#### Scenario: Marking follows the selection
- **WHEN** the user moves the list selection while the inspector is open
- **THEN** the marking SHALL move to the newly selected row
