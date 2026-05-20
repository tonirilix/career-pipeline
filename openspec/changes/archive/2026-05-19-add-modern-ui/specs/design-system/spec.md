## ADDED Requirements

### Requirement: Tailwind CSS is configured as the styling foundation
The system SHALL use Tailwind CSS v4 (via `@tailwindcss/vite`) as the sole mechanism for applying visual styles to presentation components. No hand-written CSS class names outside of the Tailwind utility layer SHALL be used for new or migrated components.

#### Scenario: Vite builds successfully with Tailwind plugin
- **WHEN** the developer runs `npm run build` in `apps/web`
- **THEN** the build completes without errors and the output CSS bundle contains Tailwind-generated utility classes

#### Scenario: Dev server applies Tailwind styles
- **WHEN** the developer runs `npm run dev` and opens the app in a browser
- **THEN** Tailwind utility classes in JSX are reflected as CSS styles in the rendered page with no flash of unstyled content

### Requirement: Brand color tokens are defined in the theme
The system SHALL define the following design tokens in the Tailwind configuration so that all components reference tokens rather than raw hex values:
- `primary` — brand green (`#24735f`)
- `primary-foreground` — white (`#ffffff`)
- `muted` — light grey (`#f4f6f8`)
- `muted-foreground` — medium grey (`#5d6673`)
- `destructive` — error red (`#b42318`)
- `border` — subtle border (`#d7dde4`)

#### Scenario: Token applied to primary button
- **WHEN** a `Button` component with default variant is rendered
- **THEN** its background color SHALL resolve to the `primary` token value (`#24735f`)

#### Scenario: Token applied to error message
- **WHEN** a validation or command error is displayed
- **THEN** the text color SHALL resolve to the `destructive` token value (`#b42318`)

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

### Requirement: All existing accessibility landmarks are preserved
The system SHALL preserve every `aria-label` and `role` attribute present in the current `App.tsx` after the component decomposition and styling migration.

#### Scenario: Pipeline board section is still labelled
- **WHEN** the pipeline board is rendered after migration
- **THEN** it SHALL have `aria-label="Application pipeline"` on its root element

#### Scenario: Application details panel is still labelled
- **WHEN** the details panel is open
- **THEN** it SHALL have `aria-label="Application details"` on its root element

### Requirement: Architecture layer boundaries are not violated
The presentation layer components SHALL NOT import from `domain` or `infrastructure` modules directly. All cross-layer communication SHALL go through the existing ports.

#### Scenario: Architecture test passes after migration
- **WHEN** `npm run test` is executed in `apps/web`
- **THEN** `architecture.test.ts` SHALL pass with no boundary violations reported
