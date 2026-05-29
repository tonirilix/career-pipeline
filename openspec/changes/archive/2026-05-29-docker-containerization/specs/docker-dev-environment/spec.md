## ADDED Requirements

### Requirement: Full dev stack runs in containers with a single command
The root `compose.yaml` SHALL define three services — `postgres`, `api`, and `web` — so a developer can start the entire stack without installing Go, Node, or configuring a local database.

#### Scenario: Developer starts full stack
- **WHEN** a developer runs `make docker-dev` from the repo root
- **THEN** postgres, the Go API server, and the Vite dev server all start inside containers and are accessible at their respective ports

#### Scenario: Developer with no local Go or Node toolchain
- **WHEN** a developer who has only Docker installed runs `make docker-dev`
- **THEN** the full application starts and is accessible at `http://localhost:5173`

### Requirement: Go API hot reload works inside the container
The `api` dev service SHALL use `air` to watch for Go source file changes and automatically recompile and restart the server without requiring a container rebuild.

#### Scenario: Go source file changed while container is running
- **WHEN** a developer edits a `.go` file in `apps/api/`
- **THEN** `air` detects the change, recompiles, and the API is back up within a few seconds without restarting the container

### Requirement: Vite HMR works inside the container
The `web` dev service SHALL run the Vite dev server with HMR enabled so browser state updates instantly on frontend source changes.

#### Scenario: React component changed while container is running
- **WHEN** a developer edits a file in `apps/web/src/`
- **THEN** the browser reflects the change via HMR without a full page reload

#### Scenario: HMR works on macOS with Docker Desktop
- **WHEN** the `web` container is running on macOS via Docker Desktop
- **THEN** file change events are detected reliably (using polling if inotify is unavailable)

### Requirement: Source code is mounted as a volume in dev
The dev services SHALL mount the host source directories into the containers so edits on the host are immediately visible inside the container filesystem.

#### Scenario: Source volume mount for API
- **WHEN** the `api` dev container is running
- **THEN** `apps/api/` on the host is mounted into the container and changes are visible without rebuilding the image

#### Scenario: Source volume mount for web
- **WHEN** the `web` dev container is running
- **THEN** `apps/web/` on the host is mounted into the container and changes are visible without rebuilding the image

### Requirement: Dev stack can be stopped cleanly
The Makefile SHALL provide a target to stop and remove all dev containers.

#### Scenario: Developer stops the dev stack
- **WHEN** a developer runs `make docker-down`
- **THEN** all containers started by `make docker-dev` are stopped and removed
