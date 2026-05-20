# ADR 0002: Use Go for the Backend Runtime

## Status

Accepted

## Context

The future backend PRD originally specified Node.js and TypeScript with GraphQL Yoga, Pothos, Effect, and TypeORM. Before any backend implementation begins, the technology choices were reconsidered. The core requirements are:

- Expose a GraphQL API that the existing React frontend can consume without changes.
- Enforce domain rules and application use cases behind explicit port interfaces (hexagonal architecture).
- Persist data through a repository adapter that can be swapped in tests.
- Return typed failures from use cases so that expected errors are not hidden.
- Remain easy to build and run locally with minimal setup.

The project is explicitly a learning exercise in hexagonal architecture, so the backend technology should make layer boundaries visible and enforceable rather than obscure them.

## Decision

Use Go for the backend runtime, replacing the previously planned Node.js/TypeScript stack.

Specific replacements:

| Original | Replacement | Reason |
|---|---|---|
| Node.js + TypeScript | Go | Compiled binary, explicit types, no runtime surprises |
| GraphQL Yoga | gqlgen | Schema-first, generates type-safe Go resolver interfaces |
| Pothos | gqlgen | gqlgen covers both the server and the schema/codegen layer |
| Effect | Go interfaces + constructor injection + `(T, error)` returns | Native Go patterns achieve the same goals without a framework |
| TypeORM | sqlc | Generates type-safe Go from SQL; keeps SQL explicit and the repository boundary clean |

## Rationale

**Hexagonal architecture maps naturally to Go interfaces.** Go's structural (implicit) interfaces mean that defining a repository port is just writing an interface, and any struct with matching methods satisfies it — no registration, no decorators, no framework. Port/adapter boundaries are enforced by the compiler at zero ceremony cost.

**Typed failures without a framework.** Effect was chosen in the original plan to provide typed, composable error handling. Go achieves the same goal idiomatically: use cases return `(Result, error)` where `error` is a custom domain error type. The caller is forced by the language to handle both branches. No library required.

**Dependency injection through constructors.** Go services are wired by passing interface values into constructors. The layer graph is visible in code, not in a framework configuration. This makes the hexagonal wiring easy to read and easy to test.

**gqlgen keeps GraphQL as a true adapter.** gqlgen is schema-first: you write a `.graphql` schema, run the generator, and implement the generated resolver interfaces. The resolver layer is a thin mapping concern — it cannot accidentally leak into domain code because the generated types are structurally separate.

**sqlc keeps persistence explicit.** Unlike TypeORM, sqlc does not abstract SQL. You write SQL queries, run the generator, and get type-safe Go functions. The generated code lives entirely in the infrastructure layer behind repository interfaces. Domain structs never touch sqlc types directly.

**No shared type concern with the frontend.** ADR 0001 already ruled out sharing domain code between `apps/web` and `apps/api` until the API contract stabilizes. The language boundary between TypeScript (frontend) and Go (backend) reinforces that decision at the toolchain level.

## Alternatives Considered

- **TypeScript/Node.js (original plan):** Familiar to frontend developers on this project and would share tooling. Ruled out because Effect and Pothos add abstraction layers that obscure the hexagonal architecture lesson, and a Node.js service has more runtime ceremony than a compiled Go binary.
- **Python (FastAPI + SQLAlchemy):** Good ergonomics and familiar to many developers, but the dynamic type system makes port/adapter boundaries harder to enforce statically. Dependency injection is less explicit than in Go.
- **Java/Kotlin (Spring Boot):** Strong hexagonal architecture tradition and excellent tooling, but the framework footprint (Spring context, annotations, auto-wiring) obscures the explicit dependency wiring that this project wants to make visible as a learning exercise.
- **Rust:** Excellent performance and type safety, but the learning curve is steep and would likely distract from the hexagonal architecture goal.

## Consequences

- The backend will be written in Go; contributors working on `apps/api` need Go tooling installed.
- Frontend and backend cannot share type definitions directly. This was already accepted in ADR 0001.
- The GraphQL schema becomes the contract boundary between `apps/web` and `apps/api`. Both sides evolve against the schema independently.
- sqlc requires SQL migrations to be written explicitly. This is intentional — it keeps database schema changes reviewable and the persistence layer non-magical.
- The compiled Go binary simplifies future deployment: a single executable with no Node.js runtime dependency.
