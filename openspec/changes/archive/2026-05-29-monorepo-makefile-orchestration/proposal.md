## Why

The root `package.json` uses npm workspaces as the monorepo orchestrator, but half the codebase (`apps/api`) is Go — a language that has no participation in npm workspaces. This creates a misleading mental model for contributors and ties developer tooling to Node even when working exclusively on the backend. Replacing it with a language-neutral root `Makefile` makes the repo structure honest and lowers the onboarding cost for developers who don't need Node at all.

## What Changes

- Add a root `Makefile` with top-level targets (`dev`, `build`, `test`, `lint`) that delegate to each app's native toolchain
- Strip npm workspace semantics from the root `package.json` (remove `workspaces` field and workspace-only scripts); keep only fields required by tooling that genuinely needs a root `package.json` (e.g. `msw` config)
- Document the new entry points in the root `README.md`

## Capabilities

### New Capabilities

- `monorepo-orchestration`: A root Makefile that coordinates build, dev, test, and lint across `apps/api` (Go) and `apps/web` (Node/Vite) without requiring a shared runtime

### Modified Capabilities

<!-- No existing spec-level behavior changes — this is a developer tooling restructure only -->

## Impact

- **Root `package.json`**: `workspaces` field and workspace-targeted scripts removed; `msw` config retained
- **Root `Makefile`**: new file; becomes the primary developer entry point
- **`apps/api/Makefile`**: may need target alignment so root targets can delegate cleanly
- **`apps/web/package.json`**: unchanged; its scripts are invoked by the root Makefile via `npm --prefix`
- **CI pipelines**: any workflow steps that run root-level npm scripts will need updating to use `make` targets
- **README**: updated to reflect new `make dev` / `make test` entry points
