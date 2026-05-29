## Context

The repo is an npm-workspace monorepo (`apps/web` React/Vite, `apps/api` Go). The root `package.json` uses `"workspaces": ["apps/*"]` as the coordination mechanism, but Go has no participation in npm workspaces — `apps/api` is simply ignored by npm. The API already has its own `Makefile` with well-named targets (`build`, `run`, `test`, `db-up`, etc.). The web app exposes all operations through `package.json` scripts (`dev`, `test`, `build`).

The goal is a root `Makefile` that delegates to both, with no new runtime dependency and no change to either app's internals.

## Goals / Non-Goals

**Goals:**
- Single entry point (`make <target>`) for common dev tasks across both apps
- Remove `workspaces` and workspace-only scripts from root `package.json`
- Retain root `package.json` fields that tooling genuinely requires (`msw.workerDirectory`)
- Keep each app's own toolchain untouched (no changes to `apps/api/Makefile` or `apps/web/package.json`)

**Non-Goals:**
- Containerisation (separate change)
- Consolidating or sharing build tooling between Go and Node
- Monorepo tooling (Turborepo, Nx, Bazel) — overkill for two apps
- Changing CI workflows (follow-on, once the local DX is settled)

## Decisions

### Root Makefile delegates via `--prefix` / `$(MAKE) -C`

**Decision:** The root Makefile calls `npm --prefix apps/web <script>` for web targets and `$(MAKE) -C apps/api <target>` for API targets. No wrapper scripts, no shared config.

**Why:** Both delegation forms are standard, require zero new tooling, and keep each app's Makefile/package.json as the authoritative source of truth for its own commands. Anyone working in one app can continue using its native toolchain directly.

**Alternatives considered:**
- Shell scripts (`scripts/dev.sh`) — less discoverable, no tab-completion, no `--help` convention
- Turborepo — adds a dependency and a mental model for two apps with no shared packages

### Parallel dev target

**Decision:** `make dev` runs `apps/api` (`make -C apps/api run`) and `apps/web` (`npm --prefix apps/web run dev`) concurrently using `&` with a `wait`, printed with a clear prefix per service.

**Why:** Developers typically want both servers running while working. Running them in parallel in one terminal matches the current `npm run dev` UX without requiring multiple terminals or a process manager.

**Alternatives considered:**
- `make dev-api` and `make dev-web` as separate targets only — valid, but forces two terminals for the default workflow

### Root `package.json` retained (minimally)

**Decision:** Keep root `package.json` but remove `workspaces`, `scripts.dev`, and `scripts.test`. Retain only the `msw.workerDirectory` field (required for Mock Service Worker's `npx msw init` to know where to copy the worker).

**Why:** Deleting the file entirely would break `msw` setup. Any other fields (name, private, type) are harmless to keep.

## Risks / Trade-offs

- **`make dev` parallel output is interleaved** → Mitigation: prefix each line with `[api]` / `[web]` using `sed` or shell redirection. Acceptable for a dev tool; not worth a dependency like `foreman`.
- **Developers unfamiliar with Make** → Mitigation: `make help` target that lists available targets with descriptions; document in README.
- **`npm --prefix` requires Node in PATH even for API-only work** → Acceptable: the `make dev-api` and `make test-api` targets call only Go tooling, so Go-only contributors never need Node.
- **CI pipelines still call npm root scripts** → Out of scope for this change, but a follow-on task should update workflows to `make test` / `make build`.

## Migration Plan

1. Add root `Makefile` with targets: `dev`, `dev-api`, `dev-web`, `build`, `build-api`, `build-web`, `test`, `test-api`, `test-web`, `db-up`, `db-down`, `db-reset`, `help`
2. Remove `workspaces`, `scripts.dev`, `scripts.test` from root `package.json`
3. Update root `README.md` to document `make` entry points
4. Verify: `make test` passes, `make build` succeeds for both apps

Rollback: revert the root `Makefile` addition and restore the removed `package.json` fields — both apps remain independently runnable throughout.
