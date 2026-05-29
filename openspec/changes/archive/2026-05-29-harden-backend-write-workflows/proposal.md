## Why

The backend write workflow shape is almost consistent, but `CreateApplication` still performs a multi-record write outside the transaction seam. Before publishing the repository, the backend should demonstrate the same atomicity and typed domain failure discipline for application intake that it already uses for stage and detail workflows.

## What Changes

- Move `CreateApplication` through the existing `Transactor` seam so saving the Job Application and creating its initial timeline event succeed or roll back together.
- Replace the current reuse of `ErrNoteBodyEmpty` for missing company or role title with domain errors that describe opportunity intake failures.
- Keep all timestamps and IDs supplied by the existing `Clock` and `IDGenerator` ports.
- Add use-case tests that prove create-application validation makes no writes and timeline failure rolls back the application insert.
- Add or tighten architecture tests so backend multi-record write workflows cannot bypass the transaction seam.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `go-backend-use-cases`: CreateApplication SHALL execute its multi-record write atomically and return specific domain validation errors for missing required intake fields.
- `go-backend-domain`: Domain error values SHALL distinguish missing opportunity company/role title from empty note body.
- `architecture-deepening`: Backend multi-step workflow atomicity SHALL explicitly cover the create-application workflow.

## Impact

- Affected backend code: `apps/api/internal/application/usecases/create_application.go`, use-case constructors, test fakes, and `apps/api/cmd/api/main.go` wiring.
- Affected backend domain code: `apps/api/internal/domain/errors.go` and GraphQL domain error mapping if user-facing messages need to remain stable.
- Affected tests: backend use-case tests and architecture tests under `apps/api/internal/application/usecases/`.
- No GraphQL schema, frontend contract, database schema, or external dependency changes are expected.
