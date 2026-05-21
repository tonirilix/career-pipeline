## 1. Error State Routing

- [x] 1.1 Add separate details-workflow command error state in `App.tsx`
- [x] 1.2 Route note, follow-up, and interview failures to the details error state instead of the board-level command error
- [x] 1.3 Clear details errors when the details panel closes and before a new details command attempt starts
- [x] 1.4 Preserve existing board-level error handling for initial load and stage-transition failures

## 2. Details Workflow Feedback

- [x] 2.1 Update `ApplicationDetails` callback props to report whether each command succeeded
- [x] 2.2 Reset note, follow-up, and interview form state only after successful callbacks
- [x] 2.3 Render a persistent `role="alert"` details error inside the application details slide-over
- [x] 2.4 Style details workflow errors with the existing destructive token and bordered alert treatment

## 3. Form Error Accessibility

- [x] 3.1 Add alert semantics to the add-opportunity validation error list
- [x] 3.2 Ensure add-opportunity command errors use the same prominent bordered alert treatment
- [x] 3.3 Verify closing the add-opportunity slide-over clears validation and command errors before the next open

## 4. Tests

- [x] 4.1 Add or update presentation tests for visible load and stage-transition errors
- [x] 4.2 Add or update presentation tests for add-opportunity validation and command errors
- [x] 4.3 Add presentation tests for visible note, follow-up, and interview errors inside the details slide-over
- [x] 4.4 Add presentation tests proving failed note, follow-up, and interview inputs are preserved
- [x] 4.5 Run the web test suite and fix regressions
