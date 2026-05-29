## MODIFIED Requirements

### Requirement: usePipelineWorkspace is a projection and coordination layer
`usePipelineWorkspace` SHALL delegate all async server state to `useJobApplications`, own workspace UI state and command error channels, and compose a centralized pure projection module for derived Job Application views such as filtering, sorting, follow-up grouping, stage counts, active counts, and selected application lookup.

#### Scenario: usePipelineWorkspace composes useJobApplications
- **WHEN** `usePipelineWorkspace` is called
- **THEN** it SHALL internally call `useJobApplications` and re-export its data, commands, and pending flags to callers without duplicating mutation logic

#### Scenario: usePipelineWorkspace public API is unchanged
- **WHEN** `usePipelineWorkspace` is refactored to use `useJobApplications` and centralized projections internally
- **THEN** its return type and all existing callers SHALL require no changes outside the hook files themselves

#### Scenario: Workspace projections derive from applications data
- **WHEN** `usePipelineWorkspace` computes `visibleApplications`, `stageCounts`, `activeApplicationCount`, `selectedApplication`, `overdueFollowUpItems`, and `upcomingFollowUpItems`
- **THEN** these SHALL be derived from the `applications` array returned by `useJobApplications`, not from independent queries

#### Scenario: Projection logic is centralized outside the hook
- **WHEN** workspace projections are changed
- **THEN** filtering, sorting, stage counts, selected application lookup, active counts, and follow-up grouping SHALL be changed in the centralized projection module rather than in `usePipelineWorkspace`
