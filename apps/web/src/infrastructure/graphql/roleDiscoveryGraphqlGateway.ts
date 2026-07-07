import type { RoleDiscoveryGateway } from "../../application/ports/roleDiscoveryGateway";
import type {
  RoleCompanyType,
  RoleDecisionStatus,
  RoleFreshnessStatus,
  RoleRecord,
  RoleRecordCommand,
  RoleRemoteEligibility,
  RoleRejectionReason,
  RoleSearchTopic,
  RoleSearchTopicCommand,
  RoleSeniority,
  RoleSourceKind
} from "../../domain/roleDiscovery";
import type { EmploymentType } from "../../domain/jobOpportunity";
import createRoleFromPasteDocument from "./createRoleFromPaste.graphql?raw";
import createRoleFromUrlDocument from "./createRoleFromUrl.graphql?raw";
import createRoleSearchTopicDocument from "./createRoleSearchTopic.graphql?raw";
import getRoleRecordDocument from "./getRoleRecord.graphql?raw";
import type {
  CreateRoleFromPasteMutation,
  CreateRoleFromPasteMutationVariables,
  CreateRoleFromUrlMutation,
  CreateRoleFromUrlMutationVariables,
  CreateRoleSearchTopicMutation,
  CreateRoleSearchTopicMutationVariables,
  GetRoleRecordQuery,
  GetRoleRecordQueryVariables,
  ListRoleRecordsQuery,
  ListRoleRecordsQueryVariables,
  ListRoleSearchTopicsQuery,
  PromoteRoleMutation,
  PromoteRoleMutationVariables,
  RoleRecordFieldsFragment,
  RoleSearchTopicFieldsFragment,
  RunRoleSearchMutation,
  RunRoleSearchMutationVariables,
  UpdateRoleDecisionMutation,
  UpdateRoleDecisionMutationVariables,
  UpdateRoleFreshnessMutation,
  UpdateRoleFreshnessMutationVariables,
  UpdateRoleRecordMutation,
  UpdateRoleRecordMutationVariables,
  UpdateRoleSearchTopicMutation,
  UpdateRoleSearchTopicMutationVariables
} from "./generated";
import listRoleRecordsDocument from "./listRoleRecords.graphql?raw";
import listRoleSearchTopicsDocument from "./listRoleSearchTopics.graphql?raw";
import promoteRoleDocument from "./promoteRole.graphql?raw";
import roleRecordFieldsDocument from "./roleRecordFields.graphql?raw";
import roleSearchTopicFieldsDocument from "./roleSearchTopicFields.graphql?raw";
import runRoleSearchDocument from "./runRoleSearch.graphql?raw";
import updateRoleDecisionDocument from "./updateRoleDecision.graphql?raw";
import updateRoleFreshnessDocument from "./updateRoleFreshness.graphql?raw";
import updateRoleRecordDocument from "./updateRoleRecord.graphql?raw";
import updateRoleSearchTopicDocument from "./updateRoleSearchTopic.graphql?raw";
import { graphqlEndpoint, requestGraphql } from "./graphqlClient";

export const roleDiscoveryGraphqlOperations = [
  operationDocument(listRoleSearchTopicsDocument),
  operationDocument(createRoleSearchTopicDocument),
  operationDocument(updateRoleSearchTopicDocument),
  operationDocument(runRoleSearchDocument),
  operationDocument(listRoleRecordsDocument),
  operationDocument(getRoleRecordDocument),
  operationDocument(createRoleFromUrlDocument),
  operationDocument(createRoleFromPasteDocument),
  operationDocument(updateRoleRecordDocument),
  operationDocument(updateRoleDecisionDocument),
  operationDocument(updateRoleFreshnessDocument),
  operationDocument(promoteRoleDocument)
] as const;

