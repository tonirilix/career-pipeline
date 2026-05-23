## Context

The repository now has both deployable applications described by ADR 0001: `apps/web` for the React frontend and `apps/api` for the Go backend. The current code follows the intended domain/application/infrastructure/presentation split, but several modules remain shallow: use cases carry many repositories, multi-step backend workflows are not transactional, the frontend Pipeline workspace behavior is concentrated in `App.tsx`, MSW handlers contain an in-memory backend, and the GraphQL contract is maintained by parallel handwritten shapes.

ADR 0002 requires the backend to keep GraphQL and persistence as adapters around domain and use case behavior. ADR 0003 leaves the query-generation strategy open and recommends sqlc as the long-term persistence direction.

## Goals / Non-Goals

**Goals:**

- Increase locality for full Job Application assembly, workflow persistence, Pipeline workspace state, mock backend behavior, GraphQL contract verification, and PostgreSQL query mapping.
- Keep public user-facing behavior unchanged while improving the test surface.
- Preserve the existing workspace layout and the rule that frontend and backend domain code are not shared prematurely.
- Make each deepened module earn its interface by hiding behavior that would otherwise be duplicated across callers.

**Non-Goals:**

- Add new user-facing Job Application workflows.
- Introduce authentication, deployment changes, or external integrations.
- Replace the frontend with a server-driven model.
- Create a shared frontend/backend domain package.

## Decisions

1. Treat Job Application rehydration as a backend application-layer read module.

   Use cases should not each know how to load timeline events, interviews, follow-up reminders, and notes. A dedicated read module keeps assembly rules, collection ordering, and future query optimization in one place. Alternative considered: leave `loadFullApplication` as a helper. That keeps call sites simple, but it does not reduce constructor breadth or improve the test surface.

2. Use the existing transaction concept for multi-step backend workflows.

   `Transactor` already exists as a port but is not wired into use cases. Multi-write workflows should execute stage updates, timeline writes, follow-up deactivation, notes, interviews, and reminders atomically. Alternative considered: rely on repository methods and integration tests only. That keeps code smaller but allows partial persistence on mid-workflow failure.

3. Move Pipeline workspace behavior behind a frontend application-facing module.

   `App.tsx` should become a renderer of workspace state and callbacks, not the owner of loading, sorting, follow-up grouping, local replacement, and command error policy. Alternative considered: continue extracting smaller presentational components. That helps JSX size, but it leaves workflow state and read-model logic in the same place.

4. Keep MSW as a transport adapter.

   The in-memory mock backend should own Job Application state, ID generation, time generation, and workflow execution. MSW handlers should only translate GraphQL operation inputs and outputs. Alternative considered: keep all mock behavior in handlers. That is fast to edit but couples network mocking to domain behavior.

5. Verify the GraphQL contract at the seam.

   The schema, backend resolver mapping, frontend gateway operations, and error mapping should be checked together so the real backend can replace MSW without accidental drift. Alternative considered: keep handwritten DTOs and rely on UI tests. That catches drift late and only through expensive workflows.

6. Improve persistence query locality without hiding SQL.

   SQL should remain reviewable, but query text and row mapping should stop spreading through hand-written scan code. sqlc is the preferred long-term direction because ADR 0003 already identifies it as the best fit. If sqlc is not installed during implementation, a smaller intermediate query module is acceptable only if it preserves the same repository seam and migration path.

## Risks / Trade-offs

- [Risk] Deepening modules can create new pass-through abstractions. → Mitigation: apply the deletion test during implementation and keep only modules that hide repeated behavior from callers.
- [Risk] GraphQL enum tightening can break the current frontend gateway if names differ between schema values and domain display strings. → Mitigation: introduce explicit mapping tests before changing operation shapes.
- [Risk] Transaction wiring can make repository adapters more complex. → Mitigation: keep transaction behavior behind the existing persistence seam and verify rollback with integration tests.
- [Risk] sqlc may add toolchain setup friction. → Mitigation: update `apps/api/Makefile` and documentation, and treat a non-sqlc query module as an interim fallback only if tool installation blocks progress.
- [Risk] Moving Pipeline workspace state can disrupt presentation behavior. → Mitigation: preserve existing presentation tests and add focused workspace-module tests before slimming `App.tsx`.
