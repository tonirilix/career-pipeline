# architecture-deepening Specification

## Purpose
TBD - created by archiving change architecture-deepening-review-2026-may22. Update Purpose after archive.
## Requirements
### Requirement: Backend full Job Application assembly is centralized
The backend application layer SHALL provide one module responsible for assembling a full Job Application with timeline events, interviews, follow-up reminders, and notes.

#### Scenario: Use case returns full application through assembly module
- **WHEN** a backend use case must return a full Job Application
- **THEN** it SHALL delegate child collection loading to the full Job Application assembly module instead of directly loading each child repository

#### Scenario: Assembly module preserves child collection ordering
- **WHEN** the full Job Application assembly module loads timeline events, interviews, follow-up reminders, and notes
- **THEN** each child collection SHALL be returned in the ordering expected by the current application behavior

### Requirement: Backend multi-step workflows are atomic
Backend Job Application workflows that write more than one persisted record SHALL execute those writes atomically.

#### Scenario: Application creation rolls back on timeline failure
- **WHEN** creating a Job Application succeeds at saving the application but fails while writing the initial timeline event
- **THEN** the entire workflow SHALL be rolled back with no partial persistence

#### Scenario: Stage advance rolls back on later failure
- **WHEN** advancing a Job Application stage succeeds at updating the stage but fails while writing a timeline event or deactivating follow-up reminders
- **THEN** the entire workflow SHALL be rolled back with no partial persistence

#### Scenario: Detail workflow rolls back on timeline failure
- **WHEN** scheduling an interview, creating a follow-up reminder, completing a follow-up reminder, or adding a note fails while writing the timeline event
- **THEN** the detail record change SHALL be rolled back

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

### Requirement: MSW handlers remain transport adapters
The MSW GraphQL handlers SHALL delegate Job Application state changes to an in-memory mock backend module.

#### Scenario: Handler delegates create opportunity
- **WHEN** the `CreateSavedOpportunity` MSW operation is received
- **THEN** the handler SHALL translate the GraphQL input and delegate creation to the mock backend module

#### Scenario: Mock backend owns generated values
- **WHEN** the mock backend creates timeline events, interviews, follow-up reminders, notes, or applications
- **THEN** IDs and timestamps SHALL be generated inside the mock backend module rather than in MSW handler functions

### Requirement: Architecture tests protect deepened seams
The test suite SHALL include architecture or module-level tests that prevent the deepened modules from collapsing back into callers.

#### Scenario: Backend use cases avoid direct child repository loading
- **WHEN** backend architecture tests run
- **THEN** use cases that return full Job Applications SHALL NOT directly call every child repository for rehydration

#### Scenario: MSW does not own mock backend state
- **WHEN** frontend architecture tests run
- **THEN** MSW handler modules SHALL NOT own mutable Job Application mock state

#### Scenario: Application details workspace remains decomposed
- **WHEN** frontend architecture tests run
- **THEN** Application Details section rendering and workflow state SHALL remain in focused details workspace modules instead of returning to one monolithic `ApplicationDetails` implementation

### Requirement: Frontend Job Application projections are centralized
The frontend SHALL keep derived Job Application projection rules in a focused presentation module that is independent from React hooks, server-state libraries, browser APIs, infrastructure adapters, and UI rendering components.

#### Scenario: Projection module is pure presentation logic
- **WHEN** frontend architecture tests inspect the Job Application projection module
- **THEN** the module SHALL NOT import React, TanStack Query, Zustand, infrastructure adapters, MSW, GraphQL clients, or browser APIs

#### Scenario: Pipeline workspace composes projections
- **WHEN** frontend architecture tests inspect `usePipelineWorkspace`
- **THEN** the hook SHALL compose the centralized projection module rather than defining private filtering, sorting, stage-count, selected-application, or follow-up grouping helpers inline

#### Scenario: Projection behavior is directly testable
- **WHEN** projection behavior is changed
- **THEN** tests SHALL be able to exercise stage counts, active counts, filtering, search, sorting, selected application lookup, and follow-up grouping without rendering React components or hooks

### Requirement: Backend composition concerns stay at the outer layer
Backend configuration, bootstrap, composition, and HTTP server modules SHALL remain outer-layer concerns and SHALL NOT be imported by domain or application packages.

#### Scenario: Domain remains independent from runtime composition
- **WHEN** backend architecture tests inspect the domain package
- **THEN** domain files SHALL NOT import backend configuration, bootstrap, composition, server, GraphQL, persistence, database, migration, or HTTP packages

#### Scenario: Application remains independent from runtime composition
- **WHEN** backend architecture tests inspect the application packages
- **THEN** application files SHALL NOT import backend configuration, bootstrap, composition, server, GraphQL, persistence, database, migration, or HTTP packages

#### Scenario: Composition module is the only backend layer that wires adapters to use cases
- **WHEN** backend architecture tests inspect repository/use-case/resolver construction
- **THEN** infrastructure adapters and GraphQL resolvers SHALL be connected to application use cases from the composition root or its focused composition module, not from domain or application packages
