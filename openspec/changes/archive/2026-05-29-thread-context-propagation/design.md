## Context

Every gqlgen resolver already receives a `context.Context` bound to the HTTP request. That context carries cancellation signals: if the client disconnects or a timeout fires, the context is cancelled. Today, this signal is discarded at the resolver boundary — use cases and persistence adapters never see it. The sqlc migration exposed this gap explicitly: generated query functions require a `context.Context`, and we passed `context.Background()` as a placeholder.

The fix is mechanical: add `ctx context.Context` as the first parameter at each layer boundary, and pass it down. No behaviour changes, no new logic, no new dependencies.

## Goals / Non-Goals

**Goals:**
- Port interfaces accept `context.Context` so callers can propagate cancellation
- Use case `Execute` methods accept and forward `context.Context`
- GraphQL resolvers pass the gqlgen-provided `ctx` through the full call chain
- Persistence adapters pass received context to sqlc-generated query functions
- All existing tests continue to pass (test call sites pass `context.Background()`)

**Non-Goals:**
- Adding request timeouts or deadline policies — those belong in middleware, not in this change
- Context-based tracing or logging enrichment
- Changing the domain layer in any way
- Touching the frontend or GraphQL schema

## Decisions

### 1. `context.Context` as first parameter, not embedded in structs

Go convention is to pass context as the first parameter of each function rather than storing it in a struct. Storing context in a struct is explicitly warned against in the standard library documentation. All port interface methods and use case `Execute` methods follow this convention.

### 2. Start the thread at the resolver, not at `main`

The gqlgen resolver is the outermost application entry point that owns a per-request context. `main.go` wires infrastructure and does not handle individual requests, so there is no useful context to thread from there. The resolver is the right seam.

### 3. `Transactor.WithTransaction` also accepts context

The transactor is called by use cases to wrap multi-step writes. If the request is cancelled mid-transaction, the underlying `*sql.Tx` should be able to respect that. The context is passed into `db.Begin`-equivalent calls and forwarded to all repository operations inside the transaction closure.

### 4. Test doubles pass `context.Background()`

Fake repositories in use case tests do not need real context cancellation — they are synchronous in-memory fakes. All test call sites pass `context.Background()`. This keeps tests unchanged in spirit while satisfying the updated interface.

## Risks / Trade-offs

- **Large diff, low conceptual risk** → The change is wide (every interface method, every use case, every adapter) but each individual edit is a one-line signature addition. The compiler enforces completeness — it will not compile until every implementor is updated.
- **Fake repositories in tests must be updated** → Every fake that implements a port interface needs the `ctx` parameter added to each method signature. There are no logic changes, just signature changes. Failing to update a fake is a compile error, not a silent failure.
- **No rollback needed** → The change is additive at the call sites and purely mechanical at the implementation sites. If the PR is reverted, the only effect is losing the cancellation capability — behaviour returns to the current state.

## Migration Plan

1. Update `Transactor` interface in `ports/` — compile, observe all errors
2. Update all repository port interfaces in `ports/` — compile, observe remaining errors
3. Update all use case `Execute` method signatures — compile
4. Update all GraphQL resolver call sites to pass `ctx`
5. Update all persistence adapter method signatures to receive and forward `ctx`
6. Update all fake repository implementations in use case tests
7. `go test ./...` — all tests pass

The compiler guides the order: each step reduces the error count. Steps 1–3 can be done in any order relative to each other since they all produce compile errors that guide the next step.

## Open Questions

None. The Go context convention is well-established and the seam is clear.
