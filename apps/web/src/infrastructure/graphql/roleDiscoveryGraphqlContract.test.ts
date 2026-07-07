import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildSchema, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";

import { roleDiscoveryGraphqlOperations } from "./roleDiscoveryGraphqlGateway";

describe("GraphQL role discovery contract", () => {
  it("validates frontend role discovery operations against the backend schema", () => {
    const schema = buildSchema(
      readFileSync(
        resolve(process.cwd(), "../../apps/api/graph/schema.graphqls"),
        "utf8"
      )
    );

    const errors = roleDiscoveryGraphqlOperations.flatMap((operation) =>
      validate(schema, parse(operation)).map((error) => error.message)
    );

    expect(errors).toEqual([]);
  });
});
