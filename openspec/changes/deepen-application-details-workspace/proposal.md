## Why

`ApplicationDetails.tsx` now carries the whole details workspace: section navigation, local workflow state, form validation, command mapping, sorting, date formatting, and all section rendering. The behavior is good enough, but the module is shallow and hard to review because unrelated details workflows all change in one 800+ line file.

## What Changes

- Decompose the details workspace into a small coordinator plus focused section modules for overview, notes, follow-ups, interviews, and timeline.
- Move details-only form state and submit/cancel behavior behind focused workflow modules or hooks so note, follow-up, interview scheduling, and interview outcome flows can evolve independently.
- Extract shared details UI primitives and formatting helpers used by multiple sections without creating a new global state store.
- Preserve the public `ApplicationDetails` interface used by `App` and `usePipelineWorkspace`.
- Preserve all current user-facing behavior, accessibility labels, command error behavior, and form input preservation semantics.
- Add focused module tests for the extracted details sections/workflows and an architecture test that prevents the details workspace from collapsing back into one monolithic file.

## Capabilities

### New Capabilities

- `application-details-workspace-decomposition`: Defines the internal module structure and preservation requirements for the Application Details workspace.

### Modified Capabilities

- `architecture-deepening`: Architecture tests SHALL protect the Application Details workspace decomposition.

## Impact

- Affected frontend presentation code: `apps/web/src/presentation/components/ApplicationDetails.tsx` and new detail-workspace section/workflow modules under `apps/web/src/presentation/components/`.
- Affected frontend tests: current Application Details coverage in `App.test.tsx` plus focused tests for extracted details workspace modules.
- No backend, GraphQL schema, persistence, gateway, MSW, or domain behavior changes are expected.
- No new runtime dependencies are expected.
