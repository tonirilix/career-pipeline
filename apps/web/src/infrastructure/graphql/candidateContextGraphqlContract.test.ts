import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildSchema, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";

import { candidateContextGraphqlOperations } from "./candidateContextGraphqlGateway";

describe("GraphQL candidate context contract", () => {
  it("validates frontend candidate context operations against the backend schema", () => {
    const schema = buildSchema(
      readFileSync(
        resolve(process.cwd(), "../../apps/api/graph/schema.graphqls"),
        "utf8"
      )
    );

    const errors = candidateContextGraphqlOperations.flatMap((operation) =>
      validate(schema, parse(operation)).map((error) => error.message)
    );

    expect(errors).toEqual([]);
  });
});
