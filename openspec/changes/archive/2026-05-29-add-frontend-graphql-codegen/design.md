## Context

The frontend GraphQL adapter currently owns three concerns manually in `jobApplicationGraphqlGateway.ts`: GraphQL document strings, transport DTO types, and request/response typing for each operation. A contract test validates those strings against `apps/api/graph/schema.graphqls`, but the gateway can still drift through manually maintained TypeScript DTOs or operation result shapes.

The backend already has a schema-first GraphQL contract at `apps/api/graph/schema.graphqls`. The frontend should consume that schema as an input to code generation while preserving the hexagonal boundary: generated GraphQL artifacts are infrastructure details, and the rest of the app continues to speak through `JobApplicationGateway` and domain/application types.

## Goals / Non-Goals

**Goals:**

- Generate frontend operation types from the backend GraphQL schema and frontend-owned operation documents.
- Move operation text out of `jobApplicationGraphqlGateway.ts` into `.graphql` documents.
- Refactor the GraphQL gateway to use generated result and variables types for every Job Application operation.
- Keep all generated GraphQL types confined to the frontend infrastructure adapter.
- Add a repeatable codegen command and include it in frontend verification.
- Preserve existing gateway behavior and domain mapping.

**Non-Goals:**

- Changing backend GraphQL schema fields, resolver behavior, or gqlgen configuration.
- Replacing the existing `fetch`-based GraphQL client with Apollo, urql, Relay, or React hooks.
- Exposing generated GraphQL types to domain, application, presentation, or port modules.
- Removing the domain mapping layer. Generated DTOs still map into domain/application types at the adapter boundary.

## Decisions

### Use GraphQL Code Generator in `apps/web`

Add GraphQL Code Generator tooling to the frontend workspace and configure it from `apps/web`. The config will read the backend schema via a relative path (`../../apps/api/graph/schema.graphqls`) and frontend operation documents under `apps/web/src/infrastructure/graphql/`.

This is a dev-time tool. It should not change runtime behavior beyond replacing manually maintained operation typings.

Alternative considered: keep the current contract test only. That validates operation syntax and schema compatibility, but still leaves hand-written DTOs and operation result types as a source of drift.

### Keep operations as frontend-owned documents

Store operation documents near the GraphQL adapter, for example `apps/web/src/infrastructure/graphql/jobApplicationOperations.graphql`. These are frontend adapter concerns: they express exactly what the gateway requests from the backend.

Alternative considered: generate frontend operations from backend resolver or schema names. The frontend should still own its query selection sets; codegen should type them, not decide what the UI needs.

### Generate types into an infrastructure-local module

Generate operation result and variable types into an infrastructure-local generated file such as `apps/web/src/infrastructure/graphql/generated.ts`. The generated file can be committed if that matches the repository’s existing generated-code policy, but the codegen command must be reproducible either way.

The gateway will use generated types to type `requestGraphql` calls and variables. It will continue mapping generated GraphQL shapes into domain/application types instead of exporting generated types outside infrastructure.

Alternative considered: generate types beside every operation file. A single generated module is simpler for this small adapter and easier to protect with architecture tests.

### Keep the fetch client minimal

Continue using the existing `fetch`-based request helper. Codegen should improve type safety for documents, variables, and result shapes; it should not introduce a GraphQL client runtime or React data-fetching hooks. TanStack Query ownership remains in `useJobApplications`.

Alternative considered: adopt a generated React Query/Apollo client. That would blur the established async layer and create a larger architecture change than this proposal needs.

### Replace contract validation with or complement it through codegen

The current contract test may remain as a fast explicit check, but `npm run graphql:codegen` should also fail if operation documents do not match the backend schema. The build or test workflow should verify generated artifacts are current.

If generated files are committed, verification should detect stale generated output. If generated files are not committed, verification should ensure codegen runs before typecheck/build.

## Risks / Trade-offs

- [Risk] Codegen adds tooling and package-lock churn. -> Mitigation: keep the tool confined to `apps/web` dev dependencies and add one explicit script.
- [Risk] Generated GraphQL types leak into domain or presentation code. -> Mitigation: add architecture tests that allow generated GraphQL imports only inside `infrastructure/graphql`.
- [Risk] Generated output can become stale. -> Mitigation: include codegen in the frontend verification path and document the command.
- [Risk] The backend schema path couples frontend tooling to `apps/api`. -> Mitigation: this coupling already exists in the contract test and represents the intended GraphQL contract boundary.
- [Risk] Operation file imports can complicate Vite/TypeScript handling. -> Mitigation: keep the gateway API stable and choose a codegen output format that works with the existing TypeScript/Vite setup before refactoring behavior.
