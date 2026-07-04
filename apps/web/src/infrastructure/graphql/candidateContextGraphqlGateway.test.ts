import { afterEach, describe, expect, it, vi } from "vitest";

import { createCandidateContextGraphqlGateway } from "./candidateContextGraphqlGateway";

describe("GraphQL candidate context gateway", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps candidate profile records from GraphQL into frontend domain data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            candidateProfile: graphqlProfile({
              targetRoles: "Staff Frontend Engineer"
            })
          }
        })
      )
    );

    const gateway = createCandidateContextGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await expect(gateway.getCandidateProfile()).resolves.toMatchObject({
      id: "default",
      targetRoles: "Staff Frontend Engineer",
      preferredStack: "React, TypeScript"
    });
  });

  it("sends profile updates as the GraphQL update input", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            updateCandidateProfile: graphqlProfile({
              targetRoles: "Staff Frontend Engineer"
            })
          }
        })
      )
    );

    const gateway = createCandidateContextGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await gateway.updateCandidateProfile({
      targetRoles: "Staff Frontend Engineer",
      preferredStack: "React, TypeScript",
      compensationExpectations: "$160k+",
      locationPreferences: "Remote",
      workConstraints: "No relocation",
      companyPreferences: "Product teams",
      writingTone: "Direct",
      positioningSummary: "Frontend platform leader"
    });

    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).variables.input).toEqual({
      targetRoles: "Staff Frontend Engineer",
      preferredStack: "React, TypeScript",
      compensationExpectations: "$160k+",
      locationPreferences: "Remote",
      workConstraints: "No relocation",
      companyPreferences: "Product teams",
      writingTone: "Direct",
      positioningSummary: "Frontend platform leader"
    });
  });

  it("maps memory flags, metadata, and supersession fields", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            candidateMemoryRecords: [
              graphqlMemoryRecord({
                approved: true,
                sensitive: true,
                metadata: '{"tags":["frontend"]}',
                supersededBy: "memory-2"
              })
            ]
          }
        })
      )
    );

    const gateway = createCandidateContextGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await expect(gateway.listCandidateMemoryRecords()).resolves.toEqual([
      expect.objectContaining({
        id: "memory-1",
        memoryType: "Skill",
        approved: true,
        sensitive: true,
        metadata: '{"tags":["frontend"]}',
        supersededBy: "memory-2"
      })
    ]);
  });

  it("maps artifact current content and provenance while preserving source content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            aiArtifacts: [
              graphqlArtifact({
                generatedContent: "Generated version",
                userEditedContent: "Edited version",
                currentContent: "Edited version",
                sensitive: true,
                status: "Approved"
              })
            ]
          }
        })
      )
    );

    const gateway = createCandidateContextGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await expect(
      gateway.listAIArtifacts({ type: "CandidateProfile", id: "default" })
    ).resolves.toEqual([
      expect.objectContaining({
        id: "artifact-1",
        modelContent: "Generated version",
        currentContent: "Edited version",
        sensitive: true,
        status: "Approved",
        provenance: expect.objectContaining({
          providerName: "fake",
          modelName: "test-model"
        })
      })
    ]);
  });

  it("translates artifact creation model content into the GraphQL generated content field", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            createAIArtifact: graphqlArtifact({
              generatedContent: "Generated version"
            })
          }
        })
      )
    );

    const gateway = createCandidateContextGraphqlGateway(
      "https://api.example.test/graphql"
    );

    await gateway.createAIArtifact({
      artifactType: "Recruiter message",
      ownerType: "CandidateProfile",
      ownerId: "default",
      title: "Recruiter intro",
      sourceInputs: "[]",
      modelContent: "Generated version",
      userEditedContent: null,
      status: "Draft",
      sensitive: false,
      providerName: "fake",
      modelName: "test-model",
      promptId: "recruiter-v1",
      usageMetadata: "{}",
      rawProviderId: null
    });

    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).variables.input).toMatchObject({
      generatedContent: "Generated version",
      ownerType: "CandidateProfile",
      ownerId: "default"
    });
  });
});

function graphqlProfile(overrides = {}) {
  return {
    id: "default",
    targetRoles: "Frontend Engineer",
    preferredStack: "React, TypeScript",
    compensationExpectations: "$160k+",
    locationPreferences: "Remote",
    workConstraints: "No relocation",
    companyPreferences: "Product teams",
    writingTone: "Direct",
    positioningSummary: "Frontend platform leader",
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    ...overrides
  };
}

function graphqlMemoryRecord(overrides = {}) {
  return {
    id: "memory-1",
    memoryType: "Skill",
    title: "React leadership",
    body: "Led frontend platform work.",
    source: "Profile import",
    approved: true,
    sensitive: false,
    archivedAt: null,
    supersededBy: null,
    metadata: "{}",
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    ...overrides
  };
}

function graphqlArtifact(overrides = {}) {
  return {
    id: "artifact-1",
    artifactType: "Recruiter message",
    owner: {
      type: "CandidateProfile",
      id: "default"
    },
    title: "Recruiter intro",
    sourceInputs: "[]",
    generatedContent: "Generated draft",
    userEditedContent: "Edited draft",
    currentContent: "Edited draft",
    status: "Draft",
    sensitive: false,
    supersededBy: null,
    provenance: {
      providerName: "fake",
      modelName: "test-model",
      promptId: "recruiter-v1",
      usageMetadata: "{}",
      rawProviderId: null
    },
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    ...overrides
  };
}
