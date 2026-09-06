## MODIFIED Requirements

### Requirement: Brand color tokens are defined in the theme
The system SHALL define design tokens in the Tailwind `@theme` block in `index.css` so that all components reference tokens rather than raw hex values. Tokens with a `--color-*` prefix are automatically available as Tailwind utility classes (e.g. `text-foreground`, `bg-card`, `border-border`).

Tokens SHALL be organised as ordered scales rather than as a flat list of one value per role. Specifically, the theme SHALL expose a border scale, a text scale, and a surface scale, each with distinct steps that components select from by structural meaning. Components SHALL NOT introduce raw hex values to reach a tone that sits between two steps; a missing step is a change to this spec.

#### Scenario: Token applied to primary button
- **WHEN** a `Button` component with default variant is rendered
- **THEN** its background color SHALL resolve to the `primary` token value

#### Scenario: Token applied to error message
- **WHEN** a validation or command error is displayed
- **THEN** the text color SHALL resolve to the `destructive` token value

#### Scenario: Components reference scale steps rather than raw values
- **WHEN** a presentation component needs a border, text tone, or surface
- **THEN** it SHALL reference a named step from the corresponding scale
- **AND** it SHALL NOT apply a raw hex value for that property

---

## ADDED Requirements

### Requirement: Body typography is sans-serif and monospace is a restricted label role
The system SHALL set a sans-serif stack as the document body font. Monospace SHALL be applied only as an explicit label role, reserved for short uppercase metadata: status and type chips, stage names, counts, due dates, group headers, and keyboard hints.

Monospace SHALL NOT be inherited by default. Prose, headings, form controls, and button labels SHALL render in the sans stack.

#### Scenario: Body text renders in the sans stack
- **WHEN** any workspace is rendered
- **THEN** the computed `font-family` on `body` SHALL resolve to the sans stack
- **AND** it SHALL NOT resolve to a monospace stack

#### Scenario: Metadata labels render in the monospace label role
- **WHEN** a component renders a status chip, stage name, count, or due date
- **THEN** that element SHALL carry the monospace label role
- **AND** its sibling prose content SHALL remain in the sans stack

#### Scenario: Headings and controls do not inherit monospace
- **WHEN** a workspace heading, button label, or form control is rendered
- **THEN** its computed `font-family` SHALL resolve to the sans stack

---

### Requirement: Borders are expressed as a three-step scale
The system SHALL define three border tokens with distinct structural meanings: a strong step for chips, outer frames, and emphasised containers; a structural step for panel and section dividers; and a subtle step for repeated row rules within a list.

#### Scenario: Row rules use the subtle step
- **WHEN** a list renders repeated rows separated by rules
- **THEN** those rules SHALL use the subtle border step

#### Scenario: Panel dividers use the structural step
- **WHEN** a panel header is separated from its body
- **THEN** that divider SHALL use the structural border step

#### Scenario: Chips and outer frames use the strong step
- **WHEN** a bordered chip or an outermost container frame is rendered
- **THEN** its border SHALL use the strong border step

---

### Requirement: Text tones are expressed as a three-step scale
The system SHALL define three foreground tokens: ink for primary content, secondary for supporting content that must remain comfortably readable, and muted for de-emphasised metadata.

The muted step SHALL remain legible against the shell surface. A two-step scale is insufficient, because supporting content and de-emphasised metadata are distinct roles that currently collapse onto one token.

#### Scenario: Supporting content uses the secondary step
- **WHEN** a component renders a description, summary line, or supporting sentence beneath a primary label
- **THEN** that text SHALL use the secondary foreground step
- **AND** it SHALL NOT use the muted step

#### Scenario: De-emphasised metadata uses the muted step
- **WHEN** a component renders counts, timestamps, or hint text
- **THEN** that text SHALL use the muted foreground step

#### Scenario: Muted text remains legible
- **WHEN** muted text is rendered on the shell surface
- **THEN** its contrast ratio SHALL be at least 4.5:1

---

### Requirement: Surfaces are expressed as an ordered elevation scale
The system SHALL define surface tokens as an ordered scale: page, shell, raised panel, and selected row. Elevation SHALL be conveyed by surface step and border, not by shadow or radius.

#### Scenario: Raised panels sit above the shell
- **WHEN** a panel is rendered adjacent to main content
- **THEN** its background SHALL use the raised-panel step
- **AND** that step SHALL be visually distinguishable from the shell step

#### Scenario: Selected rows use the selected step
- **WHEN** a row in a list is the current selection
- **THEN** its background SHALL use the selected-row step

---

### Requirement: Corners are square
The system SHALL set the shared radius token to `0` so that containers, controls, chips, and panels render with square corners.

#### Scenario: Controls render square
- **WHEN** a `Button`, `Input`, `Select`, or `Textarea` is rendered
- **THEN** its computed `border-radius` SHALL be `0`

#### Scenario: Containers render square
- **WHEN** a card, panel, or chip is rendered
- **THEN** its computed `border-radius` SHALL be `0`

---

### Requirement: Accent color is reserved for defined signals
The system SHALL restrict the accent token to a defined set of signals: the focus ring, the active-navigation marker, the selected-row marker, overdue or past-due emphasis, and status framing such as toasts. The accent SHALL NOT be used as a general-purpose highlight, as a decorative border, or to emphasise ordinary content.

#### Scenario: Focus ring uses the accent
- **WHEN** an interactive element receives keyboard focus
- **THEN** its focus indicator SHALL use the accent token

#### Scenario: Overdue emphasis uses the accent
- **WHEN** a due date is in the past
- **THEN** that due date SHALL use the accent token
- **AND** a due date that is not past SHALL NOT use the accent token

#### Scenario: Ordinary content does not use the accent
- **WHEN** a component renders a heading, body text, or a non-selected control
- **THEN** it SHALL NOT use the accent token