export function createRoleDiscoveryGraphqlGateway(
  endpoint = graphqlEndpoint()
): RoleDiscoveryGateway {
  return {
    async listTopics() {
      const response = await requestGraphql<ListRoleSearchTopicsQuery>(endpoint, {
        query: operationDocument(listRoleSearchTopicsDocument),
        operationName: "ListRoleSearchTopics"
      });
      return response.roleSearchTopics.map(mapRoleSearchTopic);
    },

    async createTopic(command) {
      const variables = {
        input: { id: null, ...command }
      } satisfies CreateRoleSearchTopicMutationVariables;
      const response = await requestGraphql<CreateRoleSearchTopicMutation>(
        endpoint,
        {
          query: operationDocument(createRoleSearchTopicDocument),
          operationName: "CreateRoleSearchTopic",
          variables
        }
      );
      return mapRoleSearchTopic(response.createRoleSearchTopic);
    },

    async updateTopic(id, command) {
      const variables = {
        input: { id, ...command }
      } satisfies UpdateRoleSearchTopicMutationVariables;
      const response = await requestGraphql<UpdateRoleSearchTopicMutation>(
        endpoint,
        {
          query: operationDocument(updateRoleSearchTopicDocument),
          operationName: "UpdateRoleSearchTopic",
          variables
        }
      );
      return mapRoleSearchTopic(response.updateRoleSearchTopic);
    },

    async runSearch(topicId, maxRoles) {
      const variables = {
        topicId,
        maxRoles: maxRoles ?? null
      } satisfies RunRoleSearchMutationVariables;
      const response = await requestGraphql<RunRoleSearchMutation>(endpoint, {
        query: operationDocument(runRoleSearchDocument),
        operationName: "RunRoleSearch",
        variables
      });
      return {
        topicId: response.runRoleSearch.topicId,
        importedCount: response.runRoleSearch.importedCount,
        skippedCount: response.runRoleSearch.skippedCount,
        imported: response.runRoleSearch.imported.map((item) => ({ ...item })),
        skipped: response.runRoleSearch.skipped.map((item) => ({ ...item }))
      };
    },

    async listRoles(filter) {
      const variables = {
        filter: filter ? mapRoleRecordsFilterInput(filter) : null
      } satisfies ListRoleRecordsQueryVariables;
      const response = await requestGraphql<ListRoleRecordsQuery>(endpoint, {
        query: operationDocument(listRoleRecordsDocument),
        operationName: "ListRoleRecords",
        variables
      });
      return response.roleRecords.map(mapRoleRecord);
    },

    async getRole(id) {
      const variables = { id } satisfies GetRoleRecordQueryVariables;
      const response = await requestGraphql<GetRoleRecordQuery>(endpoint, {
        query: operationDocument(getRoleRecordDocument),
        operationName: "GetRoleRecord",
        variables
      });
      return mapRoleRecord(response.roleRecord);
    },

    async createRoleFromUrl(command) {
      const variables = {
        input: mapRoleRecordInput(command)
      } satisfies CreateRoleFromUrlMutationVariables;
      const response = await requestGraphql<CreateRoleFromUrlMutation>(endpoint, {
        query: operationDocument(createRoleFromUrlDocument),
        operationName: "CreateRoleFromUrl",
        variables
      });
      return mapRoleRecord(response.createRoleFromUrl);
    },

    async createRoleFromPaste(command) {
      const variables = {
        input: mapRoleRecordInput(command)
      } satisfies CreateRoleFromPasteMutationVariables;
      const response = await requestGraphql<CreateRoleFromPasteMutation>(
        endpoint,
        {
          query: operationDocument(createRoleFromPasteDocument),
          operationName: "CreateRoleFromPaste",
          variables
        }
      );
      return mapRoleRecord(response.createRoleFromPaste);
    },

    async updateRole(id, command) {
      const variables = {
        id,
        input: mapRoleRecordInput(command)
      } satisfies UpdateRoleRecordMutationVariables;
      const response = await requestGraphql<UpdateRoleRecordMutation>(endpoint, {
        query: operationDocument(updateRoleRecordDocument),
        operationName: "UpdateRoleRecord",
        variables
      });
      return mapRoleRecord(response.updateRoleRecord);
    },

    async updateRoleDecision(id, status, rejectionReason) {
      const variables = {
        id,
        status,
        rejectionReason: rejectionReason ?? null
      } satisfies UpdateRoleDecisionMutationVariables;
      const response = await requestGraphql<UpdateRoleDecisionMutation>(
        endpoint,
        {
          query: operationDocument(updateRoleDecisionDocument),
          operationName: "UpdateRoleDecision",
          variables
        }
      );
      return mapRoleRecord(response.updateRoleDecision);
    },

    async updateRoleFreshness(id, status, checkedAt) {
      const variables = {
        id,
        status,
        checkedAt: checkedAt ?? null
      } satisfies UpdateRoleFreshnessMutationVariables;
      const response = await requestGraphql<UpdateRoleFreshnessMutation>(
        endpoint,
        {
          query: operationDocument(updateRoleFreshnessDocument),
          operationName: "UpdateRoleFreshness",
          variables
        }
      );
      return mapRoleRecord(response.updateRoleFreshness);
    },

    async promoteRole(id) {
      const variables = { id } satisfies PromoteRoleMutationVariables;
      const response = await requestGraphql<PromoteRoleMutation>(endpoint, {
        query: operationDocument(promoteRoleDocument),
        operationName: "PromoteRole",
        variables
      });
      return {
        role: mapRoleRecord(response.promoteRole.role),
        applicationId: response.promoteRole.application.id
      };
    }
  };
}

