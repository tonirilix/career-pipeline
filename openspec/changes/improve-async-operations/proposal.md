## Why

The frontend currently hand-rolls request loading, command errors, and local application cache updates inside the Pipeline workspace hook. This is manageable today, but it creates duplicated async policy and will become brittle as more server-backed workflows are added.

## What Changes

- Add a frontend async data layer for cacheable server requests and Job Application mutations.
- Use a single application-level query client so server request state has consistent loading, error, retry, refetch, and invalidation behavior.
- Keep long-lived UI controls in Zustand and local form state in React state rather than moving UI state into the server cache.
- Convert Pipeline workspace application loading and Job Application commands to use the async data layer.
- Preserve current user-facing error visibility and form-input preservation behavior.
- Do not introduce Effect, Effect Atom, or AtomRpc as part of this change.

## Capabilities

### New Capabilities
- `frontend-async-operations`: Covers frontend server-state querying, mutation handling, cache updates, invalidation, and separation from local UI state.

### Modified Capabilities
- `architecture-deepening`: The Pipeline workspace behavior requirement changes so server request lifecycle and mutation cache updates may be delegated to a dedicated async data layer while workspace projections remain isolated from presentation rendering.

## Impact

- Affected code:
  - `apps/web/src/main.tsx`
  - `apps/web/src/presentation/pipelineWorkspace.ts`
  - `apps/web/src/presentation/App.tsx`
  - `apps/web/src/presentation/components/*`
  - `apps/web/src/application/jobApplications.ts`
  - frontend tests around loading, errors, and command behavior
- Dependencies:
  - Add TanStack Query for frontend server-state management.
- Architecture:
  - Zustand remains scoped to UI controls and local app interaction state.
  - GraphQL gateway remains an infrastructure adapter behind the existing application port.
  - Effect and AtomRpc remain out of scope until streaming, RPC contracts, or schema-first typed infrastructure become a concrete need.
