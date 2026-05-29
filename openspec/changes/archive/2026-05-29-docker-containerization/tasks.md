## 1. Dockerfile.api

- [x] 1.1 Create `Dockerfile.api` at repo root with a `dev` stage: `golang:1.26-alpine` base, install `air`, set workdir, expose port 8080
- [x] 1.2 Add `prod` stage to `Dockerfile.api`: Go builder compiles binary, copies into `alpine:3.20` runtime image
- [x] 1.3 Create `apps/api/.dockerignore` excluding `bin/`, `data/`, and test artifacts

## 2. Dockerfile.web

- [x] 2.1 Create `Dockerfile.web` at repo root with a `dev` stage: `node:24-alpine` base, install dependencies, expose port 5173
- [x] 2.2 Add `prod` stage to `Dockerfile.web`: Node builder runs `vite build`, copies `dist/` into `nginx:alpine` with SPA routing config
- [x] 2.3 Create `apps/web/.dockerignore` excluding `node_modules/`, `dist/`, and test artifacts

## 3. Vite Dev Config

- [x] 3.1 Enable `server.watch.usePolling: true` in `apps/web/vite.config.ts` for reliable change detection through Docker volume mounts

## 4. Root compose.yaml (Development)

- [x] 4.1 Create root `compose.yaml` with `postgres` service (migrated from `apps/api/compose.yaml`, same config and healthcheck)
- [x] 4.2 Add `api` service: builds `Dockerfile.api` targeting `dev` stage, mounts `apps/api/` as volume, depends on postgres being healthy
- [x] 4.3 Add `web` service: builds `Dockerfile.web` targeting `dev` stage, mounts `apps/web/` as volume, exposes port 5173
- [x] 4.4 Add named volume for postgres data and node_modules cache volume for the web service

## 5. compose.prod.yaml (Production)

- [x] 5.1 Create `compose.prod.yaml` at repo root with `postgres` service
- [x] 5.2 Add `api` service targeting `prod` stage of `Dockerfile.api`, passes `DATABASE_URL` env var
- [x] 5.3 Add `web` service targeting `prod` stage of `Dockerfile.web`, exposes port 80

## 6. Makefile Targets

- [x] 6.1 Add `docker-dev` target: runs `docker compose up --build` using root `compose.yaml`
- [x] 6.2 Add `docker-down` target: runs `docker compose down` for both compose files
- [x] 6.3 Add `docker-build` target: builds both prod images via `docker compose -f compose.prod.yaml build`
- [x] 6.4 Add `docker-prod` target: runs `docker compose -f compose.prod.yaml up --build`
- [x] 6.5 Add new targets to `.PHONY` and `help` descriptions

## 7. Documentation

- [x] 7.1 Add Docker section to root `README.md` documenting `make docker-dev`, `make docker-down`, `make docker-build`, `make docker-prod`
- [x] 7.2 Document the port conflict warning (native and Docker stacks cannot run simultaneously on the same ports)

## 8. Verification

- [x] 8.1 Run `make docker-dev` and confirm all three services start
- [x] 8.2 Edit a `.go` file and confirm `air` reloads the API without restarting the container
- [x] 8.3 Edit a file in `apps/web/src/` and confirm Vite HMR updates the browser
- [x] 8.4 Run `make docker-build` and confirm both prod images are built without errors
- [x] 8.5 Run `make docker-prod` and confirm the app loads with data from the database
- [x] 8.6 Navigate to a deep route directly and confirm nginx SPA routing serves `index.html`
- [x] 8.7 Open the app in Chrome via DevTools MCP, confirm job applications are rendered and network requests hit `localhost:8080/graphql` with a 200 response (not MSW)
- [x] 8.8 Run `make docker-down` and confirm all containers are removed
