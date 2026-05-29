## 1. Projection Characterization

- [x] 1.1 Add focused unit tests for the centralized projection module covering active application count and per-stage counts.
- [x] 1.2 Add focused unit tests for stage filtering, source filtering, case-insensitive company/role search, and combined filter behavior.
- [x] 1.3 Add focused unit tests for created order, last-activity sorting, follow-up-date sorting, and invalid/missing date handling.
- [x] 1.4 Add focused unit tests for selected application lookup and overdue/upcoming follow-up grouping with a fixed `now` input.

## 2. Projection Module

- [x] 2.1 Create a pure frontend presentation projection module for Job Application workspace views.
- [x] 2.2 Move stage-count, active-count, visible-application, selected-application, and follow-up work item derivation into the projection module.
- [x] 2.3 Keep projection helpers independent from React, TanStack Query, Zustand, infrastructure adapters, browser APIs, and UI components.
- [x] 2.4 Export typed projection inputs and outputs needed by `usePipelineWorkspace`.

## 3. Workspace Integration

- [x] 3.1 Update `usePipelineWorkspace` to call the projection module with applications, controls, selected application id, and current time.
- [x] 3.2 Remove inline projection helpers from `pipelineWorkspace.ts`.
- [x] 3.3 Preserve the existing `usePipelineWorkspace` return shape and all current callers.
- [x] 3.4 Keep command wrappers, form state, selection state, and error channels in `usePipelineWorkspace`.

## 4. Architecture Protection

- [x] 4.1 Add a frontend architecture test proving the projection module does not import forbidden framework, adapter, store, or browser APIs.
- [x] 4.2 Add a frontend architecture test proving `pipelineWorkspace.ts` composes the projection module and does not redefine projection helpers inline.
- [x] 4.3 Ensure existing pipeline workspace architecture requirements still pass.

## 5. Verification

- [x] 5.1 Run `npm test --workspace apps/web`.
- [x] 5.2 Run `npm run build --workspace apps/web`.
- [x] 5.3 Run `openspec validate centralize-job-application-projections`.
- [x] 5.4 Run `openspec status --change centralize-job-application-projections` and confirm the change is apply-ready.
