## Context

The current application details slide-over renders application metadata, notes, follow-ups, interviews, and timeline history as one stacked document. Each writable section renders its creation form inline, so the panel becomes long as data accumulates and workflows compete for attention. The issue is especially visible for interviews: scheduling currently accepts an `outcome`, and the domain/backend only block scheduling for `Saved`, allowing rejected or withdrawn applications to receive new interviews.

The frontend already has useful boundaries: `ApplicationDetails` is the presentation surface, `usePipelineWorkspace` coordinates view state and command wrappers, `useJobApplications` owns TanStack Query server state, and gateway/MSW/mock-backend adapters keep transport concerns out of the domain. The backend mirrors the hexagonal structure with use cases behind GraphQL resolvers. This change should preserve those boundaries while improving UX and correcting workflow semantics.

## Goals / Non-Goals

**Goals:**

- Make the details slide-over feel like a focused workspace, not a long mixed form.
- Give notes, follow-ups, interviews, and timeline distinct navigation and visual hierarchy.
- Hide creation forms until the user explicitly starts an action.
- Treat interview scheduling and interview outcome recording as separate workflows.
- Prevent active work actions on closed applications unless the application is reopened.
- Replace raw date/time parse failures with user-facing validation messages.
- Keep server-state ownership in `useJobApplications` and business rules in domain/use-case layers.

**Non-Goals:**

- Replacing the `SlideOver` primitive or changing its accessibility contract.
- Adding drag-and-drop or calendar integrations for interviews/follow-ups.
- Editing or deleting existing notes, follow-ups, or interviews beyond recording interview outcomes.
- Changing the pipeline board layout outside details-panel entry points.
- Adding authentication, multi-user ownership, or notification delivery.

## Decisions

### Use internal details navigation instead of expanding the panel width

The details panel will keep the slide-over model, but its content will use an internal navigation control with focused sections such as Overview, Notes, Follow-ups, Interviews, and Timeline. The application summary remains visible at the top so users keep context while changing sections.

Alternative considered: make the panel wider and keep every section visible. That would reduce some scrolling on desktop but leaves the same mixed workflow problem and does not help mobile.

### Show lists first and forms only after explicit actions

Each writable section will prioritize existing data and expose a clear action such as `Add note`, `Create follow-up`, or `Schedule interview`. The form appears only for the active action and can be cancelled without leaving the details workspace.

Alternative considered: use collapsed accordions with forms pre-mounted inside each section. That still makes the panel feel like a form catalog and keeps too many controls in the keyboard tab order.

### Split interview scheduling from outcome recording

Scheduling an interview creates an interview with outcome `Scheduled`. Recording `Passed`, `Rejected`, or `No decision` becomes a separate action on an existing interview. This matches the real workflow: an interview is planned first, then its result is known later.

Alternative considered: keep outcome on schedule but hide non-`Scheduled` values by default. That preserves a confused API and leaves transport/domain semantics wrong.

### Enforce action availability from domain/use cases, with UI affordances as guidance

The UI will hide or disable unavailable actions for closed applications, but frontend domain functions and backend use cases must also enforce the rules. Active work actions apply to open applications only; notes remain available for historical context.

Alternative considered: only hide controls in the UI. That would leave MSW/backend/API callers able to create invalid records.

### Keep details state local to the workspace coordination layer

The active details section and visible action form are UI state, so they belong in `ApplicationDetails` or `usePipelineWorkspace`. TanStack Query state remains in `useJobApplications`, with command wrappers exposed through the existing workspace boundary.

Alternative considered: store details tab/action state in Zustand. The state is scoped to one details panel and does not need global persistence.

## Risks / Trade-offs

- [Risk] Splitting interview commands touches frontend, MSW, GraphQL, and backend layers. -> Mitigation: implement as vertical slices with contract tests around both MSW and real GraphQL schema.
- [Risk] Hiding forms behind actions may make creation less immediately discoverable. -> Mitigation: use clear section-level primary actions and empty states that point to the next action.
- [Risk] Changing schedule-interview input shape can break gateway/backend compatibility during implementation. -> Mitigation: update schema, generated code, gateway operations, MSW handlers, and contract tests in the same slice.
- [Risk] Closed-application rules may feel too restrictive if a user wants to add historical interviews after rejection. -> Mitigation: keep notes available for historical capture and require reopening for active workflow changes.

## Migration Plan

1. Add frontend presentation tests for the desired details workspace behavior.
2. Introduce details section/action state and refactor `ApplicationDetails` into focused section components.
3. Remove outcome from schedule-interview forms and commands; default scheduled interviews to `Scheduled`.
4. Add record-interview-outcome command path across frontend gateway, MSW/mock backend, GraphQL schema/resolver, backend use case, and tests.
5. Enforce closed-application action rules in frontend domain functions and backend use cases.
6. Replace raw date/time parse failures with user-facing validation at presentation/gateway/use-case boundaries as appropriate.
7. Run frontend and backend test suites before archiving.
