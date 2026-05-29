## 1. Update port interfaces

- [x] 1.1 Add `ctx context.Context` as first parameter to all methods in `JobApplicationRepository` interface (`internal/application/ports/repositories.go`)
- [x] 1.2 Add `ctx context.Context` as first parameter to all methods in `InterviewRepository` interface
- [x] 1.3 Add `ctx context.Context` as first parameter to all methods in `FollowUpRepository` interface
- [x] 1.4 Add `ctx context.Context` as first parameter to all methods in `NoteRepository` interface
- [x] 1.5 Add `ctx context.Context` as first parameter to all methods in `TimelineRepository` interface
- [x] 1.6 Add `ctx context.Context` as first parameter to `Transactor.WithTransaction` in `internal/application/ports/supporting.go`
- [x] 1.7 Run `go build ./...` — expect compile errors in all implementors; use the list to guide remaining tasks

## 2. Update persistence adapters

- [x] 2.1 Update all methods in `postgresql_job_application_repo.go` to accept `ctx context.Context` and pass it to `r.q.*` and `r.dbtx.QueryContext` calls
- [x] 2.2 Update all methods in `postgresql_interview_repo.go` to accept and forward `ctx`
- [x] 2.3 Update all methods in `postgresql_follow_up_repo.go` to accept and forward `ctx`
- [x] 2.4 Update all methods in `postgresql_note_repo.go` to accept and forward `ctx`
- [x] 2.5 Update all methods in `postgresql_timeline_repo.go` to accept and forward `ctx`
- [x] 2.6 Update `postgresql_transactor.go`: accept `ctx context.Context` in `WithTransaction`; pass it to `db.BeginTx` instead of `db.Begin`

## 3. Update use cases

- [x] 3.1 Update `create_application.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.2 Update `advance_stage.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.3 Update `schedule_interview.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.4 Update `record_interview_outcome.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.5 Update `add_follow_up.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.6 Update `complete_follow_up.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.7 Update `add_note.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.8 Update `get_application.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.9 Update `list_applications.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.10 Update `list_follow_ups.go`: add `ctx` to `Execute` signature; pass to all port calls
- [x] 3.11 Update `application_assembler.go` and `direct_transactor.go` if they call port methods directly

## 4. Update GraphQL resolvers

- [x] 4.1 Update all resolver methods in `graph/resolvers/schema.resolvers.go` to pass `ctx` as first argument to every use case `Execute` call
- [x] 4.2 Run `go build ./...` — should compile cleanly

## 5. Update test fakes and call sites

- [x] 5.1 Update all fake repository structs in `usecases/fakes_test.go` to add `ctx context.Context` as first parameter to every method
- [x] 5.2 Update all use case test call sites in `usecases_test.go` to pass `context.Background()` as first argument to `Execute`
- [x] 5.3 Run `go test ./...` — all tests must pass
