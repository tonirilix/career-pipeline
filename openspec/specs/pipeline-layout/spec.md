# Pipeline Layout

## Purpose
Defines the two-column application shell layout: a fixed-width left sidebar containing navigation and pipeline controls, and a scrollable main content area. Specifies how forms and detail panels are surfaced via SlideOver rather than inline expansion.

---

## Requirements

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

---

### Requirement: Sidebar contains navigation and filtering controls
The system SHALL render the app title, active application count, pipeline controls (filter/sort/search), and follow-up work panels inside the sidebar.

#### Scenario: Sidebar contains pipeline controls
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the sidebar navigation landmark

#### Scenario: Sidebar contains follow-up work
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Follow-up work" SHALL be inside the sidebar navigation landmark

---

### Requirement: Opportunity form opens in a SlideOver panel
The system SHALL trigger the `SlideOver` panel (instead of inline expansion) when the user initiates adding a new opportunity.

#### Scenario: Clicking "Add opportunity" opens the slide-over
- **WHEN** the user clicks the "Add opportunity" button
- **THEN** a `SlideOver` SHALL open containing the `OpportunityForm`

#### Scenario: Submitting the form closes the slide-over
- **WHEN** the user successfully submits the `OpportunityForm`
- **THEN** the `SlideOver` SHALL close and the new application SHALL appear in the pipeline board

#### Scenario: Cancelling the form closes the slide-over
- **WHEN** the user clicks "Cancel" in the `OpportunityForm`
- **THEN** the `SlideOver` SHALL close without adding an application

---

### Requirement: Application details open in a SlideOver panel
The system SHALL open the `ApplicationDetails` component inside a `SlideOver` panel when the user views an application's details.

#### Scenario: Clicking "View details" opens the slide-over
- **WHEN** the user clicks the view-details button on an `ApplicationCard`
- **THEN** a `SlideOver` SHALL open containing the `ApplicationDetails` for that application

#### Scenario: Closing the details slide-over returns focus to the card
- **WHEN** the user closes the application details `SlideOver`
- **THEN** the `SlideOver` SHALL close and focus SHALL return to the card's view-details button

---

### Requirement: Slide-over workflow errors render inside the active panel
The system SHALL render errors produced by slide-over workflows inside the active `SlideOver` panel that contains the failed workflow.

#### Scenario: Opportunity form error stays inside add-opportunity panel
- **WHEN** saving an opportunity from the add-opportunity `SlideOver` fails
- **THEN** the visible error SHALL be rendered inside that `SlideOver`

#### Scenario: Application details error stays inside details panel
- **WHEN** a note, follow-up, or interview command from the application details `SlideOver` fails
- **THEN** the visible error SHALL be rendered inside that `SlideOver`

#### Scenario: Main board does not receive details workflow errors
- **WHEN** a command from the application details `SlideOver` fails
- **THEN** the main board alert region SHALL NOT be the only visible location for that error

---

### Requirement: Pipeline board supports dense card scanning
The system SHALL lay out pipeline columns and application cards so users can scan multiple opportunities per stage without excessive whitespace in the main content area.

#### Scenario: Column card list uses compact spacing
- **WHEN** a stage column contains multiple applications
- **THEN** the vertical spacing between application cards SHALL be compact and consistent

#### Scenario: Stage column chrome is space-efficient
- **WHEN** a stage column is rendered
- **THEN** the column header, count, content padding, and empty state SHALL avoid oversized spacing that reduces visible card capacity

#### Scenario: Board remains within the main content area
- **WHEN** the pipeline board is rendered inside the main content area
- **THEN** compact spacing SHALL NOT cause content to overlap the sidebar, command error area, or slide-over panels

---

### Requirement: Empty stage columns remain compact but discoverable
The system SHALL render empty stage columns with a compact empty state that preserves the column's identity and count.

#### Scenario: Empty column keeps stage label and count
- **WHEN** a stage column has zero applications
- **THEN** the stage label and zero count SHALL remain visible

#### Scenario: Empty state does not dominate the column
- **WHEN** a stage column has zero applications
- **THEN** the empty-state content SHALL consume less vertical space than an application card list with one card
