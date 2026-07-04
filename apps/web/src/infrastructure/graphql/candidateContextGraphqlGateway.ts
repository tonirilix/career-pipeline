import type { CandidateContextGateway } from "../../application/ports/candidateContextGateway";
import type {
  AIArtifact,
  ArtifactStatus,
  CandidateGroundingContext,
  CandidateMemoryRecord,
  CandidateProfile,
  MemoryType
} from "../../domain/candidateContext";
import aiArtifactFieldsDocument from "./aiArtifactFields.graphql?raw";
import archiveCandidateMemoryRecordDocument from "./archiveCandidateMemoryRecord.graphql?raw";
import candidateMemoryRecordFieldsDocument from "./candidateMemoryRecordFields.graphql?raw";
import candidateProfileFieldsDocument from "./candidateProfileFields.graphql?raw";
import createAIArtifactDocument from "./createAIArtifact.graphql?raw";
import createCandidateMemoryRecordDocument from "./createCandidateMemoryRecord.graphql?raw";
import editAIArtifactDocument from "./editAIArtifact.graphql?raw";
import getCandidateGroundingContextDocument from "./getCandidateGroundingContext.graphql?raw";
import getCandidateProfileDocument from "./getCandidateProfile.graphql?raw";
import type {
  AiArtifactFieldsFragment,
  ArchiveCandidateMemoryRecordMutation,
  ArchiveCandidateMemoryRecordMutationVariables,
  CandidateMemoryRecordFieldsFragment,
  CandidateProfileFieldsFragment,
  CreateAiArtifactMutation,
  CreateAiArtifactMutationVariables,
  CreateCandidateMemoryRecordMutation,
  CreateCandidateMemoryRecordMutationVariables,
  EditAiArtifactMutation,
  EditAiArtifactMutationVariables,
  GetCandidateGroundingContextQuery,
  GetCandidateProfileQuery,
  ListAiArtifactsQuery,
  ListAiArtifactsQueryVariables,
  ListCandidateMemoryRecordsQuery,
  SupersedeAiArtifactMutation,
  SupersedeAiArtifactMutationVariables,
  SupersedeCandidateMemoryRecordMutation,
  SupersedeCandidateMemoryRecordMutationVariables,
  UpdateAiArtifactStatusMutation,
  UpdateAiArtifactStatusMutationVariables,
  UpdateCandidateMemoryRecordMutation,
  UpdateCandidateMemoryRecordMutationVariables,
  UpdateCandidateProfileMutation,
  UpdateCandidateProfileMutationVariables
} from "./generated";
import listAIArtifactsDocument from "./listAIArtifacts.graphql?raw";
import listCandidateMemoryRecordsDocument from "./listCandidateMemoryRecords.graphql?raw";
import supersedeAIArtifactDocument from "./supersedeAIArtifact.graphql?raw";
import supersedeCandidateMemoryRecordDocument from "./supersedeCandidateMemoryRecord.graphql?raw";
import updateAIArtifactStatusDocument from "./updateAIArtifactStatus.graphql?raw";
import updateCandidateMemoryRecordDocument from "./updateCandidateMemoryRecord.graphql?raw";
import updateCandidateProfileDocument from "./updateCandidateProfile.graphql?raw";
import { graphqlEndpoint, requestGraphql } from "./graphqlClient";

export const candidateContextGraphqlOperations = [
  operationDocument(getCandidateProfileDocument),
  operationDocument(updateCandidateProfileDocument),
  operationDocument(listCandidateMemoryRecordsDocument),
  operationDocument(createCandidateMemoryRecordDocument),
  operationDocument(updateCandidateMemoryRecordDocument),
  operationDocument(archiveCandidateMemoryRecordDocument),
  operationDocument(supersedeCandidateMemoryRecordDocument),
  operationDocument(getCandidateGroundingContextDocument),
  operationDocument(listAIArtifactsDocument),
  operationDocument(createAIArtifactDocument),
  operationDocument(editAIArtifactDocument),
  operationDocument(updateAIArtifactStatusDocument),
  operationDocument(supersedeAIArtifactDocument)
] as const;

