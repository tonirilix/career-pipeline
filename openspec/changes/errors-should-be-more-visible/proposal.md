## Why

Command and validation failures are currently easy to miss because some errors appear only as small inline text, some detail-panel command failures are surfaced outside the active panel, and successful submit handlers can clear local form state even when the requested action fails. Users need failure feedback to stay close to the action they attempted and remain visible until they correct it or retry.

## What Changes

- Add a user-facing error visibility contract for the React presentation layer.
- Present global load and board-level command failures in a prominent alert region.
- Present slide-over form and detail-panel command failures inside the active slide-over, near the related workflow.
- Keep failed detail-panel form inputs intact so users can correct and resubmit without re-entering data.
- Ensure validation and command errors use accessible alert semantics and existing destructive design tokens.
- Add tests for visible error states on create, stage transition, note, follow-up, and interview workflows.

## Capabilities

### New Capabilities
- `error-visibility`: User-facing validation, load, and command errors are visible, accessible, persistent, and shown near the workflow that produced them.

### Modified Capabilities
- `design-system`: Error message presentation must use the existing destructive token and consistent alert affordances across the presentation layer.
- `pipeline-layout`: Errors produced inside slide-over workflows must render inside the active slide-over instead of only in the main board area.

## Impact

- Affected code: `apps/web/src/presentation/App.tsx`, `apps/web/src/presentation/components/OpportunityForm.tsx`, `apps/web/src/presentation/components/ApplicationDetails.tsx`, and focused presentation tests.
- No GraphQL schema, backend API, domain model, or application use case contract changes are expected.
- No new runtime dependencies are expected.
