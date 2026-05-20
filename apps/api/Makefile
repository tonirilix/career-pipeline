BINARY_NAME=api
DB_PATH=./data/tracker.db

.PHONY: build run generate test migrate seed

build:
	go build -o bin/$(BINARY_NAME) ./cmd/api

run: build
	APP_ENV=development ./bin/$(BINARY_NAME)

generate:
	go generate ./...

test:
	go test ./...

migrate:
	go run ./cmd/api -migrate-only

seed:
	go run ./cmd/api -seed-only
