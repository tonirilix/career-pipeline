## Why

The application details slide-over has grown into a long mixed-purpose panel where reference data, notes, follow-ups, interviews, and timeline history compete in one scroll stream. This makes important work hard to find and exposes a confusing interview workflow where users can schedule an interview with a final outcome, or schedule new interviews for closed applications.

This change turns the details panel into a focused application workspace suitable for real daily use: sections are clearly navigable, creation forms appear only when needed, and interview/follow-up workflows match the actual job-search domain.

## What Changes

- Replace the stacked application details content with an internal workspace layout that has a persistent application summary and clear section navigation.
- Separate details content into focused sections for overview/activity, notes, follow-ups, interviews, and timeline/history.
- Move note, follow-up, and interview creation forms behind explicit actions instead of always rendering all forms in the panel.
- Split interview scheduling from interview outcome recording.
- Remove outcome selection from the schedule-interview flow; newly scheduled interviews start as `Scheduled`.
- Add a dedicated record-outcome action for existing interviews.
- Prevent scheduling interviews and creating active follow-ups on closed applications unless they are reopened.
- Preserve the ability to add notes to closed applications as historical context.
- Improve detail-form validation so missing date/time inputs produce user-facing messages instead of raw parse errors.
- Update tests across presentation, frontend domain/application behavior, mock GraphQL/MSW behavior, backend use cases, and backend GraphQL adapter contracts.

## Capabilities

### New Capabilities

- `application-details-workspace`: Defines the application details workspace UX, section navigation, progressive creation forms, and closed-application action availability.

### Modified Capabilities

- `error-visibility`: Details-panel validation and command errors must remain near the active section/action and use user-facing copy for missing date/time inputs.
- `mutation-loading-states`: Details-panel controls must expose and consume pending states for scheduling interviews, recording interview outcomes, creating follow-ups, and adding notes.
- `pipeline-workspace-decomposition`: Workspace coordination must support details-section state and separate interview schedule/outcome command wrappers without moving server-state ownership out of `useJobApplications`.
- `go-backend-use-cases`: Backend interview and follow-up use cases must enforce active-stage rules, schedule interviews with `Scheduled` outcome, and record interview outcomes separately.
- `go-backend-graphql-adapter`: GraphQL mutations and frontend operation contracts must reflect separate schedule-interview and record-interview-outcome workflows.

## Impact

- Frontend presentation: `ApplicationDetails`, slide-over details usage, section navigation, action forms, and related tests.
- Frontend state/application: `usePipelineWorkspace`, `useJobApplications`, command status wiring, domain rules, gateway port, GraphQL gateway, MSW handlers, and mock backend.
- Backend application/domain: interview scheduling rules, record-interview-outcome behavior, follow-up action rules for closed applications, and tests.
- Backend GraphQL: schema/input shapes, generated code, resolvers, value mapping, and contract tests.
- No new runtime dependencies are expected.