export function createCandidateContextGraphqlGateway(
  endpoint = graphqlEndpoint()
): CandidateContextGateway {
  return {
    async getCandidateProfile() {
      const response = await requestGraphql<GetCandidateProfileQuery>(endpoint, {
        query: operationDocument(getCandidateProfileDocument),
        operationName: "GetCandidateProfile"
      });

      return mapCandidateProfile(response.candidateProfile);
    },

    async updateCandidateProfile(command) {
      const variables = {
        input: command
      } satisfies UpdateCandidateProfileMutationVariables;
      const response = await requestGraphql<UpdateCandidateProfileMutation>(
        endpoint,
        {
          query: operationDocument(updateCandidateProfileDocument),
          operationName: "UpdateCandidateProfile",
          variables
        }
      );

      return mapCandidateProfile(response.updateCandidateProfile);
    },

    async listCandidateMemoryRecords() {
      const response = await requestGraphql<ListCandidateMemoryRecordsQuery>(
        endpoint,
        {
          query: operationDocument(listCandidateMemoryRecordsDocument),
          operationName: "ListCandidateMemoryRecords"
        }
      );

      return response.candidateMemoryRecords.map(mapCandidateMemoryRecord);
    },

    async createCandidateMemoryRecord(command) {
      const variables = {
        input: command
      } satisfies CreateCandidateMemoryRecordMutationVariables;
      const response = await requestGraphql<CreateCandidateMemoryRecordMutation>(
        endpoint,
        {
          query: operationDocument(createCandidateMemoryRecordDocument),
          operationName: "CreateCandidateMemoryRecord",
          variables
        }
      );

      return mapCandidateMemoryRecord(response.createCandidateMemoryRecord);
    },

    async updateCandidateMemoryRecord(id, command) {
      const variables = {
        input: { id, ...command }
      } satisfies UpdateCandidateMemoryRecordMutationVariables;
      const response = await requestGraphql<UpdateCandidateMemoryRecordMutation>(
        endpoint,
        {
          query: operationDocument(updateCandidateMemoryRecordDocument),
          operationName: "UpdateCandidateMemoryRecord",
          variables
        }
      );

      return mapCandidateMemoryRecord(response.updateCandidateMemoryRecord);
    },

    async archiveCandidateMemoryRecord(id) {
      const variables = { id } satisfies ArchiveCandidateMemoryRecordMutationVariables;
      const response = await requestGraphql<ArchiveCandidateMemoryRecordMutation>(
        endpoint,
        {
          query: operationDocument(archiveCandidateMemoryRecordDocument),
          operationName: "ArchiveCandidateMemoryRecord",
          variables
        }
      );

      return mapCandidateMemoryRecord(response.archiveCandidateMemoryRecord);
    },

    async supersedeCandidateMemoryRecord(id, supersededBy) {
      const variables = {
        id,
        supersededBy
      } satisfies SupersedeCandidateMemoryRecordMutationVariables;
      const response =
        await requestGraphql<SupersedeCandidateMemoryRecordMutation>(endpoint, {
          query: operationDocument(supersedeCandidateMemoryRecordDocument),
          operationName: "SupersedeCandidateMemoryRecord",
          variables
        });

      return mapCandidateMemoryRecord(response.supersedeCandidateMemoryRecord);
    },

    async getCandidateGroundingContext() {
      const response = await requestGraphql<GetCandidateGroundingContextQuery>(
        endpoint,
        {
          query: operationDocument(getCandidateGroundingContextDocument),
          operationName: "GetCandidateGroundingContext"
        }
      );

      return {
        profile: mapCandidateProfile(response.candidateGroundingContext.profile),
        memory: response.candidateGroundingContext.memory.map(
          mapCandidateMemoryRecord
        )
      } satisfies CandidateGroundingContext;
    },

    async listAIArtifacts(owner) {
      const variables = {
        ownerType: owner.type,
        ownerId: owner.id
      } satisfies ListAiArtifactsQueryVariables;
      const response = await requestGraphql<ListAiArtifactsQuery>(endpoint, {
        query: operationDocument(listAIArtifactsDocument),
        operationName: "ListAIArtifacts",
        variables
      });

      return response.aiArtifacts.map(mapAIArtifact);
    },

    async createAIArtifact(command) {
      const variables = {
        input: {
          artifactType: command.artifactType,
          ownerType: command.ownerType,
          ownerId: command.ownerId,
          title: command.title,
          sourceInputs: command.sourceInputs,
          generatedContent: command.modelContent,
          userEditedContent: command.userEditedContent,
          status: command.status,
          sensitive: command.sensitive,
          providerName: command.providerName,
          modelName: command.modelName,
          promptId: command.promptId,
          usageMetadata: command.usageMetadata,
          rawProviderId: command.rawProviderId
        }
      } satisfies CreateAiArtifactMutationVariables;
      const response = await requestGraphql<CreateAiArtifactMutation>(endpoint, {
        query: operationDocument(createAIArtifactDocument),
        operationName: "CreateAIArtifact",
        variables
      });

      return mapAIArtifact(response.createAIArtifact);
    },

    async editAIArtifact(id, userEditedContent) {
      const variables = {
        id,
        userEditedContent
      } satisfies EditAiArtifactMutationVariables;
      const response = await requestGraphql<EditAiArtifactMutation>(endpoint, {
        query: operationDocument(editAIArtifactDocument),
        operationName: "EditAIArtifact",
        variables
      });

      return mapAIArtifact(response.editAIArtifact);
    },

    async updateAIArtifactStatus(id, status) {
      const variables = {
        id,
        status
      } satisfies UpdateAiArtifactStatusMutationVariables;
      const response = await requestGraphql<UpdateAiArtifactStatusMutation>(
        endpoint,
        {
          query: operationDocument(updateAIArtifactStatusDocument),
          operationName: "UpdateAIArtifactStatus",
          variables
        }
      );

      return mapAIArtifact(response.updateAIArtifactStatus);
    },

    async supersedeAIArtifact(id, supersededBy) {
      const variables = {
        id,
        supersededBy
      } satisfies SupersedeAiArtifactMutationVariables;
      const response = await requestGraphql<SupersedeAiArtifactMutation>(
        endpoint,
        {
          query: operationDocument(supersedeAIArtifactDocument),
          operationName: "SupersedeAIArtifact",
          variables
        }
      );

      return mapAIArtifact(response.supersedeAIArtifact);
    }
  };
}

