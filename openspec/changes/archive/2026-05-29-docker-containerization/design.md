## Context

The repo currently has one Docker artifact: `apps/api/compose.yaml`, which runs only the Postgres container. Developers start Go and Vite natively. The goal is to make the full stack runnable inside containers — both for a zero-install dev experience and to produce deployment-ready images.

Two distinct use cases must coexist:
- **Development**: fast feedback loop, source changes reflect instantly, no rebuild required
- **Deployment**: small, self-contained images with no dev tooling, suitable for pushing to a registry

The existing native workflow (`make dev`, `make test`, etc.) must remain fully functional. Containers are an additive option, not a replacement.

## Goals / Non-Goals

**Goals:**
- Full dev stack in containers with hot reload (Go via `air`, React via Vite HMR)
- Multi-stage Dockerfiles that produce minimal production images from the same files
- Root `compose.yaml` for development, `compose.prod.yaml` for local production verification
- New `docker-*` Makefile targets that wrap the compose workflows
- Source volume mounts in dev so the container reflects live edits without rebuild

**Non-Goals:**
- CI/CD pipeline configuration (out of scope)
- Kubernetes / Helm manifests (out of scope)
- Replacing the native dev workflow — `make dev` without Docker continues to work
- Running tests inside containers (test targets remain native)

## Decisions

### Multi-stage Dockerfiles (one per app, both targets in same file)

**Decision:** Each app has one Dockerfile with a `dev` stage and a `prod` stage. The compose files select the target stage via `build.target`.

**Why:** Single source of truth per app. Dev and prod share the same base layer definitions, so security patches propagate to both. Simpler than separate `Dockerfile.dev` / `Dockerfile.prod` files.

**Alternatives considered:**
- Separate Dockerfile per environment — more explicit but duplicates base image and COPY instructions
- BuildKit `--target` at the CLI level only — less ergonomic when using compose

### `air` for Go hot reload in dev

**Decision:** The dev stage installs `air` and uses it as the container entrypoint. The Go source is mounted as a volume.

**Why:** `air` watches `.go` files and re-runs `go build + run` on change — the closest equivalent to Vite HMR for Go. It is a dev-only dependency and never appears in the prod stage.

**Alternatives considered:**
- `CompileDaemon` — less actively maintained
- `watchexec` + custom script — more setup, same result
- Rebuilding the container on every change — defeats the purpose

### Vite dev server inside a container with HMR

**Decision:** The dev stage runs `npm run dev` (which already binds `--host 0.0.0.0`). Port 5173 is exposed. The Vite config's `server.watch` uses polling (`usePolling: true`) to detect changes through the Docker volume mount on Linux/Mac.

**Why:** Docker volume mounts on macOS (and Linux in some configurations) don't propagate inotify events reliably. Polling is the safe default; it has negligible CPU cost for a dev server.

**Alternatives considered:**
- Native file watchers only — breaks silently on many macOS + Docker Desktop setups
- Delegated volume mounts — deprecated in newer Docker Desktop versions

### nginx as the web production runtime

**Decision:** The prod stage for `Dockerfile.web` copies Vite's `dist/` output into an `nginx:alpine` image.

**Why:** nginx is the industry standard for serving static files: small image, battle-tested, handles SPA routing with a simple `try_files` config. No Node runtime needed in prod.

**Alternatives considered:**
- `node serve` — requires Node in the image, larger, no benefit over nginx for static files
- Caddy — excellent but less familiar; nginx is a safer default

### Root `compose.yaml` supersedes `apps/api/compose.yaml`

**Decision:** A new `compose.yaml` at the repo root manages all three services (postgres, api, web). The `apps/api/compose.yaml` is kept for developers who want postgres-only without the full stack.

**Why:** Centralising compose at the root aligns with the monorepo structure. The root Makefile already coordinates both apps; the compose file should too.

**Alternatives considered:**
- Extend `apps/api/compose.yaml` in place — puts multi-app config in an app-specific directory, which is confusing
- Remove `apps/api/compose.yaml` entirely — breaks the simple `make db-up` native workflow for developers not using the full Docker stack

### Base images

| App | Dev base | Prod base |
|---|---|---|
| API | `golang:1.26-alpine` | `alpine:3.20` |
| Web | `node:24-alpine` | `nginx:alpine` |

Alpine throughout to keep layers small and attack surface minimal.

## Risks / Trade-offs

- **Volume mount performance on macOS** → Docker Desktop's VirtioFS (default since 4.x) is fast enough for this use case; no action needed
- **Vite polling adds ~1s change detection latency** → Acceptable for dev; can be tuned via `interval` in vite config if needed
- **`air` adds a dep to the dev image** → Installed via `go install` in the builder stage; never present in prod
- **`compose.prod.yaml` is not a real prod deploy** → Documented clearly as a local smoke-test tool; actual deployment requires pushing images to a registry
- **Port conflicts if native and Docker stacks run simultaneously** → Both use 8080 (API) and 5173 (web); running both at once will fail. Document this; don't attempt to solve it with alternate ports

## Migration Plan

1. Add `Dockerfile.api` and `Dockerfile.web` at repo root
2. Add root `compose.yaml` (dev) and `compose.prod.yaml`
3. Add `docker-*` targets to root `Makefile`
4. Update root `README.md` with Docker usage section
5. Verify: `make docker-dev` starts all three services with hot reload working
6. Verify: `make docker-build` produces images; `make docker-prod` runs them correctly

Rollback: all new files are additive. Removing them restores the previous state exactly.
