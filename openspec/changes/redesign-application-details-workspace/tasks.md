## 1. Characterization And Test Coverage

- [x] 1.1 Add presentation tests for details workspace section navigation, section counts, and persistent application summary context.
- [x] 1.2 Add presentation tests proving note, follow-up, and interview forms are hidden until their explicit actions are chosen and can be cancelled.
- [x] 1.3 Add presentation tests for closed applications hiding follow-up/interview actions while allowing notes.
- [x] 1.4 Add frontend domain/application tests for schedule-interview defaulting to `Scheduled`, closed-stage rejection, and record-interview-outcome behavior.
- [x] 1.5 Add backend use-case tests for schedule-interview valid stages, invalid closed/offer/saved stages, scheduled default outcome, and record-interview-outcome behavior.
- [x] 1.6 Add GraphQL/gateway contract tests for schedule-interview without outcome and record-interview-outcome as a separate operation.

## 2. Frontend Details Workspace UX

- [x] 2.1 Refactor `ApplicationDetails` into a workspace with an application summary header and internal section navigation.
- [x] 2.2 Add section count indicators for notes, follow-ups, interviews, and timeline.
- [x] 2.3 Split Notes, Follow-ups, Interviews, and Timeline into focused section components or small local render functions.
- [x] 2.4 Move the note form behind an `Add note` action with cancel behavior and existing input preservation on failure.
- [x] 2.5 Move the follow-up form behind a `Create follow-up` action with cancel behavior and existing input preservation on failure.
- [x] 2.6 Move the interview scheduling form behind a `Schedule interview` action with cancel behavior and existing input preservation on failure.
- [x] 2.7 Keep Timeline read-only with no creation form.

## 3. Frontend Workflow Semantics

- [x] 3.1 Remove outcome from the frontend schedule-interview command, form state, domain function, gateway port, GraphQL gateway operation, MSW handler, and mock backend scheduling path.
- [x] 3.2 Default newly scheduled frontend/mock interviews to outcome `Scheduled`.
- [x] 3.3 Add frontend record-interview-outcome command types, domain function, application wrapper, gateway port method, GraphQL gateway operation, MSW handler, and mock backend behavior.
- [x] 3.4 Add `recordInterviewOutcomeStatus` and command wrapper through `useJobApplications` and `usePipelineWorkspace`.
- [x] 3.5 Add interview-list UI for recording `Passed`, `Rejected`, or `No decision` on existing interviews.
- [x] 3.6 Enforce frontend closed-application restrictions for creating follow-ups and scheduling interviews.

## 4. Validation And Error UX

- [x] 4.1 Add user-facing validation for missing follow-up date or time before showing command errors.
- [x] 4.2 Add user-facing validation for missing interview date or time before showing command errors.
- [x] 4.3 Ensure raw parser errors are mapped to stable, understandable messages in details workflows.
- [x] 4.4 Keep details workflow errors scoped to the active section/action and clear them on retry, success, or close.

## 5. Backend Workflow Semantics

- [x] 5.1 Remove outcome from the backend schedule-interview command and set scheduled interviews to `OutcomeScheduled` in the use case.
- [x] 5.2 Restrict backend schedule-interview to Applied, Screening, Technical interview, and Onsite stages.
- [x] 5.3 Reject backend schedule-interview for Saved, Offer, Rejected, and Withdrawn stages without persistence changes.
- [x] 5.4 Implement or update backend record-interview-outcome use case to return the updated application and reject `Scheduled` as a final outcome.
- [x] 5.5 Reject backend follow-up creation for Rejected and Withdrawn applications without persistence changes.
- [x] 5.6 Update backend domain errors and GraphQL error mapping for invalid active-work actions and invalid interview outcomes.

## 6. GraphQL And Contract Updates

- [x] 6.1 Update `apps/api/graph/schema.graphqls` so `ScheduleInterviewInput` has no outcome field and record-interview-outcome returns the updated application.
- [x] 6.2 Regenerate gqlgen output and update resolvers/value mapping.
- [x] 6.3 Update frontend GraphQL operation strings and response mapping for the changed interview workflows.
- [x] 6.4 Update MSW GraphQL handlers to match the real backend schema.
- [x] 6.5 Verify frontend gateway operations validate against the backend schema.

## 7. Verification

- [x] 7.1 Run the frontend test suite for `apps/web`.
- [x] 7.2 Run the backend Go test suite for `apps/api`.
- [x] 7.3 Build the frontend and backend where applicable.
- [x] 7.4 Inspect the running application details workspace in Chrome at desktop and mobile widths.
- [x] 7.5 Run `openspec validate redesign-application-details-workspace --strict`.
