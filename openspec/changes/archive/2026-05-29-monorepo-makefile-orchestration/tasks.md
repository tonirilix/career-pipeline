## 1. Root Makefile

- [x] 1.1 Create root `Makefile` with `dev-api` target that delegates to `$(MAKE) -C apps/api run`
- [x] 1.2 Add `dev-web` target that runs `npm --prefix apps/web run dev`
- [x] 1.3 Add `dev` target that runs `dev-api` and `dev-web` concurrently with labeled output
- [x] 1.4 Add `test-api` target that delegates to `$(MAKE) -C apps/api test`
- [x] 1.5 Add `test-web` target that runs `npm --prefix apps/web run test`
- [x] 1.6 Add `test` target that runs `test-api` and `test-web` sequentially
- [x] 1.7 Add `build-api` target that delegates to `$(MAKE) -C apps/api build`
- [x] 1.8 Add `build-web` target that runs `npm --prefix apps/web run build`
- [x] 1.9 Add `build` target that runs `build-api` and `build-web`
- [x] 1.10 Add `db-up`, `db-down`, `db-reset` targets that delegate to `apps/api/Makefile`
- [x] 1.11 Add `help` target as the default (`first`) target, listing all targets with descriptions
- [x] 1.12 Mark all targets as `.PHONY`

## 2. Root package.json Cleanup

- [x] 2.1 Remove `workspaces` field from root `package.json`
- [x] 2.2 Remove `scripts.dev` and `scripts.test` from root `package.json`
- [x] 2.3 Verify `msw.workerDirectory` field is retained

## 3. Documentation

- [x] 3.1 Update root `README.md` to document `make help` and list primary targets (`dev`, `test`, `build`, `db-up`)
- [x] 3.2 Remove any README references to root-level `npm run` commands

## 4. Verification

- [x] 4.1 Run `make test` from repo root and confirm both API and web test suites pass
- [x] 4.2 Run `make build` from repo root and confirm Go binary and Vite bundle are produced
- [x] 4.3 Run `make db-up` and confirm Postgres container starts
- [x] 4.4 Run `make help` and confirm all targets are listed with descriptions
- [x] 4.5 Run `npm install` at repo root and confirm no workspace resolution errors
