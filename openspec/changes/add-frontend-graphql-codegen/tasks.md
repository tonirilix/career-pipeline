## 1. Tooling Setup

- [x] 1.1 Add frontend GraphQL Code Generator tooling to `apps/web` dev dependencies.
- [x] 1.2 Add a frontend codegen configuration that reads `../../apps/api/graph/schema.graphqls` and frontend operation documents.
- [x] 1.3 Add package scripts for generating and verifying frontend GraphQL artifacts.
- [x] 1.4 Decide and document whether generated artifacts are committed or regenerated during verification.

## 2. Operation Documents

- [x] 2.1 Move the Job Application GraphQL query and mutation documents out of `jobApplicationGraphqlGateway.ts` into frontend-owned `.graphql` operation files.
- [x] 2.2 Preserve the existing operation names used by gateway tests and request payloads.
- [x] 2.3 Preserve the existing Job Application selection set and returned fields.
- [x] 2.4 Update the GraphQL contract test to validate the extracted operation documents or generated artifacts.

## 3. Generated Types Integration

- [x] 3.1 Run codegen and create the generated frontend GraphQL artifacts.
- [x] 3.2 Refactor `jobApplicationGraphqlGateway` to type each request variables object with generated operation variables types.
- [x] 3.3 Refactor `jobApplicationGraphqlGateway` to type each operation response with generated operation result types.
- [x] 3.4 Remove manually maintained GraphQL DTO and operation response types that are replaced by generated types.
- [x] 3.5 Preserve the existing mapping from GraphQL data into domain/application types returned by `JobApplicationGateway`.

## 4. Boundary Protection

- [x] 4.1 Add architecture tests proving generated GraphQL artifacts are only imported inside `infrastructure/graphql`.
- [x] 4.2 Add architecture tests proving domain, application, presentation, and port modules do not import generated GraphQL artifacts or operation documents.
- [x] 4.3 Ensure GraphQL Code Generator helper/runtime types do not leak outside the GraphQL infrastructure adapter.

## 5. Verification

- [x] 5.1 Run the frontend GraphQL codegen command.
- [x] 5.2 Run `npm test --workspace apps/web`.
- [x] 5.3 Run `npm run build --workspace apps/web`.
- [x] 5.4 Run `openspec validate add-frontend-graphql-codegen`.
- [x] 5.5 Run `openspec status --change add-frontend-graphql-codegen` and confirm the change is apply-ready.
