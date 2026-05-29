import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../../apps/api/graph/schema.graphqls",
  documents: "src/infrastructure/graphql/**/*.graphql",
  generates: {
    "src/infrastructure/graphql/generated.ts": {
      plugins: ["typescript-operations"],
      config: {
        avoidOptionals: true,
        immutableTypes: true,
        onlyOperationTypes: true,
        scalars: {
          DateTime: "string",
          ID: "string"
        }
      }
    }
  }
};

export default config;
