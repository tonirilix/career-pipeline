## Why

The frontend GraphQL gateway currently hand-writes operation strings, response DTO types, and operation result typings in one adapter file. A contract test catches schema drift at test time, but generated operation types would make the GraphQL adapter easier to maintain and catch many schema/operation mismatches during typecheck.

## What Changes

- Add frontend GraphQL code generation using the backend schema at `apps/api/graph/schema.graphqls` as the schema source.
- Move frontend GraphQL operations into dedicated `.graphql` documents owned by the frontend adapter.
- Generate typed operation documents and result/variable types into a committed or reproducible generated module under `apps/web/src/infrastructure/graphql/`.
- Refactor `jobApplicationGraphqlGateway` to use generated operation documents and generated operation data/variables types while preserving the `JobApplicationGateway` port and domain mapping boundary.
- Add scripts so code generation is explicit and runs as part of frontend verification.
- Keep the existing gateway behavior, endpoint behavior, MSW behavior, backend schema, and public application/domain ports unchanged.

## Capabilities

### New Capabilities

- `frontend-graphql-codegen`: Defines how the frontend generates and consumes typed GraphQL operation artifacts from the backend schema.

### Modified Capabilities

- `go-backend-graphql-adapter`: Clarify that the backend GraphQL schema is the source used by frontend code generation, without changing resolver behavior.
- `architecture-deepening`: Add architecture protection that generated GraphQL artifacts stay confined to infrastructure adapters and do not leak into domain, application, or presentation layers.

## Impact

- Affected frontend infrastructure code: `apps/web/src/infrastructure/graphql/`.
- Affected scripts/dependencies: `apps/web/package.json` and lockfile changes for GraphQL Code Generator tooling.
- Affected tests: frontend GraphQL contract/gateway tests and architecture tests.
- No backend resolver, use-case, domain, persistence, MSW, presentation, or gateway port behavior changes.
