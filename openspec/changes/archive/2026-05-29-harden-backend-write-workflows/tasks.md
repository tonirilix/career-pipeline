## 1. Domain Error Contract

- [x] 1.1 Add typed domain errors for missing company and missing role title.
- [x] 1.2 Update GraphQL domain error mapping so the new errors return stable user-facing messages.
- [x] 1.3 Add or update tests proving callers can distinguish the new errors with `errors.Is`.

## 2. Transactional CreateApplication Workflow

- [x] 2.1 Change `CreateApplication` to depend on `ports.Transactor`, `ports.Clock`, and `ports.IDGenerator`.
- [x] 2.2 Validate company and role title before opening a transaction and return the new domain errors.
- [x] 2.3 Persist the Job Application and initial timeline event inside `Transactor.WithTransaction`.
- [x] 2.4 Return the created Saved application with its initial timeline event after both writes succeed.

## 3. Wiring And Test Fakes

- [x] 3.1 Update backend composition wiring in `cmd/api/main.go` to construct `CreateApplication` with the transactor.
- [x] 3.2 Reuse or extend the use-case fake transactor setup so create-application rollback tests exercise the transaction seam.
- [x] 3.3 Update any affected constructor usage in backend tests.

## 4. Verification

- [x] 4.1 Add use-case tests for missing company, missing role title, successful creation, and timeline failure rollback.
- [x] 4.2 Tighten architecture tests so multi-record write workflows include `CreateApplication` behind the transaction seam.
- [x] 4.3 Run `go test ./...` from `apps/api`.
- [x] 4.4 Run `openspec status --change harden-backend-write-workflows` and confirm the change remains apply-ready.
