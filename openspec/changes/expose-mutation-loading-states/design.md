## Context

`usePipelineWorkspace` wraps 6 `useMutation` hooks from TanStack Query:

| Mutation variable | Command |
|---|---|
| `createOpportunityMutation` | submit new opportunity form |
| `advanceStageMutation` | drag/drop stage change on the board |
| `scheduleInterviewMutation` | schedule interview from details panel |
| `createFollowUpMutation` | create follow-up reminder from details panel |
| `completeFollowUpMutation` | mark follow-up complete from board |
| `addNoteMutation` | add note from details panel |

Each has `.isPending` available from TanStack Query. Currently, none are surfaced in the hook's return value, so the UI has no signal to disable controls while a mutation is in-flight.

The hook already returns `isLoadingApplications` (from the list query), establishing the pattern for pending flags.

## Goals / Non-Goals

**Goals:**
- Return one boolean pending flag per mutation from `usePipelineWorkspace`
- Disable the relevant UI control for the duration of each mutation
- Cover the double-submit case for all 6 command paths
- Extract `useJobApplications` as the async layer (query + mutations + cache) so `usePipelineWorkspace` becomes a pure projection/coordination layer

**Non-Goals:**
- Optimistic UI or rollback — the existing error-and-display pattern is preserved
- Loading spinners or skeleton states — disabled state is sufficient for now
- Any change to error handling, Zustand UI state, or hexagonal boundary
- Moving error state into `useJobApplications` — error channels stay in `usePipelineWorkspace` for now

## Decisions

### Expose mutation status transitions, not boolean flags

Boolean flags (`isChangingStage: boolean`) only communicate one transition. TanStack Query's `mutation.status` already carries `'idle' | 'pending' | 'error' | 'success'` — surfacing this directly lets the UI react to all state transitions without adding separate error/success booleans later.

A shared type is defined once:

```ts
type CommandStatus = 'idle' | 'pending' | 'error' | 'success'
```

This maps 1:1 to TanStack Query's `MutationStatus`, so no translation is needed — just re-export.

### Naming convention: `<verb><Noun>Status` matching the command function names

- `submitOpportunityStatus` ← `createOpportunityMutation.status`
- `changeStageStatus` ← `advanceStageMutation.status`
- `scheduleInterviewStatus` ← `scheduleInterviewMutation.status`
- `createFollowUpStatus` ← `createFollowUpMutation.status`
- `completeFollowUpStatus` ← `completeFollowUpMutation.status`
- `addNoteStatus` ← `addNoteMutation.status`

This aligns with the command function names (`changeStage`, `submitOpportunity`, etc.) and avoids the `is` prefix that implies a boolean.

### Disable at the control level using `=== 'pending'`

Each consuming component receives the status value as a prop and sets `disabled={status === 'pending'}`. This keeps the boolean derivation local to the render site, where future `=== 'error'` or `=== 'success'` reactions can be added without changing the hook interface.

## Hook split: useJobApplications

`useJobApplications` owns everything TanStack Query touches:

```
useJobApplications(gateway) → {
  // data
  applications, isLoadingApplications,
  // mutation status transitions (CommandStatus = 'idle'|'pending'|'error'|'success')
  submitOpportunityStatus, changeStageStatus, scheduleInterviewStatus,
  createFollowUpStatus, completeFollowUpStatus, addNoteStatus,
  // commands (same signatures as today)
  submitOpportunityCommand, changeStageCommand, scheduleInterviewCommand,
  createFollowUpCommand, completeFollowUpCommand, addNoteCommand
}
```

`usePipelineWorkspace` calls `useJobApplications` and layers on workspace concerns:

```
usePipelineWorkspace(gateway, usePipelineControls) → {
  // from useJobApplications (re-exported)
  ...jobApplications,
  // workspace projections
  visibleApplications, stageCounts, activeApplicationCount,
  overdueFollowUpItems, upcomingFollowUpItems, selectedApplication,
  // coordination / form / error state
  form, setForm, fieldErrors, commandError, formCommandError,
  detailsCommandError, selectedApplicationId,
  // command wrappers (add error-channel side effects on top of raw commands)
  submitOpportunity, changeStage, scheduleInterview,
  createFollowUp, completeFollowUp, addNote,
  viewDetails, closeDetails, clearOpportunityFormErrors,
  ...controls
}
```

### Key coupling: queryClient stays in useJobApplications

Mutations need `queryClient` for `addCachedJobApplication` / `replaceCachedJobApplication`. `useQueryClient()` is called inside `useJobApplications`, not in `usePipelineWorkspace`. This is the main reason the split is non-trivial: the commands returned by `useJobApplications` must already have cache updates baked in via `onSuccess`, rather than being bare `mutateAsync` calls.

### Command wrapper pattern

`usePipelineWorkspace` wraps each raw command from `useJobApplications` to attach error-channel side effects (e.g., `setCommandError`, `setDetailsCommandError`) without duplicating the mutation logic. The raw commands are pure async functions; the wrappers add the workspace reaction.

## Risks / Trade-offs

- **Multiple simultaneous mutations**: TanStack Query's `.isPending` is per-mutation-hook instance, not per-call. If two distinct mutations (e.g., `changeStage` + `completeFollowUp`) run concurrently, each flag is independent — this is the correct behaviour.
- **Board drag target**: Stage change is triggered by drag-and-drop. Disabling the drag source while `isChangingStage` is true requires the board component to receive and apply the flag; this is straightforward but requires auditing the drag handler component.
- **Scope creep**: Resist wiring pending flags to error display or retry logic in this change. Those belong in a separate error-visibility improvement if needed.
- **Hook split ordering**: Implement the split before wiring pending flags to the UI — the split changes the shape of what `usePipelineWorkspace` returns, and doing it last risks double-touching every component prop signature.
- **Test surface**: Splitting the hook makes `useJobApplications` independently testable against real TanStack Query infrastructure. Existing tests for `usePipelineWorkspace` should continue to pass since its public API is unchanged.
