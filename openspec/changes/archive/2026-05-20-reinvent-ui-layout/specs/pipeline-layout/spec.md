## ADDED Requirements

### Requirement: App renders with a persistent left sidebar and a main content area
The system SHALL render a two-column layout with a fixed-width left sidebar (220px) and a scrollable main content area that fills the remaining viewport width.

#### Scenario: Sidebar is always visible
- **WHEN** the application is rendered
- **THEN** a `navigation` landmark SHALL be present containing the app title, stats bar, pipeline controls, and follow-up panels

#### Scenario: Main content area fills remaining space
- **WHEN** the application is rendered
- **THEN** the `main` element SHALL occupy all horizontal space to the right of the sidebar

### Requirement: Sidebar contains navigation and filtering controls
The system SHALL render the app title, active application count, pipeline controls (filter/sort/search), and follow-up work panels inside the sidebar.

#### Scenario: Sidebar contains pipeline controls
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Pipeline controls" SHALL be inside the sidebar navigation landmark

#### Scenario: Sidebar contains follow-up work
- **WHEN** the application is rendered
- **THEN** the `region` labelled "Follow-up work" SHALL be inside the sidebar navigation landmark

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

### Requirement: Application details open in a SlideOver panel
The system SHALL open the `ApplicationDetails` component inside a `SlideOver` panel when the user views an application's details.

#### Scenario: Clicking "View details" opens the slide-over
- **WHEN** the user clicks the view-details button on an `ApplicationCard`
- **THEN** a `SlideOver` SHALL open containing the `ApplicationDetails` for that application

#### Scenario: Closing the details slide-over returns focus to the card
- **WHEN** the user closes the application details `SlideOver`
- **THEN** the `SlideOver` SHALL close and focus SHALL return to the card's view-details button
