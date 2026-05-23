## Context

The React frontend currently loads applications in `usePipelineWorkspace` with local `useState`, `useEffect`, an `isMounted` guard, and manually maintained command error state. Successful commands patch the local Job Application collection in the workspace hook. Zustand is already used for pipeline controls, and the GraphQL gateway already sits behind the `JobApplicationGateway` application port.

This change improves server-state handling without changing the hexagonal boundary: React presentation code still depends on application use cases and gateway ports, while GraphQL remains an infrastructure adapter.

## Goals / Non-Goals

**Goals:**
- Centralize frontend server-state query and mutation lifecycle around a single Query Client.
- Replace manual initial loading state with query-managed pending, error, retry, and refetch behavior.
- Replace hand-written mutation state with mutation-managed pending and error behavior.
- Keep pipeline filtering, sorting, follow-up grouping, selected application behavior, and form state outside the server cache.
- Preserve current user-facing error placement and form-input preservation behavior.
- Keep the migration incremental and testable.

**Non-Goals:**
- Do not introduce Effect, Effect Atom, or AtomRpc.
- Do not move the GraphQL gateway contract into UI components.
- Do not replace Zustand for UI controls.
- Do not introduce Suspense for async rendering.
- Do not change backend API shape or GraphQL operation names.

## Decisions

### Use TanStack Query for server state

TanStack Query will own cacheable request data and mutation lifecycle for Job Applications. The initial adoption should cover the applications list query and existing Job Application commands.

Alternatives considered:
- Continue manual state: lowest dependency cost, but leaves loading, retry, dedupe, refetch, and mutation state scattered in the workspace hook.
- Move server data into Zustand: possible, but would recreate request-cache behavior manually and blur UI state with server state.
- Use Apollo Client: fits GraphQL caching, but would couple the frontend more tightly to GraphQL operation shape than the existing gateway-port architecture requires.
- Use Effect/AtomRpc: powerful, but not justified without Effect RPC, streams, or broad schema-first infrastructure.

### Keep Zustand for long-lived UI controls

Pipeline search, filters, and sorting remain in the existing Zustand store. These values are client interaction state, not server cache entries. Form inputs and slide-over open state remain local React state unless a future requirement needs persistence across sessions.

### Keep derived workspace projections in the workspace module

The workspace module should continue to derive stage counts, visible applications, selected application, and follow-up groups. The async data layer provides the source application collection and command lifecycle; the workspace module shapes that data for presentation.

### Use explicit query keys and cache update helpers

Job Application queries should use centralized query keys. Mutations that return a complete updated application should update the cached list directly. Mutations that create a new application should append or invalidate the list. Invalidations should be scoped to Job Application queries, not global.

### Preserve current error visibility

Load failures still render in the main content area. Board commands still render board-level errors. Add-opportunity command failures remain in the add-opportunity panel. Details workflow failures remain in the details panel. Failed form input remains in place.

### Avoid Suspense during migration

Components should continue to receive explicit loading and error state. This keeps the migration small and avoids changing rendering semantics while async ownership changes.

## Risks / Trade-offs

- Extra dependency and provider setup -> Keep TanStack Query limited to server-state concerns and add architecture tests or module conventions that prevent UI controls from moving into query cache.
- Cache update mistakes can show stale applications -> Centralize query keys and cache update helpers, and cover create/update mutation behavior with tests.
- Mutation errors can lose the current near-action placement -> Preserve the existing board/form/details error channels while sourcing pending and failure state from mutations.
- Query retry behavior can change user-visible failures -> Choose conservative defaults and test load failure rendering. Disable or scope retries where tests need deterministic behavior.
- Workspace hook may still be large after migration -> Treat this change as async ownership only; deeper workspace decomposition can happen separately if needed.
