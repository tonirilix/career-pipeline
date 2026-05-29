## Context

The current details workspace behavior is useful, but its implementation is concentrated in `ApplicationDetails.tsx`. The module owns navigation state, action state, four local form states, validation, command translation, sorting, date formatting, shared section chrome, and all section rendering. This makes the module shallow: callers get one `ApplicationDetails` interface, but maintainers still need to understand every details workflow to make a local change safely.

The intended architecture is a presentational workspace with props supplied by `App`/`usePipelineWorkspace`. Server state and command mutation ownership must remain where they are today. This change only deepens the presentation-side details workspace modules.

## Goals / Non-Goals

**Goals:**

- Keep `ApplicationDetails` as the public entry point used by `App`.
- Reduce `ApplicationDetails.tsx` to a coordinator that wires application data, section navigation, visible action state, and section props.
- Extract Overview, Notes, Follow-ups, Interviews, and Timeline rendering into focused modules.
- Move note/follow-up/interview form state and submit/cancel behavior into workflow-specific modules or hooks.
- Share details-only UI primitives and date helpers through local modules instead of duplicating them across sections.
- Preserve current behavior, labels, accessible names, command status handling, and form-input preservation on failure.

**Non-Goals:**

- Changing the `SlideOver` primitive or application shell layout.
- Changing `usePipelineWorkspace`, `useJobApplications`, gateway ports, GraphQL operations, MSW handlers, or backend behavior.
- Introducing a global details store or moving details UI state to Zustand.
- Redesigning the details workspace visually beyond small structural cleanup required by the decomposition.
- Adding edit/delete workflows for notes, follow-ups, interviews, or timeline events.

## Decisions

### Keep one public entry module with internal section modules

`ApplicationDetails` will remain the component imported by `App`, preserving the current prop interface. Internally it will coordinate sorted collections, active section/action state, and pass focused props to section modules such as `OverviewSection`, `NotesSection`, `FollowUpsSection`, `InterviewsSection`, and `TimelineSection`.

Alternative considered: expose each section to `App` and let the app compose the details workspace. That would leak details-workspace implementation into the application shell and reduce locality.

### Put workflow state near each workflow

Note body state belongs with the notes workflow. Follow-up date/time/note state belongs with the follow-up workflow. Interview scheduling and outcome state belong with the interview workflow. These can be implemented as small hooks or section-local state, as long as switching details sections and cancelling actions preserve the current semantics.

Alternative considered: keep all state in the top-level coordinator and only extract JSX. That would reduce file size but not improve depth much because the coordinator would still need to know every workflow's internal form shape.

### Use local details primitives, not generic UI abstractions

Repeated pieces such as section headers, details error notices, form actions, date/time fields, and date formatting should live in a local details-workspace module. They are not general design-system primitives yet, so they should not be promoted into `components/ui`.

Alternative considered: add these helpers to the shared UI library. That would make the shared UI surface larger before there is evidence they are useful outside this workspace.

### Preserve behavior through characterization tests first

Before moving code, focused tests should cover section navigation, action-form visibility/cancel behavior, command error placement, form input preservation after failures, and interview outcome recording. Existing broad `App.test.tsx` coverage can remain, but extracted modules should have smaller tests that fail closer to the changed workflow.

Alternative considered: refactor first and rely only on the existing broad app tests. That leaves too much room for accidental behavior drift and makes failures harder to localize.

## Risks / Trade-offs

- [Risk] The refactor could accidentally change visible behavior while moving JSX. -> Mitigation: add focused characterization tests before extracting modules and keep the public `ApplicationDetails` props unchanged.
- [Risk] Too many tiny files could make the workspace harder to navigate. -> Mitigation: group extracted modules under one `application-details/` folder with clear section/workflow names.
- [Risk] Workflow hooks could become pass-through wrappers. -> Mitigation: only extract hooks when they own meaningful form state, validation, submit/cancel, or reset behavior.
- [Risk] Shared local primitives could become a second design system. -> Mitigation: keep them details-scoped and avoid adding generic configuration until another caller needs it.

## Migration Plan

1. Add focused tests around the current details workspace behavior.
2. Create a local details-workspace module folder and shared local primitives.
3. Extract static/read-only sections first: overview and timeline.
4. Extract notes, follow-ups, and interviews with their workflow state and submit/cancel behavior.
5. Reduce `ApplicationDetails.tsx` to the coordinator and public entry point.
6. Add an architecture test that enforces the decomposition and prevents the old monolithic shape from returning.
7. Run `npm test --workspace apps/web` and `npm run build --workspace apps/web`.
