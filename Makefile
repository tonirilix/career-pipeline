.PHONY: help dev dev-api dev-web dev-web-api build build-api build-web test test-api test-web db-up db-down db-reset codegen-api codegen-web docker-dev docker-down docker-build docker-prod

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  %-15s %s\n", $$1, $$2}'

## Dev

dev: ## Start API and web dev servers concurrently (web connects to real API)
	@$(MAKE) -C apps/api db-up
	@($(MAKE) -C apps/api run 2>&1 | sed 's/^/[api] /' &) && \
	 npm --prefix apps/web run dev:api 2>&1 | sed 's/^/[web] /'; \
	 wait

dev-api: ## Start Go API dev server only
	$(MAKE) -C apps/api run

dev-web: ## Start Vite dev server (MSW mock backend)
	npm --prefix apps/web run dev

dev-web-api: ## Start Vite dev server against the real Go API (MSW disabled)
	npm --prefix apps/web run dev:api

## Test

test: test-api test-web ## Run all tests

test-api: ## Run Go API tests
	$(MAKE) -C apps/api test

test-web: ## Run web Vitest tests
	npm --prefix apps/web run test

## Build

build: build-api build-web ## Build all apps

build-api: ## Build Go binary
	$(MAKE) -C apps/api build

build-web: ## Build Vite production bundle
	npm --prefix apps/web run build

## Codegen

codegen-api: ## Run Go code generation (gqlgen, etc.)
	$(MAKE) -C apps/api generate

codegen-web: ## Generate GraphQL types for the frontend
	npm run graphql:codegen -w apps/web

## Docker

docker-dev: ## Start full stack in Docker with hot reload (api + web + postgres)
	docker compose up --build

docker-down: ## Stop and remove all Docker containers (dev and prod)
	docker compose down
	docker compose -f compose.prod.yaml down

docker-build: ## Build production Docker images without starting containers
	docker compose -f compose.prod.yaml build

docker-prod: ## Run production images locally for smoke testing
	docker compose -f compose.prod.yaml up --build

## Database

db-up: ## Start PostgreSQL container
	$(MAKE) -C apps/api db-up

db-down: ## Stop PostgreSQL container
	$(MAKE) -C apps/api db-down

db-reset: ## Tear down and recreate PostgreSQL container with a fresh volume
	$(MAKE) -C apps/api db-reset
