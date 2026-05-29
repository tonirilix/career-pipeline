## Why

Running the full stack today requires installing Go, Node, and Docker separately, and wiring them up manually. Containerising the entire project gives any developer a single command to start a working environment, and produces deployment-ready images as a byproduct of the same Dockerfile investment.

## What Changes

- Add `Dockerfile.api` at the repo root — multi-stage: Go builder → minimal `alpine` runtime
- Add `Dockerfile.web` at the repo root — multi-stage: Node builder (Vite build) → nginx runtime
- Add root `compose.yaml` for **development**: postgres + api (with `air` hot reload) + web (Vite HMR), all with source volume mounts — **BREAKING**: replaces `apps/api/compose.yaml` (which currently only runs postgres)
- Add root `compose.prod.yaml` for **production smoke testing**: builds and runs the compiled images locally before pushing to a registry
- Add Makefile targets: `docker-dev`, `docker-down`, `docker-build`, `docker-prod`
- Add `.dockerignore` files for api and web to keep image layers lean

## Capabilities

### New Capabilities

- `docker-dev-environment`: A root `compose.yaml` that runs the full development stack (postgres, Go API with hot reload, Vite with HMR) inside containers with source volume mounts
- `docker-prod-images`: Multi-stage Dockerfiles and `compose.prod.yaml` that build and run minimal production images for local verification before deployment

### Modified Capabilities

- `monorepo-orchestration`: New `docker-*` Makefile targets extend the existing orchestration surface; no requirement changes, implementation only

## Impact

- **`apps/api/compose.yaml`**: superseded by root `compose.yaml`; the existing file can be kept as a fallback for postgres-only workflows or removed
- **`apps/api/Makefile`**: `db-up` / `db-down` / `db-reset` targets that reference `docker compose` will need to point to the root compose file (or remain as-is for native-only workflows)
- **Root `Makefile`**: new `docker-*` targets added; existing `dev`, `test`, `build` targets remain unchanged for native workflows
- **New files**: `Dockerfile.api`, `Dockerfile.web`, `compose.yaml` (root), `compose.prod.yaml`, `apps/api/.dockerignore`, `apps/web/.dockerignore`
- **Dependencies**: `air` (Go live-reload tool) added as a dev-only container dependency; nginx used as the web production runtime