function operationDocument(operation: string) {
  const fragments = [
    operation.includes("CandidateProfileFields")
      ? candidateProfileFieldsDocument
      : "",
    operation.includes("CandidateMemoryRecordFields")
      ? candidateMemoryRecordFieldsDocument
      : "",
    operation.includes("AIArtifactFields") ? aiArtifactFieldsDocument : ""
  ].filter(Boolean);

  return `${fragments.join("\n\n")}\n\n${operation}`;
}

function mapCandidateProfile(
  dto: CandidateProfileFieldsFragment
): CandidateProfile {
  return {
    id: dto.id,
    targetRoles: dto.targetRoles,
    preferredStack: dto.preferredStack,
    compensationExpectations: dto.compensationExpectations,
    locationPreferences: dto.locationPreferences,
    workConstraints: dto.workConstraints,
    companyPreferences: dto.companyPreferences,
    writingTone: dto.writingTone,
    positioningSummary: dto.positioningSummary,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function mapCandidateMemoryRecord(
  dto: CandidateMemoryRecordFieldsFragment
): CandidateMemoryRecord {
  return {
    id: dto.id,
    memoryType: dto.memoryType as MemoryType,
    title: dto.title,
    body: dto.body,
    source: dto.source,
    approved: dto.approved,
    sensitive: dto.sensitive,
    archivedAt: dto.archivedAt,
    supersededBy: dto.supersededBy,
    metadata: dto.metadata,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function mapAIArtifact(dto: AiArtifactFieldsFragment): AIArtifact {
  return {
    id: dto.id,
    artifactType: dto.artifactType,
    owner: {
      type: dto.owner.type,
      id: dto.owner.id
    },
    title: dto.title,
    sourceInputs: dto.sourceInputs,
    modelContent: dto.generatedContent,
    userEditedContent: dto.userEditedContent,
    currentContent: dto.currentContent,
    status: dto.status as ArtifactStatus,
    sensitive: dto.sensitive,
    supersededBy: dto.supersededBy,
    provenance: {
      providerName: dto.provenance.providerName,
      modelName: dto.provenance.modelName,
      promptId: dto.provenance.promptId,
      usageMetadata: dto.provenance.usageMetadata,
      rawProviderId: dto.provenance.rawProviderId
    },
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

