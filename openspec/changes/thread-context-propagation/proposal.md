## Why

All database operations in the persistence layer currently pass `context.Background()`, meaning HTTP request cancellations and timeouts are silently ignored — a long-running query will keep running even after the client disconnects. The sqlc migration made this visible; now is the right moment to fix it before the surface area grows.

## What Changes

- **BREAKING** Add `context.Context` as the first parameter to all repository port interface methods (`JobApplicationRepository`, `InterviewRepository`, `FollowUpRepository`, `NoteRepository`, `TimelineRepository`) and to `Transactor.WithTransaction`
- **BREAKING** Add `context.Context` as the first parameter to all use case `Execute` methods
- Update all GraphQL resolver methods to pass the gqlgen-provided `ctx` down into use case calls (resolvers already receive `ctx` — it is currently unused beyond the resolver boundary)
- Replace all `context.Background()` calls in persistence adapter methods with the received context
- Update use case tests to pass `context.Background()` (or a test-scoped context) at the call site

## Capabilities

### New Capabilities

_(none — this change threads an existing Go standard library primitive through existing seams)_

### Modified Capabilities

- `go-backend-use-cases`: port interface method signatures now include `context.Context`; use case `Execute` methods now accept and forward context
- `go-backend-graphql-adapter`: resolver methods now pass `ctx` into use case calls instead of discarding it at the resolver boundary

## Impact

- **Changed**: `internal/application/ports/` — all repository interface method signatures and `Transactor`
- **Changed**: `internal/application/usecases/` — all use case `Execute` methods and their fake-repository test doubles
- **Changed**: `graph/resolvers/schema.resolvers.go` — all resolver calls now forward `ctx`
- **Changed**: `internal/infrastructure/persistence/` — all adapter methods replace `context.Background()` with received context
- **Unchanged**: `internal/domain/` — domain types and rules have no context dependency
- **No new dependencies**: `context` is part of the Go standard library
