## 1. Install sqlc and configure tooling

- [x] 1.1 Install sqlc CLI locally (`brew install sqlc` or `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`)
- [x] 1.2 Write `sqlc.yaml` at `apps/api/internal/infrastructure/persistence/sqlc.yaml` pointing at the migration schema files and `queries/` directory
- [x] 1.3 Add `overrides` in `sqlc.yaml` to map nullable timestamp columns (`completed_at`, `occurred_at`) to `*time.Time`
- [x] 1.4 Add a `make sqlc` target in the root `Makefile` that runs `sqlc generate` from the persistence directory

## 2. Write SQL query files

- [x] 2.1 Create `queries/job_applications.sql` with annotated queries for insert, select by ID, select list, and update stage
- [x] 2.2 Create `queries/interviews.sql` with annotated queries for insert, select by ID, update outcome, and list by application
- [x] 2.3 Create `queries/follow_ups.sql` with annotated queries for insert, select by ID, update completed, list by application, list upcoming, list overdue, and deactivate by application
- [x] 2.4 Create `queries/notes.sql` with annotated queries for insert and list by application
- [x] 2.5 Create `queries/timeline_events.sql` with annotated query for insert

## 3. Generate and verify typed query code

- [x] 3.1 Run `make sqlc` and fix any schema reference or type mapping errors in `sqlc.yaml`
- [x] 3.2 Confirm `internal/infrastructure/persistence/db/` contains a generated file per query file and a `db.go` with the `Queries` struct
- [x] 3.3 Run `go build ./...` to confirm the generated package compiles cleanly

## 4. Migrate repository adapters one aggregate at a time

- [x] 4.1 Update `postgresql_follow_up_repo.go` to use `*db.Queries` instead of hand-written scan helpers; run `go test ./...`
- [x] 4.2 Update `postgresql_interview_repo.go`; run `go test ./...`
- [x] 4.3 Update `postgresql_note_repo.go`; run `go test ./...`
- [x] 4.4 Update `postgresql_job_application_repo.go`; run `go test ./...`
- [x] 4.5 Update `postgresql_timeline_repo.go`; run `go test ./...`
- [x] 4.6 Update constructor signatures to accept `*db.Queries` and wire the transactor to pass a transaction-scoped `*db.Queries` for write use-cases

## 5. Remove hand-written query code

- [x] 5.1 Delete `postgresql_queries.go`
- [x] 5.2 Confirm no remaining `scan*` helper functions exist in the persistence package (`grep -r "func scan" apps/api/internal/infrastructure/persistence/`)
- [x] 5.3 Run `go test ./...` one final time; all tests must pass

## 6. Update documentation

- [x] 6.1 Update ADR 0003 status from "Open" to "Accepted" and note sqlc as the chosen strategy
- [x] 6.2 Add a "Query generation" section to the backend README documenting `make sqlc` and when to run it
