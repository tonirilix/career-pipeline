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

#### Scenario: Token applied to primary button
- **WHEN** a `Button` component with default variant is rendered
- **THEN** its background color SHALL resolve to the `primary` token value

#### Scenario: Token applied to error message
- **WHEN** a validation or command error is displayed
- **THEN** the text color SHALL resolve to the `destructive` token value

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
