# ADR 0003: SQL Persistence Strategy

## Status

Open — current implementation uses raw `database/sql`; strategy not yet finalized.

## Context

The Go backend (`apps/api`) needs to execute SQL queries against SQLite. Go has several well-established approaches for this, ranging from raw standard library code to full ORMs. The choice affects how much boilerplate developers write, how visible the SQL is, and how type-safe the persistence layer is.

The project is a learning exercise, so the choice should also serve as a clear example of a pattern rather than obscure it.

## Options Considered

### 1. Raw `database/sql` ← current
Write SQL strings by hand; scan rows manually into structs.

**Pros:** Zero dependencies, full control, SQL is explicit.  
**Cons:** Verbose. Repetitive scan code. Easy to make mistakes mapping columns to fields.  
**Verdict:** Fine for getting started. Too tedious to maintain as the query count grows.

### 2. sqlx
A thin wrapper over `database/sql`. Adds named parameters (`:field`), struct scanning (`db.StructScan`), and `In` query helpers. Does not hide SQL.

**Pros:** Removes most scan boilerplate. Keeps SQL visible. Minimal learning curve over `database/sql`. Widely considered idiomatic Go.  
**Cons:** SQL is still strings — no compile-time checks. One more dependency.  
**Verdict:** Best "small step up" from what we have. Low risk, high convenience gain.

### 3. sqlc (code generation)
Write `.sql` files with real SQL queries. Run `sqlc generate`. Get type-safe Go functions back. The SQL files are the source of truth.

**Pros:** Type-safe at compile time. SQL lives in dedicated files — easy to review and optimize. Generated code is readable. Increasingly the modern Go recommendation.  
**Cons:** Requires the `sqlc` CLI as a dev dependency. Adding a query means touching a `.sql` file and re-running the generator.  
**Verdict:** Best long-term choice for this project. Enforces a clean separation between SQL and Go. Worth adding as a learning exercise.

### 4. GORM
Full ORM. Most downloaded Go ORM. Similar to ActiveRecord / Sequelize.

**Pros:** Familiar to developers coming from other ecosystems. Lots of documentation.  
**Cons:** Hides SQL behind method chains. Difficult to optimize queries. Complex API with many footguns. Frequently criticized in the Go community. Contradicts the project's goal of making layer boundaries explicit.  
**Verdict:** Not recommended for this project.

### 5. Bun / ent
Newer ORMs attempting to fix GORM's problems. Bun is SQL-first with a query builder. `ent` is schema-first with code generation.

**Pros:** More modern API than GORM. `ent` has strong typing.  
**Cons:** Heavier than sqlx/sqlc. Adds more abstraction than the project needs at this stage.  
**Verdict:** Worth knowing about, but not the right fit here.

## Community Consensus

The Go community broadly favors explicit SQL over heavy ORMs:
- GORM is the most *used* but also the most *criticized*.
- sqlx is considered idiomatic for teams that want convenience without abstraction.
- sqlc is the growing recommendation for new projects that want type safety.
- Raw `database/sql` is respected but tedious at scale.

## Decision

**Not yet made.** Current code uses raw `database/sql` because sqlc was not installed at implementation time (see ADR 0002). The repository port interfaces in `internal/application/ports/` mean the persistence internals can be replaced without touching the domain or use-case layers.

## Recommended Next Step

Migrate to **sqlc** as a future task:
1. Install: `brew install sqlc` or `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
2. Write SQL query files in `internal/infrastructure/persistence/queries/`
3. Add `sqlc.yaml` configuration
4. Run `sqlc generate`
5. Replace hand-written adapter internals with generated function calls
6. Update this ADR status to Accepted

## Consequences

- Until this is resolved, the persistence layer is correct but verbose.
- Any developer adding a new query must write manual scan code.
- Migrating to sqlc or sqlx is a change confined to `internal/infrastructure/persistence/` — no other layer is affected.
