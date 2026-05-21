## Context

The frontend already has domain and application-layer error shapes for validation and command failures. `App.tsx` keeps separate state for form field errors, form command errors, and board-level command errors, while `OpportunityForm` and `ApplicationDetails` own the visible controls that trigger most failures.

Today, board-level failures render above the pipeline, create-form validation failures render inside the add-opportunity slide-over, and several detail-panel failures are only written to the board-level `commandError`. Because the detail slide-over overlays the board, those failures can be hidden behind the active panel. Detail-panel submit handlers also reset local form state immediately after awaiting the callback, even when the callback handled a failed command by setting an error.

## Goals / Non-Goals

**Goals:**

- Make every validation, load, and command failure visible in the user's current workflow.
- Preserve entered values when a detail-panel command fails.
- Keep the error state in the presentation layer and avoid leaking UI concerns into domain, application, infrastructure, or GraphQL code.
- Use existing design tokens, shadcn/ui primitives, and accessible alert semantics.
- Cover the behavior with focused presentation tests.

**Non-Goals:**

- Do not change domain validation rules, use case result types, or gateway port contracts.
- Do not introduce toast infrastructure or a global notification dependency.
- Do not change the GraphQL schema, MSW response shapes, or backend error mapping.
- Do not add optimistic update behavior.

## Decisions

### D1: Route errors to the active workflow

Errors from the main pipeline load and stage-transition workflows stay in the main content alert region. Errors from add-opportunity stay in the opportunity form. Errors from application details workflows are passed into `ApplicationDetails` and displayed inside the details slide-over.

**Rationale:** Users should not have to close a panel to see why the panel action failed. Keeping errors local also makes tests target user-observable behavior more directly.

**Alternative considered:** Use one global banner for all errors. Rejected because slide-over workflows can obscure it and because global-only errors do not identify which detail action failed.

### D2: Return success state from detail command callbacks

`ApplicationDetails` should only clear a local form after its callback reports success. The parent can continue to own command execution and application list updates, but the child needs a boolean result to decide whether to reset form state.

**Rationale:** This preserves separation between presentation orchestration and local form state while preventing data loss on failures.

**Alternative considered:** Let `ApplicationDetails` own command execution. Rejected because it would pull gateway/use case orchestration into a presentational component and blur the existing architecture boundary.

### D3: Use persistent inline alerts instead of ephemeral toasts

Error messages remain visible until the related command succeeds, the user closes the slide-over, or a new attempt clears/replaces the message.

**Rationale:** The app is a work-focused tracker. Persistent alerts are simpler, testable, accessible, and consistent with existing form validation behavior.

**Alternative considered:** Add a toast system. Rejected because it adds dependency and lifecycle complexity for a small set of command failures and makes form-specific recovery harder.

## Risks / Trade-offs

- Multiple detail workflows share one panel-level command error, so the message must be specific enough to identify the failed action -> Use application-layer failure messages and place the alert near the detail forms.
- Changing callback return types touches `App.tsx`, `ApplicationDetails`, and tests together -> Keep the type change local to presentation props and avoid changing application use case result types.
- Alerts can become visually noisy if every field also gets a banner -> Keep field validation in the add-opportunity form list and command failures in one alert per active workflow.
