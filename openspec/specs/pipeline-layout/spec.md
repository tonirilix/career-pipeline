# Pipeline Layout

## Purpose
Defines the application shell layout: global workspace navigation, a scrollable main workspace area, and Pipeline-local controls. Specifies how Pipeline forms and detail panels are surfaced via SlideOver rather than inline expansion.

---

## Requirements

### Requirement: App renders with global navigation and a main workspace area
The system SHALL render an application shell with global workspace navigation and a scrollable main workspace area. On viewports 768px and wider, global navigation SHALL remain available as a persistent sidebar or rail. On viewports narrower than 768px, global navigation SHALL be hidden by default and accessible through a navigation trigger while the main workspace fills the viewport width.

#### Scenario: Global navigation is available on desktop
- **WHEN** the application is rendered on a viewport 768px or wider
- **THEN** a `navigation` landmark SHALL be present containing app identity and workspace navigation items

#### Scenario: Main workspace area fills remaining space on desktop
- **WHEN** the application is rendered on a viewport 768px or wider
- **THEN** the `main` element SHALL occupy all horizontal space not used by global navigation

#### Scenario: Main workspace fills full width on mobile
- **WHEN** the application is rendered on a viewport narrower than 768px
- **THEN** the `main` element SHALL occupy the full viewport width when global navigation is closed

---

### Requirement: Main content area contains the funnel chart above the pipeline board
The system SHALL render a `FunnelChart` region in the Pipeline workspace main content area, positioned above the pipeline board and below the command error notice (if any).

#### Scenario: Pipeline workspace contains the funnel chart
- **WHEN** the application is rendered at `/pipeline`
- **THEN** a `region` labelled "Application funnel" SHALL be present inside the `main` element, above the pipeline board

#### Scenario: Global navigation does not contain the funnel chart
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Application funnel" SHALL NOT be inside the global navigation landmark

---

### Requirement: Global navigation excludes pipeline-only controls
The system SHALL render app identity and route-backed workspace navigation inside global navigation. The system SHALL NOT render pipeline stats, pipeline filters, follow-up work, or Add opportunity inside global navigation.

#### Scenario: Global navigation contains workspace navigation
- **WHEN** the application is rendered
- **THEN** global navigation SHALL include Pipeline, Memory, and Roles navigation items

#### Scenario: Global navigation omits pipeline controls
- **WHEN** the application is rendered at `/memory`
- **THEN** the `region` labelled "Pipeline controls" SHALL NOT be inside the global navigation landmark

#### Scenario: Global navigation omits follow-up work
- **WHEN** the application is rendered at `/roles`
- **THEN** the `region` labelled "Follow-up work" SHALL NOT be inside the global navigation landmark

#### Scenario: Global navigation reflects active route
- **WHEN** the application is rendered at `/roles`
- **THEN** the Roles workspace navigation item SHALL be presented as active
- **AND** the Pipeline and Memory workspace navigation items SHALL NOT be presented as active

#### Scenario: Global navigation changes route
- **WHEN** the user activates the Memory workspace navigation item
- **THEN** the browser location SHALL be `/memory`

---

### Requirement: Pipeline workspace contains compact pipeline controls and secondary follow-up work
The system SHALL render active application count, Pipeline saved views, active view/filter context, and follow-up work inside the Pipeline workspace rather than inside global navigation. Raw Pipeline controls (filter/sort/search) SHALL be hidden behind a View options surface by default. Follow-up work SHALL be presented through the Needs attention view or secondary Pipeline context and SHALL NOT permanently reduce the board width.

#### Scenario: Pipeline workspace contains pipeline controls
- **WHEN** the application is rendered at `/pipeline`
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the Pipeline workspace or available from Pipeline View options
- **AND** raw search, stage, source, and sort controls SHALL NOT render as an always-visible toolbar by default

#### Scenario: Pipeline workspace contains follow-up work
- **WHEN** the application is rendered at `/pipeline`
- **THEN** follow-up work SHALL be reachable inside the Pipeline workspace
- **AND** follow-up work SHALL NOT be rendered as a persistent sidebar column beside the pipeline board

#### Scenario: Pipeline workspace contains application stats
- **WHEN** the application is rendered at `/pipeline`
- **THEN** active application count, overdue follow-up count, and upcoming follow-up count SHALL be presented as compact stats or contextual counters inside the Pipeline workspace

#### Scenario: Active filters render as chips
- **WHEN** the user applies a non-default Pipeline filter or sort
- **THEN** the Pipeline workspace SHALL show compact active filter or sort chips
- **AND** the raw filter controls SHALL remain hidden unless the user opens View options

#### Scenario: View options reveals raw controls
- **WHEN** the user opens Pipeline View options
- **THEN** raw search, stage, source, and sort controls SHALL be available
- **AND** closing View options SHALL return the main Pipeline workspace to the selected saved view

---

### Requirement: Opportunity form opens in a SlideOver panel
The system SHALL trigger the `SlideOver` panel (instead of inline expansion) when the user initiates adding a new opportunity from the Pipeline workspace.

#### Scenario: Clicking "Add opportunity" opens the slide-over
- **WHEN** the user opens `/pipeline`
- **AND** the user clicks the "Add opportunity" button
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
