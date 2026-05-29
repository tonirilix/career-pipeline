## 1. Characterization Coverage

- [x] 1.1 Add focused tests for Application Details section navigation, section counts, and persistent application summary context.
- [x] 1.2 Add focused tests for note, follow-up, interview scheduling, and interview outcome action-form open/cancel behavior.
- [x] 1.3 Add focused tests proving detail workflow inputs remain after command failure and reset after success.
- [x] 1.4 Add focused tests proving command pending statuses disable the corresponding detail workflow submit controls.

## 2. Module Structure

- [x] 2.1 Create a details-workspace module folder under `apps/web/src/presentation/components/`.
- [x] 2.2 Move details-only shared primitives into local modules: section header, section button/navigation, form actions, date/time fields, and details error notice.
- [x] 2.3 Move details-only date sorting/formatting helpers into a local helper module.
- [x] 2.4 Keep global `components/ui` unchanged unless an existing non-details caller needs the helper.

## 3. Section Extraction

- [x] 3.1 Extract the overview section into a focused module with no writable workflow state.
- [x] 3.2 Extract the timeline section into a focused read-only module.
- [x] 3.3 Extract the notes section with note draft state, validation/error display, submit, cancel, success reset, and failure preservation.
- [x] 3.4 Extract the follow-ups section with due date/time/note state, validation/error display, submit, cancel, success reset, and failure preservation.
- [x] 3.5 Extract the interviews section with schedule-interview state, record-outcome state, validation/error display, submit, cancel, success reset, and failure preservation.

## 4. Coordinator Cleanup

- [x] 4.1 Reduce `ApplicationDetails.tsx` to the public entry point and coordinator for application data, active section, active action, and section props.
- [x] 4.2 Preserve the current `ApplicationDetails` prop interface used by `App`.
- [x] 4.3 Preserve existing accessibility labels, section labels, section counts, command error placement, and pending-state behavior.
- [x] 4.4 Ensure `App` continues to render only `ApplicationDetails` inside the details `SlideOver`.

## 5. Architecture Protection

- [x] 5.1 Add a frontend architecture test that verifies Application Details section rendering lives in focused details-workspace modules.
- [x] 5.2 Add a frontend architecture test or threshold that prevents `ApplicationDetails.tsx` from returning to a monolithic implementation.
- [x] 5.3 Ensure the new details-workspace modules do not import infrastructure modules or TanStack Query directly.

## 6. Verification

- [x] 6.1 Run `npm test --workspace apps/web`.
- [x] 6.2 Run `npm run build --workspace apps/web`.
- [x] 6.3 Run `openspec status --change deepen-application-details-workspace` and confirm the change remains apply-ready.
