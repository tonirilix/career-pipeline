# Design System

## Purpose
Defines how the presentation layer is styled and structured. Establishes Tailwind CSS v4 as the styling foundation, design tokens for brand colors, shadcn/ui primitives as the component base, and the decomposition of `App.tsx` into focused presentational components.

---

## Requirements

### Requirement: Tailwind CSS is configured as the styling foundation
The system SHALL use Tailwind CSS v4 (via `@tailwindcss/vite`) as the sole mechanism for applying visual styles to presentation components. No hand-written CSS class names outside of the Tailwind utility layer SHALL be used for new or migrated components.

#### Scenario: Vite builds successfully with Tailwind plugin
- **WHEN** the developer runs `npm run build` in `apps/web`
- **THEN** the build completes without errors and the output CSS bundle contains Tailwind-generated utility classes

#### Scenario: Dev server applies Tailwind styles
- **WHEN** the developer runs `npm run dev` and opens the app in a browser
- **THEN** Tailwind utility classes in JSX are reflected as CSS styles in the rendered page with no flash of unstyled content

---

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

---

### Requirement: shadcn/ui primitive components replace raw HTML form elements
The system SHALL use shadcn/ui `Button`, `Input`, `Select`, and `Textarea` components in place of bare `<button>`, `<input>`, `<select>`, and `<textarea>` elements throughout the presentation layer.

#### Scenario: Button renders with correct accessible role
- **WHEN** a shadcn/ui `Button` component is rendered
- **THEN** it SHALL have `role="button"` and be focusable via keyboard tab order

#### Scenario: Input accepts user text and fires onChange
- **WHEN** a user types into a shadcn/ui `Input`
- **THEN** the `onChange` handler SHALL be called with the updated value and the input SHALL reflect the typed text

#### Scenario: Select renders all options and fires onChange
- **WHEN** a shadcn/ui `Select` is rendered with a list of options
- **THEN** all options SHALL be accessible and selecting one SHALL trigger the `onChange` callback with the selected value

---

### Requirement: App.tsx is decomposed into focused presentational components
The system SHALL extract six named presentational components from `App.tsx` into `src/presentation/components/`:
`OpportunityForm`, `PipelineControls`, `FollowUpWork`, `PipelineBoard`, `ApplicationCard`, `ApplicationDetails`.

Each component SHALL receive its data and callbacks via props. No new global state stores SHALL be introduced.

#### Scenario: PipelineBoard renders one column per application stage
- **WHEN** `PipelineBoard` is rendered with a list of applications
- **THEN** it SHALL render one stage column for each value in `applicationStages` with the correct aria-label

#### Scenario: ApplicationCard shows company name and role title
- **WHEN** `ApplicationCard` is rendered with a `JobApplication`
- **THEN** it SHALL display the application's `company` and `roleTitle`

#### Scenario: ApplicationDetails renders all sub-sections
- **WHEN** `ApplicationDetails` is rendered with a `JobApplication`
- **THEN** it SHALL render sections labelled "Notes", "Follow-ups", "Interviews", and "Timeline"

#### Scenario: OpportunityForm calls onSubmit with form data
- **WHEN** a user fills all required fields and submits the `OpportunityForm`
- **THEN** the `onSubmit` callback SHALL be called with a valid `CreateSavedJobOpportunityCommand`

---

### Requirement: All existing accessibility landmarks are preserved
The system SHALL preserve every `aria-label` and `role` attribute present in the current `App.tsx` after the component decomposition and styling migration.

#### Scenario: Pipeline board section is still labelled
- **WHEN** the pipeline board is rendered after migration
- **THEN** it SHALL have `aria-label="Application pipeline"` on its root element

#### Scenario: Application details panel is still labelled
- **WHEN** the details panel is open
- **THEN** it SHALL have `aria-label="Application details"` on its root element

---

