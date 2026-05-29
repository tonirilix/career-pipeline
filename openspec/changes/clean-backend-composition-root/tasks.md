## 1. Configuration Extraction

- [x] 1.1 Add backend configuration tests for required `DATABASE_URL`, default `PORT`, explicit `PORT`, default `APP_ENV`, and development mode.
- [x] 1.2 Extract environment parsing into a focused internal configuration module.
- [x] 1.3 Update `cmd/api/main.go` to use the configuration module without changing current defaults or error messages materially.

## 2. Database Bootstrap Extraction

- [x] 2.1 Add tests for database preparation decisions: migrate-only exits after migrations, seed-only skips non-empty databases, seed-only seeds empty databases, and normal startup seeds only when empty.
- [x] 2.2 Move migration filesystem handling, migration execution, seed SQL execution, and empty-database detection out of `main.go` into a focused bootstrap module.
- [x] 2.3 Ensure bootstrap functions return errors and continuation decisions instead of calling `log.Fatal` or exiting the process.

## 3. Application Composition Extraction

- [x] 3.1 Add a composition test or compile-time assertions proving the composed resolver has every required Job Application use case wired.
- [x] 3.2 Extract repository, assembler, transactor, clock, ID generator, use-case, and resolver construction into a focused composition module.
- [x] 3.3 Keep all dependency wiring explicit through constructor calls; do not introduce global registries, reflection, or a dependency injection container.
- [x] 3.4 Keep generated GraphQL, persistence adapters, and use cases connected only from the composition root or composition module.

## 4. HTTP Server Extraction

- [x] 4.1 Add server tests proving `/graphql` is mounted, development mode mounts the playground at `/`, non-development mode does not mount the playground, and CORS handles OPTIONS.
- [x] 4.2 Move gqlgen handler construction, transport/introspection setup, playground routing, CORS middleware, and port/address derivation into a focused server module.
- [x] 4.3 Update `main.go` to call the server module and remain responsible only for final startup logging and `http.ListenAndServe`.

## 5. Entrypoint Cleanup and Architecture Protection

- [x] 5.1 Reduce `cmd/api/main.go` to process orchestration: parse flags, load configuration, prepare database, compose dependencies, build handler, start server.
- [x] 5.2 Add or update backend architecture tests proving domain and application packages do not import configuration, bootstrap, composition, server, GraphQL, persistence, database, migration, or HTTP packages.
- [x] 5.3 Add or update backend architecture tests proving adapter/use-case/resolver wiring stays in the composition root or composition module.
- [x] 5.4 Remove duplicated helper functions from `main.go` after extraction.

## 6. Verification

- [x] 6.1 Run `go test ./...` from `apps/api`.
- [x] 6.2 Run `go build ./...` from `apps/api`.
- [x] 6.3 Run `openspec validate clean-backend-composition-root`.
- [x] 6.4 Run `openspec status --change clean-backend-composition-root` and confirm the change is apply-ready.
