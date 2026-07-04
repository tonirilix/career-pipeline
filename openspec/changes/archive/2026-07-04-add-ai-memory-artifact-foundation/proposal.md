## Why

Career Pipeline needs a durable AI/context foundation before role discovery, fit ranking, application packets, or vector memory can be added safely. The first AI slice should establish a truthful source of candidate context and persist generated AI outputs as auditable artifacts rather than disposable chat responses.

## What Changes

- Add a candidate profile and structured memory model for approved facts, preferences, compensation expectations, writing tone, target roles, strengths, gaps, stories, and red flags.
- Add AI artifact persistence so future AI outputs can be saved with owner relationships, source inputs, generated content, user-edited content, approval state, sensitivity, provenance, and supersession metadata.
- Add an AI provider boundary in the backend application layer so future workflows can call external or local model providers through a replaceable port.
- Expose backend APIs and frontend foundation UI needed to view and manage candidate profile and memory records.
- Design stored memory and artifacts so a later `add-vector-memory-retrieval` change can index domain objects without reshaping the foundation.
- Do not add role search, fit ranking, application packet generation, vector embeddings, background jobs, or a chat assistant in this change.

## Capabilities

### New Capabilities

- `candidate-memory-foundation`: Defines candidate profile and structured memory records as the authoritative source of AI grounding context.
- `ai-artifact-foundation`: Persists AI-generated and user-edited artifacts with provenance, ownership, approval, sensitivity, and supersession metadata.
- `ai-provider-boundary`: Defines the backend AI provider port and invocation contract future AI workflows will use.

### Modified Capabilities

- None.

## Impact

- Backend domain, application use cases, repository ports, PostgreSQL migrations/sqlc queries, composition wiring, and GraphQL schema/resolvers.
- Frontend GraphQL documents/codegen, gateway mapping, application ports/use cases, query cache helpers, and presentation components for candidate memory management.
- Configuration for AI provider selection/API keys may be introduced, but this change does not require a production AI workflow to call a live model.
- Future OpenSpec changes for role discovery, role fit triage, application packets, scoped AI assistant, vector memory, and background jobs should build on this foundation.
