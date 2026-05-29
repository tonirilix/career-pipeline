# application-details-workspace-decomposition Specification

## Purpose
TBD - created by archiving change deepen-application-details-workspace. Update Purpose after archive.
## Requirements
### Requirement: ApplicationDetails remains the public details workspace entry point
The frontend SHALL keep `ApplicationDetails` as the presentation module imported by the application shell while moving details workspace implementation into focused internal modules.

#### Scenario: App still renders details through ApplicationDetails
- **WHEN** `App` opens the application details slide-over
- **THEN** it SHALL render the public `ApplicationDetails` entry point rather than composing individual detail sections directly

#### Scenario: Public props remain stable
- **WHEN** the details workspace implementation is decomposed
- **THEN** existing callers SHALL continue to pass application data, command errors, command statuses, and command callbacks through the current `ApplicationDetails` interface

### Requirement: Details sections are focused modules
The details workspace SHALL place overview, notes, follow-ups, interviews, and timeline rendering in focused modules rather than one monolithic component implementation.

#### Scenario: Overview section is isolated
- **WHEN** the overview content changes
- **THEN** maintainers SHALL be able to edit the overview section module without touching notes, follow-up, interview, or timeline rendering

#### Scenario: Timeline section is isolated
- **WHEN** timeline display changes
- **THEN** maintainers SHALL be able to edit the timeline section module without touching writable detail workflows

#### Scenario: Writable sections are isolated
- **WHEN** note, follow-up, or interview workflow rendering changes
- **THEN** maintainers SHALL be able to edit the corresponding section module without editing unrelated writable sections

### Requirement: Details workflow state is local to each workflow
The details workspace SHALL keep note, follow-up, interview scheduling, and interview outcome form state close to the workflow that owns it while preserving existing command semantics.

#### Scenario: Note workflow owns note draft state
- **WHEN** the user adds or retries an application note
- **THEN** note draft state SHALL be managed by the notes workflow module and preserved after command failure

#### Scenario: Follow-up workflow owns follow-up draft state
- **WHEN** the user creates or retries a follow-up reminder
- **THEN** due date, due time, and note state SHALL be managed by the follow-up workflow module and preserved after command failure

#### Scenario: Interview workflow owns interview draft state
- **WHEN** the user schedules an interview or records an interview outcome
- **THEN** interview form state SHALL be managed by the interview workflow module and preserved after command failure

### Requirement: Details-local primitives are shared only inside the details workspace
Repeated details workspace UI and formatting helpers SHALL be extracted into details-local modules rather than duplicated in every section or promoted to global UI primitives.

#### Scenario: Shared details controls are reused locally
- **WHEN** multiple details sections need the same section header, form actions, error notice, date/time fields, or date formatting behavior
- **THEN** they SHALL import details-local helpers from the details workspace module folder

#### Scenario: Global UI library remains unchanged
- **WHEN** extracting details-specific helpers
- **THEN** the implementation SHALL NOT add new global `components/ui` primitives unless another non-details caller needs them

### Requirement: Decomposition preserves current details behavior
The details workspace decomposition SHALL preserve current user-facing behavior, accessibility labels, command error placement, form input preservation, and command pending-state handling.

#### Scenario: Section navigation behavior remains unchanged
- **WHEN** the user switches between details sections
- **THEN** the selected section, section labels, and section counts SHALL behave as before decomposition

#### Scenario: Action form behavior remains unchanged
- **WHEN** the user opens, cancels, submits, or retries a detail action form
- **THEN** the visible form state and error behavior SHALL match the behavior before decomposition

#### Scenario: Command status behavior remains unchanged
- **WHEN** a detail command is pending
- **THEN** the corresponding details workflow submit control SHALL remain disabled as before decomposition

