# Frontend GraphQL Codegen

Frontend GraphQL operations live in `*.graphql` files in this directory and are
typed from the backend schema at `../../../../apps/api/graph/schema.graphqls`.

Run `npm run graphql:codegen --workspace apps/web` after changing operation
documents or the backend schema. The generated TypeScript artifact is committed
at `generated.ts` so the gateway can typecheck without an extra setup step.
