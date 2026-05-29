## Purpose

Defines how the root `Makefile` and `package.json` orchestrate the `apps/api` (Go) and `apps/web` (Node/Vite) workloads, giving developers a single, consistent entry point for common tasks without needing to know each app's native toolchain.

---

## Requirements

### Requirement: Root Makefile provides unified entry point
The root `Makefile` SHALL expose targets that coordinate both `apps/api` (Go) and `apps/web` (Node/Vite) without requiring developers to know each app's native toolchain commands.

#### Scenario: Developer starts both apps with a single command
- **WHEN** a developer runs `make dev` from the repo root
- **THEN** both the Go API server and the Vite dev server start concurrently in the same terminal session

#### Scenario: Developer runs all tests
- **WHEN** a developer runs `make test` from the repo root
- **THEN** both `apps/api` Go tests and `apps/web` Vitest tests run and their results are reported

#### Scenario: Developer builds both apps
- **WHEN** a developer runs `make build` from the repo root
- **THEN** the Go binary is compiled and the Vite production bundle is generated

---

### Requirement: App-scoped targets available
The root `Makefile` SHALL provide app-scoped variants for each top-level target so developers can operate on one app without starting the other.

#### Scenario: Developer works on API only
- **WHEN** a developer runs `make dev-api`, `make test-api`, or `make build-api`
- **THEN** only `apps/api` commands execute; no Node process is started

#### Scenario: Developer works on web only
- **WHEN** a developer runs `make dev-web`, `make test-web`, or `make build-web`
- **THEN** only `apps/web` npm scripts execute; no Go toolchain is invoked

---

### Requirement: Database lifecycle targets accessible from root
The root `Makefile` SHALL expose database management targets that delegate to `apps/api/Makefile`.

#### Scenario: Developer starts the database
- **WHEN** a developer runs `make db-up` from the repo root
- **THEN** the Postgres container defined in `apps/api/compose.yaml` starts

#### Scenario: Developer resets the database
- **WHEN** a developer runs `make db-reset` from the repo root
- **THEN** the Postgres container is torn down, its volume removed, and a fresh container started

---

### Requirement: Help target documents available commands
The root `Makefile` SHALL include a `help` target that lists all available targets with a brief description.

#### Scenario: Developer discovers available commands
- **WHEN** a developer runs `make help` (or just `make` with help as the default)
- **THEN** a formatted list of targets and their descriptions is printed to stdout

---

### Requirement: Root package.json retains only necessary fields
The root `package.json` SHALL NOT declare npm workspaces or contain scripts that duplicate Makefile targets. It SHALL retain only fields required by tooling that genuinely needs a root-level `package.json`.

#### Scenario: msw worker initialisation still works
- **WHEN** a developer runs `npx msw init` or the msw setup script
- **THEN** the worker file is placed in `apps/web/public` as configured by the `msw.workerDirectory` field

#### Scenario: npm install at root does not attempt to hoist Go project
- **WHEN** a developer runs `npm install` at the repo root
- **THEN** no workspace resolution error occurs for `apps/api`
