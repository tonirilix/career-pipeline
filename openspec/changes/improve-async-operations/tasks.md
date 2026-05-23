## 1. Query Client Setup

- [x] 1.1 Add TanStack Query to the web application dependencies.
- [x] 1.2 Create a stable Query Client configuration for the web app.
- [x] 1.3 Wrap the React application root with `QueryClientProvider`.
- [x] 1.4 Add centralized Job Application query keys.

## 2. Application Loading

- [x] 2.1 Add a Job Application list query that calls the existing application use case and gateway port.
- [x] 2.2 Replace manual `useEffect` application loading in the Pipeline workspace with managed query state.
- [x] 2.3 Preserve the existing main-content loading status while the list query is pending.
- [x] 2.4 Preserve visible main-content load failure behavior when the list query fails.
- [x] 2.5 Keep filtering, sorting, stage counts, selected application lookup, and follow-up grouping derived in the Pipeline workspace.

## 3. Mutation Handling

- [x] 3.1 Add cache helper logic for replacing a returned Job Application in the cached list.
- [x] 3.2 Convert stage-change commands to managed mutations and update the cached list on success.
- [x] 3.3 Convert create-opportunity commands to managed mutations and add the created application to the cached list on success.
- [x] 3.4 Convert interview, follow-up, complete-follow-up, and note commands to managed mutations and update the cached list on success.
- [x] 3.5 Ensure failed mutations leave the cached application list unchanged.
- [x] 3.6 Preserve board, form, and details error placement for failed mutations.

## 4. State Boundaries

- [x] 4.1 Keep pipeline search, filters, and sort in the existing Zustand UI store.
- [x] 4.2 Keep slide-over open state and form inputs outside the server cache.
- [x] 4.3 Ensure GraphQL operation details remain inside the infrastructure gateway adapter.
- [x] 4.4 Ensure no Effect, Effect Atom, or AtomRpc dependency is introduced by this change.

## 5. Tests and Validation

- [x] 5.1 Update Pipeline workspace tests for query-managed loading, success, and load failure states.
- [x] 5.2 Add or update tests proving successful mutations update the cached Job Application list.
- [x] 5.3 Add or update tests proving failed mutations preserve cache data and form input.
- [x] 5.4 Add or update tests proving Zustand still owns pipeline controls rather than server cache state.
- [x] 5.5 Run the web test suite.
- [x] 5.6 Run the web build.
- [x] 5.7 Run `openspec status --change improve-async-operations` and confirm the change is apply-ready.
