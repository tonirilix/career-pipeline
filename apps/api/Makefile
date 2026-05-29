BINARY_NAME=api
DATABASE_URL?=postgres://tracker:tracker@localhost:5432/tracker?sslmode=disable
TEST_DATABASE_URL?=$(DATABASE_URL)

.PHONY: build run generate sqlc test test-db migrate seed db-up db-down db-reset

build:
	go build -o bin/$(BINARY_NAME) ./cmd/api

run: build
	DATABASE_URL="$(DATABASE_URL)" APP_ENV=development ./bin/$(BINARY_NAME)

generate:
	go generate ./...

sqlc:
	cd internal/infrastructure/persistence && go run github.com/sqlc-dev/sqlc/cmd/sqlc generate

test:
	go test ./...

test-db:
	TEST_DATABASE_URL="$(TEST_DATABASE_URL)" go test ./internal/infrastructure/persistence

migrate:
	DATABASE_URL="$(DATABASE_URL)" go run ./cmd/api -migrate-only

seed:
	DATABASE_URL="$(DATABASE_URL)" go run ./cmd/api -seed-only

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-reset:
	docker compose down -v
	docker compose up -d postgres
