## MODIFIED Requirements

### Requirement: Pipeline workspace behavior is isolated from presentation rendering
The frontend SHALL place Pipeline workspace behavior behind a two-layer module structure: an async layer (`useJobApplications`) that owns all TanStack Query interactions, and a projection/coordination layer (`usePipelineWorkspace`) that owns filtering, sorting, follow-up grouping, form state, selection state, command error state, and mutation pending state. Presentation code SHALL only call `usePipelineWorkspace`.

#### Scenario: App renders workspace state
- **WHEN** `App` renders the Pipeline workspace
- **THEN** filtering, sorting, follow-up grouping, command state, and mutation pending flags SHALL be provided by `usePipelineWorkspace` rather than recomputed directly in `App`

#### Scenario: Workspace module handles command result updates
- **WHEN** a Job Application command succeeds from the Pipeline board or details panel
- **THEN** the `useJobApplications` async layer SHALL update the TanStack Query cache, and `usePipelineWorkspace` SHALL reflect the updated data via its projections

#### Scenario: Workspace module exposes mutation status transitions
- **WHEN** a Job Application command mutation changes state
- **THEN** `usePipelineWorkspace` SHALL expose the corresponding `CommandStatus` value sourced from `useJobApplications` so that UI controls can react to `'pending'`, `'error'`, and `'success'` transitions without querying TanStack Query directly

#### Scenario: Async layer is not called directly from presentation
- **WHEN** a component or App needs Job Application data or commands
- **THEN** it SHALL call `usePipelineWorkspace`, not `useJobApplications` directly
