## Context

`usePipelineWorkspace` currently does two jobs. It coordinates workspace UI state, command wrappers, and error channels, and it also computes every derived view of the Job Application list. Those projections include active application counts, stage counts, selected application lookup, filter/search results, sort order, and overdue/upcoming follow-up work groups.

The calculations are pure business-facing presentation rules, but today they are tested mostly through the React hook. That makes projection changes noisier than they need to be and keeps `pipelineWorkspace.ts` larger than its coordination role requires.

## Goals / Non-Goals

**Goals:**

- Move Job Application list projections into a pure frontend presentation module.
- Keep `usePipelineWorkspace` as the stable public hook used by `App`.
- Preserve the existing workspace return shape and UI behavior.
- Make projection rules directly testable without React, TanStack Query, Zustand, GraphQL, or MSW.
- Add architecture tests that keep projection logic out of adapters and out of `usePipelineWorkspace`.

**Non-Goals:**

- Changing domain rules, backend behavior, GraphQL operations, MSW handlers, or gateway ports.
- Changing the visual design or component props consumed by `App`.
- Introducing a global store or caching layer for projections.
- Moving projection rules into the domain layer. These are presentation-specific views over Job Application data.

## Decisions

### Create a pure presentation projection module

Add a module such as `apps/web/src/presentation/jobApplicationProjections.ts`. It will export a `projectJobApplications` function that accepts the raw `applications`, current pipeline controls, selected application id, and current time, then returns the derived workspace projections.

This keeps the projection contract cohesive: callers ask for the workspace-ready view instead of importing many tiny selectors. Internal helpers such as sorting and safe date parsing can stay private unless a focused test genuinely needs them.

Alternative considered: keep individual helper functions at the bottom of `pipelineWorkspace.ts`. That would reduce duplication but would not materially improve the hook boundary or direct testability.

### Keep `usePipelineWorkspace` as the composition boundary

`usePipelineWorkspace` should still be the only hook called by presentation components for Job Application workspace state. It will call `useJobApplications`, own local UI state and command wrappers, then compose the projection module for derived values.

This avoids leaking projection module details into `App` and keeps the public hook API stable.

Alternative considered: have `App` call the projection module directly. That would spread workspace composition back into presentation rendering and weaken the existing pipeline workspace decomposition.

### Treat time as projection input

Follow-up grouping depends on "now". The projection function should receive `now` as a number or date-like value instead of reading `Date.now()` internally. `usePipelineWorkspace` can pass `Date.now()`, while tests can pass fixed times without spying on globals.

Alternative considered: keep `Date.now()` inside the projection module. That would make tests less direct and keep hidden runtime state in otherwise pure code.

### Protect boundaries with architecture tests

Add architecture tests that assert the projection module does not import React, TanStack Query, Zustand, infrastructure adapters, or browser APIs. Also assert `pipelineWorkspace.ts` composes the projection module rather than retaining private sorting/filtering helpers.

Alternative considered: rely on unit tests only. Unit tests prove behavior but do not stop future contributors from moving the rules back into the hook.

## Risks / Trade-offs

- [Risk] A single `projectJobApplications` function could become a catch-all. -> Mitigation: keep its input/output typed around current workspace projections and keep unrelated command/error state in `usePipelineWorkspace`.
- [Risk] Refactoring projection logic could subtly change sort or filter behavior. -> Mitigation: add direct characterization tests for current projection outputs before replacing the hook internals.
- [Risk] The projection module may look domain-like and tempt future reuse outside presentation. -> Mitigation: keep it under `apps/web/src/presentation/` and document that it derives UI workspace views, not domain invariants.
- [Risk] Passing time as input is one more parameter. -> Mitigation: centralize the call in `usePipelineWorkspace`; only tests and the hook need to construct the input.
