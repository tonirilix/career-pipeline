## Why

`usePipelineWorkspace` has become a mixed coordination layer: it owns UI state and command error channels, but it also embeds all derived Job Application projections such as filtering, sorting, stage counts, active counts, selected application lookup, and follow-up work grouping. As the repository is prepared for public review, these projection rules should be easy to test, reuse, and reason about without mounting React hooks or reading command-wrapper code.

## What Changes

- Move Job Application projection logic into a dedicated pure presentation module.
- Keep `usePipelineWorkspace` as the public workspace hook, but have it compose the projection module instead of inlining derivations.
- Add focused unit tests for the projection module covering stage counts, active counts, filtering, search, sorting, selected application lookup, and follow-up work grouping.
- Add architecture protection so projection rules do not drift back into `usePipelineWorkspace` or import adapters, TanStack Query, Zustand, or React.
- Preserve current UI behavior and the public `usePipelineWorkspace` return shape.

## Capabilities

### New Capabilities

### Modified Capabilities

- `pipeline-workspace-decomposition`: Clarify that `usePipelineWorkspace` remains the workspace boundary while delegating pure derived application projections to a focused projection module.
- `architecture-deepening`: Add an architecture guardrail for centralized Job Application projections.

## Impact

- Affected frontend presentation code: `apps/web/src/presentation/pipelineWorkspace.ts` and a new projection module/test under `apps/web/src/presentation/`.
- Affected frontend architecture tests: `apps/web/src/architecture.test.ts`.
- No backend, GraphQL, MSW, Zustand store, TanStack Query, or UI component behavior changes.
- No dependency changes.
