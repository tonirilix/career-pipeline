## ADDED Requirements

### Requirement: Async server state is owned by a dedicated hook
The frontend SHALL provide a `useJobApplications` hook that owns all TanStack Query interactions: the list query, all 6 mutations, cache helpers, and pending flags. No other hook or component SHALL call `useQuery`, `useMutation`, or `useQueryClient` for Job Application data.

#### Scenario: useJobApplications returns the application list
- **WHEN** `useJobApplications` is called with a gateway
- **THEN** it SHALL return `applications` (the list) and `isLoadingApplications` sourced from the TanStack Query list query

#### Scenario: useJobApplications returns all command functions
- **WHEN** `useJobApplications` is called
- **THEN** it SHALL return one command function per mutation: submit opportunity, change stage, schedule interview, create follow-up, complete follow-up, and add note — each with cache updates applied in `onSuccess`

#### Scenario: useJobApplications returns per-mutation status transitions
- **WHEN** `useJobApplications` is called
- **THEN** it SHALL return `submitOpportunityStatus`, `changeStageStatus`, `scheduleInterviewStatus`, `createFollowUpStatus`, `completeFollowUpStatus`, and `addNoteStatus` each typed as `CommandStatus` and sourced from each mutation's `.status`

### Requirement: usePipelineWorkspace is a projection and coordination layer
`usePipelineWorkspace` SHALL delegate all async server state to `useJobApplications` and own only workspace projections (filtering, sorting, follow-up grouping, stage counts), form state, selection state, error channels, and command wrappers that attach error-channel side effects.

#### Scenario: usePipelineWorkspace composes useJobApplications
- **WHEN** `usePipelineWorkspace` is called
- **THEN** it SHALL internally call `useJobApplications` and re-export its data, commands, and pending flags to callers without duplicating mutation logic

#### Scenario: usePipelineWorkspace public API is unchanged
- **WHEN** `usePipelineWorkspace` is refactored to use `useJobApplications` internally
- **THEN** its return type and all existing callers SHALL require no changes outside the hook files themselves

#### Scenario: Workspace projections derive from applications data
- **WHEN** `usePipelineWorkspace` computes `visibleApplications`, `stageCounts`, `activeApplicationCount`, `overdueFollowUpItems`, and `upcomingFollowUpItems`
- **THEN** these SHALL be derived from the `applications` array returned by `useJobApplications`, not from independent queries
