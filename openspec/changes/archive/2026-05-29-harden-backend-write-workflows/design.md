## Context

The Go backend already uses explicit ports for repositories, clocks, ID generation, and transactions. Most write use cases that persist multiple records run behind the `Transactor` seam, but `CreateApplication` still receives concrete repository ports directly and writes the Job Application before writing the initial timeline event.

That makes application intake the outlier: a timeline write failure can leave a partially persisted application, and the validation path currently reuses `ErrNoteBodyEmpty` for missing company or role title. This change tightens the existing backend architecture rather than adding a new pattern.

## Goals / Non-Goals

**Goals:**

- Make `CreateApplication` atomic across the Job Application insert and initial timeline event insert.
- Keep all generated IDs and timestamps supplied by the existing `IDGenerator` and `Clock` ports.
- Use domain errors that describe missing application intake fields precisely.
- Preserve the GraphQL schema and frontend contract.
- Add tests that make the atomicity and error semantics hard to regress.

**Non-Goals:**

- Introduce sqlc, sqlx, or any new persistence dependency.
- Change the GraphQL schema or operation names.
- Refactor every backend workflow into a broader workflow abstraction.
- Change frontend behavior or client-side validation.

## Decisions

### Use the existing Transactor seam for CreateApplication

`CreateApplication` will receive `ports.Transactor`, `ports.Clock`, and `ports.IDGenerator`. Its validation will run before opening a transaction. Once validation succeeds, it will call `tx.WithTransaction`, use `repos.Applications.Save` and `repos.Timeline.Save`, and return the created application with its initial timeline event only after both writes succeed.

This keeps the implementation aligned with `AdvanceStage`, `ScheduleInterview`, `AddFollowUp`, `CompleteFollowUp`, `RecordInterviewOutcome`, and `AddNote`. An alternative would be to keep the constructor unchanged and add rollback behavior inside the repository adapter, but that would push workflow atomicity into persistence implementation details and weaken the application-layer seam.

### Add specific domain errors for required intake fields

The domain package will define typed errors for missing company and missing role title. `CreateApplication` will return those errors instead of `ErrNoteBodyEmpty`.

This preserves the existing `(result, error)` style while making callers able to distinguish opportunity intake failures with `errors.Is`. An alternative would be one generic validation error carrying field metadata, but that would be a larger error model change than this hardening pass needs.

### Keep GraphQL error messages stable through mapping

GraphQL resolvers already map expected domain errors before returning them. The mapper will include the new intake errors so clients receive stable, user-readable messages without needing schema changes.

An alternative would be to return raw domain error strings. That would expose internal naming choices through the GraphQL adapter and make later error wording changes harder.

### Strengthen tests at the use-case seam

Tests will cover three important paths: missing company/role title returns the new domain errors and makes no writes; timeline save failure rolls back the saved application; successful creation still returns a Saved application with one initial timeline event using the fake clock and ID generator.

Architecture tests should also protect the intended shape by making `CreateApplication` part of the multi-record workflow set that depends on the transaction seam.

## Risks / Trade-offs

- Constructor changes ripple into composition and tests → Update `cmd/api/main.go`, test setup, and any compile-time wiring in one pass.
- A naive test fake may not model rollback accurately → Reuse or extend the existing fake transactor so rollback assertions exercise the same seam as other write workflows.
- New domain errors may leak raw names to GraphQL clients → Extend domain error mapping alongside the use-case change.
- The architecture test can become brittle if it scans source text too broadly → Keep the test focused on the use-case package and the specific transaction/constructor shape being protected.
