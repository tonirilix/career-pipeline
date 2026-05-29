## ADDED Requirements

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