### Requirement: SlideOver is a first-class layout primitive
The system SHALL include a `SlideOver` component in `src/presentation/components/ui/` that is used consistently for all drawer/panel interactions in the application.

#### Scenario: SlideOver is available for use throughout the presentation layer
- **WHEN** any presentation component needs to render content in an overlay panel
- **THEN** it SHALL use the `SlideOver` primitive rather than an ad-hoc fixed-position div

---

### Requirement: Sidebar is a first-class layout primitive
The system SHALL include a `Sidebar` component that provides the fixed-width left navigation container used in the main application layout.

#### Scenario: Sidebar provides consistent padding and border styling
- **WHEN** the `Sidebar` component is rendered
- **THEN** it SHALL apply the project's border and spacing tokens consistently without ad-hoc overrides

---

### Requirement: Error alerts use the destructive visual token
The system SHALL style user-facing validation, load, and command error messages with the `destructive` design token and a visible bordered alert treatment.

#### Scenario: Command error uses destructive token
- **WHEN** a command error is displayed in the main content area or a slide-over
- **THEN** the error text SHALL use the `destructive` token

#### Scenario: Validation error list uses destructive token
- **WHEN** validation errors are displayed in a form
- **THEN** the validation message text SHALL use the `destructive` token

---

### Requirement: Error messages expose alert semantics
The system SHALL expose user-facing command and validation error containers with alert semantics so assistive technologies announce failures.

#### Scenario: Command error has alert role
- **WHEN** a command error is displayed
- **THEN** the error container SHALL have `role="alert"`

#### Scenario: Validation error list has alert role
- **WHEN** validation errors are displayed
- **THEN** the validation error container SHALL have `role="alert"`

---

### Requirement: Architecture layer boundaries are not violated
The presentation layer components SHALL NOT import from `domain` or `infrastructure` modules directly. All cross-layer communication SHALL go through the existing ports.

#### Scenario: Architecture test passes after migration
- **WHEN** `npm run test` is executed in `apps/web`
- **THEN** `architecture.test.ts` SHALL pass with no boundary violations reported

---

### Requirement: Application cards use compact information hierarchy
The system SHALL render application cards with a compact hierarchy that prioritizes company, role title, key metadata, and workflow actions without adding nested cards or oversized spacing.

#### Scenario: Card primary content remains visible
- **WHEN** an `ApplicationCard` is rendered
- **THEN** the company name and role title SHALL be visible without requiring the user to open details

#### Scenario: Metadata is grouped compactly
- **WHEN** an `ApplicationCard` has source or location metadata
- **THEN** the metadata SHALL render in a compact grouped area that uses less vertical space than a separate full-width section per field

#### Scenario: Closed state remains identifiable
- **WHEN** an `ApplicationCard` represents a closed application
- **THEN** the card SHALL visibly indicate the closed state without hiding the company name, role title, or details action

---

### Requirement: Compact card actions preserve accessible names
The system SHALL allow compact visible action labels on application cards while preserving full accessible names for actions whose visible labels omit application-specific context.

#### Scenario: Details action has full accessible context
- **WHEN** an `ApplicationCard` renders a compact details action
- **THEN** the action SHALL have an accessible name that identifies the application whose details will open

#### Scenario: Stage action has full accessible context
- **WHEN** an `ApplicationCard` renders a compact stage-transition action
- **THEN** the action SHALL have an accessible name that identifies the application and target stage

---

### Requirement: Compact card controls remain usable on mobile
Interactive controls inside application cards SHALL meet mobile touch target expectations while allowing denser desktop presentation.

#### Scenario: Mobile card controls meet touch target size
- **WHEN** the viewport is narrower than 768px
- **THEN** each card button or stage selector SHALL provide a minimum touch target height of 44px

#### Scenario: Desktop card controls may be denser
- **WHEN** the viewport is 768px or wider
- **THEN** card controls MAY use reduced visual height while remaining keyboard-focusable and readable
