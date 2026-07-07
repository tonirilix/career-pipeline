import { afterEach, describe, expect, it, vi } from "vitest";

import { createRoleDiscoveryGraphqlGateway } from "./roleDiscoveryGraphqlGateway";

describe("GraphQL role discovery gateway", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps role records from GraphQL into frontend domain data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            roleRecords: [
              graphqlRole({
                decisionStatus: "Saved",
                freshnessStatus: "Live",
                promotedApplicationId: "app-1"
              })
            ]
          }
        })
      )
    );

    const gateway = createRoleDiscoveryGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await expect(gateway.listRoles()).resolves.toEqual([
      expect.objectContaining({
        id: "role-1",
        company: "Acme",
        decisionStatus: "Saved",
        freshnessStatus: "Live",
        promotedApplicationId: "app-1"
      })
    ]);
  });

  it("sends explicit nullable fields for role intake input", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            createRoleFromUrl: graphqlRole()
          }
        })
      )
    );

    const gateway = createRoleDiscoveryGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await gateway.createRoleFromUrl({
      searchTopicId: null,
      company: "Acme",
      title: "Engineer",
      postingUrl: "https://jobs.example/acme",
      source: "Other",
      sourceKind: "Manual URL",
      providerSource: "",
      description: "",
      rawSourceText: "",
      location: "Remote",
      remoteEligibility: "Remote",
      employmentType: "Full-time",
      seniority: "Senior",
      compensation: "$150k+",
      stack: "Go",
      companyType: "Product",
      freshnessStatus: "Unknown",
      metadata: "{}"
    });

    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).variables.input).toMatchObject({
      searchTopicId: null,
      company: "Acme",
      title: "Engineer",
      sourceKind: "Manual URL",
      freshnessStatus: "Unknown"
    });
  });

  it("maps search run summaries and promotion output", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              runRoleSearch: {
                topicId: "topic-1",
                importedCount: 1,
                skippedCount: 1,
                imported: [
                  {
                    roleId: "role-1",
                    company: "Acme",
                    title: "Engineer",
                    postingUrl: "https://jobs.example/acme"
                  }
                ],
                skipped: [
                  {
                    company: "Dupe",
                    title: "Engineer",
                    postingUrl: "https://jobs.example/dupe",
                    reason: "duplicate"
                  }
                ]
              }
            }
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              promoteRole: {
                role: graphqlRole({
                  decisionStatus: "Promoted",
                  promotedApplicationId: "app-1"
                }),
                application: { id: "app-1" }
              }
            }
          })
        )
      );

    const gateway = createRoleDiscoveryGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await expect(gateway.runSearch("topic-1", 3)).resolves.toMatchObject({
      importedCount: 1,
      skippedCount: 1,
      skipped: [expect.objectContaining({ reason: "duplicate" })]
    });
    await expect(gateway.promoteRole("role-1")).resolves.toMatchObject({
      applicationId: "app-1",
      role: expect.objectContaining({ decisionStatus: "Promoted" })
    });
  });
});

function graphqlRole(overrides = {}) {
  return {
    id: "role-1",
    searchTopicId: "topic-1",
    company: "Acme",
    title: "Engineer",
    postingUrl: "https://jobs.example/acme",
    source: "Other",
    sourceKind: "Search result",
    providerSource: "fake search",
    description: "Role description",
    rawSourceText: "Raw text",
    location: "Remote",
    remoteEligibility: "Remote",
    employmentType: "Full-time",
    seniority: "Senior",
    compensation: "$150k+",
    stack: "Go",
    companyType: "Product",
    freshnessStatus: "Unknown",
    freshnessCheckedAt: null,
    decisionStatus: "New",
    rejectionReason: "",
    promotedApplicationId: null,
    metadata: "{}",
    createdAt: "2026-07-04T09:00:00.000Z",
    updatedAt: "2026-07-04T09:00:00.000Z",
    ...overrides
  };
}
