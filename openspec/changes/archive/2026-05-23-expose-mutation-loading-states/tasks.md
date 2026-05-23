## 1. Extract useJobApplications hook

- [x] 1.1 Create `apps/web/src/presentation/useJobApplications.ts` and move the `useQueryClient` call, the list `useQuery`, and all 6 `useMutation` hooks into it
- [x] 1.2 Move `replaceApplicationFromResult` helper and the `onSuccess` cache update logic into `useJobApplications`
- [x] 1.3 Define a shared `CommandStatus = 'idle' | 'pending' | 'error' | 'success'` type (maps to TanStack Query's `MutationStatus`)
- [x] 1.4 Return `applications`, `isLoadingApplications`, all 6 `CommandStatus` values (e.g., `changeStageStatus`, `submitOpportunityStatus`), and all 6 raw command functions from `useJobApplications`
- [x] 1.5 Replace the inline query/mutation code in `usePipelineWorkspace` with a call to `useJobApplications`; command wrappers in `usePipelineWorkspace` should call the raw commands from `useJobApplications` and attach error-channel side effects on top

## 2. Expose mutation status values from usePipelineWorkspace

- [x] 2.1 Re-export all 6 `CommandStatus` values from `usePipelineWorkspace` (pass-through from `useJobApplications`)
- [x] 2.2 Confirm the public return type of `usePipelineWorkspace` is otherwise unchanged for all existing callers

## 3. Wire status values to UI controls in App.tsx

- [x] 3.1 Pass `submitOpportunityStatus` down to the opportunity form and disable its submit button while `=== 'pending'`
- [x] 3.2 Pass `changeStageStatus` to `PipelineBoard` and disable the drag source while `=== 'pending'`
- [x] 3.3 Pass `completeFollowUpStatus` to the complete follow-up control and disable it while `=== 'pending'`

## 4. Wire status values to ApplicationDetails controls

- [x] 4.1 Add `scheduleInterviewStatus`, `createFollowUpStatus`, and `addNoteStatus` props to `ApplicationDetails` typed as `CommandStatus`
- [x] 4.2 Disable the schedule interview submit button while `scheduleInterviewStatus === 'pending'`
- [x] 4.3 Disable the create follow-up submit button while `createFollowUpStatus === 'pending'`
- [x] 4.4 Disable the add note submit button while `addNoteStatus === 'pending'`

## 5. Update PipelineBoard for drag disable

- [x] 5.1 Add `changeStageStatus: CommandStatus` prop to `PipelineBoard` (and down to the drag card if applicable)
- [x] 5.2 Prevent drag initiation on the card while `changeStageStatus === 'pending'`

## 6. Verification

- [x] 6.1 Run the full test suite and confirm no regressions
- [x] 6.2 Manually verify each command path in the running app — confirm the relevant control is disabled while the network request is in-flight
- [x] 6.3 Confirm no presentation code calls `useJobApplications` directly (only `usePipelineWorkspace` does)
