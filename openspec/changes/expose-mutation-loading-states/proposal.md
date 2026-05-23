## Why

`usePipelineWorkspace` has two related problems left over from the `improve-async-operations` change. First, it runs 6 TanStack Query mutations but exposes none of their `.isPending` state to the UI, allowing double-submits on every command. Second, the hook has grown to own 1 query, 6 mutations, workspace projections, form state, selection state, and error channels — too many concerns for a single module to remain navigable and testable.

## What Changes

- Return per-mutation status values from `usePipelineWorkspace` (`changeStageStatus`, `submitOpportunityStatus`, `scheduleInterviewStatus`, `addNoteStatus`, `completeFollowUpStatus`, `createFollowUpStatus`) typed as `'idle' | 'pending' | 'error' | 'success'` rather than plain booleans, so the UI can react to all state transitions.
- Wire each status value to the relevant UI control so it is disabled while `'pending'`.
- Extract a new `useJobApplications` hook that owns the async layer: the list query, all 6 mutations, and cache helpers. `usePipelineWorkspace` becomes a projection/coordination layer that calls `useJobApplications` and adds filtering, sorting, follow-up grouping, form state, selection state, and error channels.
- No new dependencies; hexagonal boundary and Zustand UI state unchanged.

## Capabilities

### New Capabilities
- `mutation-loading-states`: Covers the contract for exposing per-mutation status transitions from the Pipeline workspace hook to UI controls.
- `pipeline-workspace-decomposition`: Covers the split of `usePipelineWorkspace` into an async layer (`useJobApplications`) and a projection/coordination layer (`usePipelineWorkspace`).

### Modified Capabilities
- `architecture-deepening`: The Pipeline workspace behavior requirement expands to cover mutation pending state ownership and the two-layer hook structure.

## Impact

- Affected code:
  - `apps/web/src/presentation/pipelineWorkspace.ts` — split into `useJobApplications` + revised `usePipelineWorkspace`
  - `apps/web/src/infrastructure/query/jobApplicationQueries.ts` — may absorb or re-export helpers used by `useJobApplications`
  - `apps/web/src/presentation/App.tsx` and relevant components — consume pending flags to disable controls
  - Frontend tests for workspace hook behavior
- Dependencies: none added
- Architecture: `useJobApplications` owns `useQueryClient`; `usePipelineWorkspace` calls `useJobApplications` and builds the workspace view on top
