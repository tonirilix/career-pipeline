## Purpose

Defines the production Docker image build process. The goal is to produce minimal, deployment-ready images for the Go API and the React frontend, and to allow developers to verify those images locally before pushing to a registry.

## Requirements

### Requirement: Multi-stage Dockerfiles produce minimal production images
`Dockerfile.api` and `Dockerfile.web` SHALL each use multi-stage builds so the final production image contains only the compiled artifact and its runtime dependencies — no source code, no build tooling.

#### Scenario: API production image contains only the binary
- **WHEN** `Dockerfile.api` is built targeting the `prod` stage
- **THEN** the resulting image contains the compiled Go binary and an Alpine runtime, but no Go toolchain or source files

#### Scenario: Web production image serves static files via nginx
- **WHEN** `Dockerfile.web` is built targeting the `prod` stage
- **THEN** the resulting image contains the Vite `dist/` output served by nginx, but no Node runtime or source files

### Requirement: Production images can be verified locally before deployment
`compose.prod.yaml` SHALL build and run the production images locally so developers can smoke-test the compiled artifacts before pushing to a registry.

#### Scenario: Developer smoke-tests production images
- **WHEN** a developer runs `make docker-prod`
- **THEN** production images are built and all three services start using those images, accessible at their respective ports

#### Scenario: SPA routing works in production
- **WHEN** a user navigates directly to a deep route (e.g. `/applications/123`) in the production web container
- **THEN** nginx serves `index.html` so the React router handles the route client-side

### Requirement: Production images are built via a Makefile target
The root `Makefile` SHALL expose a `docker-build` target that builds both production images without starting any containers.

#### Scenario: CI or developer builds images without running them
- **WHEN** a developer runs `make docker-build`
- **THEN** both `Dockerfile.api` and `Dockerfile.web` are built to their `prod` stage and tagged locally, with no containers started