function operationDocument(operation: string) {
  const fragments = [
    operation.includes("RoleSearchTopicFields")
      ? roleSearchTopicFieldsDocument
      : "",
    operation.includes("RoleRecordFields") ? roleRecordFieldsDocument : ""
  ].filter(Boolean);

  return `${fragments.join("\n\n")}\n\n${operation}`;
}

function mapRoleSearchTopic(
  dto: RoleSearchTopicFieldsFragment
): RoleSearchTopic {
  return {
    id: dto.id,
    name: dto.name,
    targetTitles: dto.targetTitles,
    preferredStack: dto.preferredStack,
    location: dto.location,
    remotePreference: dto.remotePreference,
    employmentType: dto.employmentType as EmploymentType,
    companyType: dto.companyType as RoleCompanyType,
    compensation: dto.compensation,
    seniority: dto.seniority as RoleSeniority,
    notes: dto.notes,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function mapRoleRecord(dto: RoleRecordFieldsFragment): RoleRecord {
  return {
    id: dto.id,
    searchTopicId: dto.searchTopicId,
    company: dto.company,
    title: dto.title,
    postingUrl: dto.postingUrl,
    source: dto.source,
    sourceKind: dto.sourceKind as RoleSourceKind,
    providerSource: dto.providerSource,
    description: dto.description,
    rawSourceText: dto.rawSourceText,
    location: dto.location,
    remoteEligibility: dto.remoteEligibility as RoleRemoteEligibility,
    employmentType: dto.employmentType as EmploymentType,
    seniority: dto.seniority as RoleSeniority,
    compensation: dto.compensation,
    stack: dto.stack,
    companyType: dto.companyType as RoleCompanyType,
    freshnessStatus: dto.freshnessStatus as RoleFreshnessStatus,
    freshnessCheckedAt: dto.freshnessCheckedAt,
    decisionStatus: dto.decisionStatus as RoleDecisionStatus,
    rejectionReason: dto.rejectionReason as RoleRejectionReason,
    promotedApplicationId: dto.promotedApplicationId,
    metadata: dto.metadata,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function mapRoleRecordInput(command: RoleRecordCommand) {
  return {
    searchTopicId: command.searchTopicId ?? null,
    company: command.company,
    title: command.title,
    postingUrl: command.postingUrl,
    source: command.source,
    sourceKind: command.sourceKind ?? null,
    providerSource: command.providerSource ?? null,
    description: command.description,
    rawSourceText: command.rawSourceText ?? null,
    location: command.location,
    remoteEligibility: command.remoteEligibility,
    employmentType: command.employmentType,
    seniority: command.seniority,
    compensation: command.compensation,
    stack: command.stack,
    companyType: command.companyType,
    freshnessStatus: command.freshnessStatus ?? null,
    metadata: command.metadata
  };
}

function mapRoleRecordsFilterInput(filter: {
  decisionStatus?: string;
  freshnessStatus?: string;
  sourceKind?: string;
  searchTerm?: string;
}) {
  return {
    decisionStatus: filter.decisionStatus ?? null,
    freshnessStatus: filter.freshnessStatus ?? null,
    sourceKind: filter.sourceKind ?? null,
    searchTerm: filter.searchTerm ?? null
  };
}
