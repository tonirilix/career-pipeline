## ADDED Requirements

### Requirement: Details workspace UI state is separate from server state
The frontend SHALL keep details workspace section selection and visible action-form state as UI coordination state, while `useJobApplications` remains the owner of job-application server state and command mutations.

#### Scenario: Details section changes do not refetch applications
- **WHEN** the user changes the active details workspace section
- **THEN** the frontend SHALL update UI state without issuing a job-application query or mutation

#### Scenario: Details action form changes do not mutate server state
- **WHEN** the user opens or cancels a details action form
- **THEN** the frontend SHALL update UI state without issuing a job-application mutation

### Requirement: Workspace exposes separate interview commands
`usePipelineWorkspace` SHALL expose separate command wrappers for scheduling an interview and recording an interview outcome.

#### Scenario: Schedule command delegates to useJobApplications
- **WHEN** the details workspace schedules an interview
- **THEN** `usePipelineWorkspace` SHALL delegate to the schedule-interview command exposed by `useJobApplications`

#### Scenario: Outcome command delegates to useJobApplications
- **WHEN** the details workspace records an interview outcome
- **THEN** `usePipelineWorkspace` SHALL delegate to the record-interview-outcome command exposed by `useJobApplications`

## MODIFIED Requirements

### Requirement: Async server state is owned by a dedicated hook
The frontend SHALL provide a `useJobApplications` hook that owns all TanStack Query interactions: the list query, all command mutations, cache helpers, and pending flags. No other hook or component SHALL call `useQuery`, `useMutation`, or `useQueryClient` for Job Application data.

#### Scenario: useJobApplications returns the application list
- **WHEN** `useJobApplications` is called with a gateway
- **THEN** it SHALL return `applications` (the list) and `isLoadingApplications` sourced from the TanStack Query list query

#### Scenario: useJobApplications returns all command functions
- **WHEN** `useJobApplications` is called
- **THEN** it SHALL return one command function per mutation: submit opportunity, change stage, schedule interview, record interview outcome, create follow-up, complete follow-up, and add note — each with cache updates applied in `onSuccess`

#### Scenario: useJobApplications returns per-mutation status transitions
- **WHEN** `useJobApplications` is called
- **THEN** it SHALL return `submitOpportunityStatus`, `changeStageStatus`, `scheduleInterviewStatus`, `recordInterviewOutcomeStatus`, `createFollowUpStatus`, `completeFollowUpStatus`, and `addNoteStatus` each typed as `CommandStatus` and sourced from each mutation's `.status`
