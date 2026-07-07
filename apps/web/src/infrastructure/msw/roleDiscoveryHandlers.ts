import { graphql, HttpResponse } from "msw";

import type {
  RoleDecisionStatus,
  RoleFreshnessStatus,
  RoleRecordCommand,
  RoleRecordsFilter,
  RoleRejectionReason,
  RoleSearchTopicCommand
} from "../../domain/roleDiscovery";
import { roleDiscoveryMockBackend } from "../mockBackend/roleDiscoveryMockBackend";

export const roleDiscoveryHandlers = [
  graphql.query("ListRoleSearchTopics", () =>
    HttpResponse.json({
      data: { roleSearchTopics: roleDiscoveryMockBackend.listTopics() }
    })
  ),

  graphql.mutation("CreateRoleSearchTopic", ({ variables }) => {
    const { input } = variables as { input: RoleSearchTopicCommand };
    return HttpResponse.json({
      data: { createRoleSearchTopic: roleDiscoveryMockBackend.createTopic(input) }
    });
  }),

  graphql.mutation("UpdateRoleSearchTopic", ({ variables }) => {
    const { input } = variables as {
      input: RoleSearchTopicCommand & { id: string };
    };
    return HttpResponse.json({
      data: { updateRoleSearchTopic: roleDiscoveryMockBackend.updateTopic(input) }
    });
  }),

  graphql.mutation("RunRoleSearch", ({ variables }) => {
    const { topicId } = variables as { topicId: string };
    return HttpResponse.json({
      data: { runRoleSearch: roleDiscoveryMockBackend.runSearch(topicId) }
    });
  }),

  graphql.query("ListRoleRecords", ({ variables }) => {
    const { filter } = variables as { filter?: RoleRecordsFilter | null };
    return HttpResponse.json({
      data: { roleRecords: roleDiscoveryMockBackend.listRoles(filter ?? undefined) }
    });
  }),

  graphql.query("GetRoleRecord", ({ variables }) => {
    const { id } = variables as { id: string };
    return HttpResponse.json({
      data: { roleRecord: roleDiscoveryMockBackend.getRole(id) }
    });
  }),

  graphql.mutation("CreateRoleFromUrl", ({ variables }) => {
    const { input } = variables as { input: RoleRecordCommand };
    return withErrors(() => ({
      createRoleFromUrl: roleDiscoveryMockBackend.createRole(input)
    }));
  }),

  graphql.mutation("CreateRoleFromPaste", ({ variables }) => {
    const { input } = variables as { input: RoleRecordCommand };
    return withErrors(() => ({
      createRoleFromPaste: roleDiscoveryMockBackend.createRole(input)
    }));
  }),

  graphql.mutation("UpdateRoleRecord", ({ variables }) => {
    const { id, input } = variables as {
      id: string;
      input: RoleRecordCommand;
    };
    return withErrors(() => ({
      updateRoleRecord: roleDiscoveryMockBackend.updateRole(id, input)
    }));
  }),

  graphql.mutation("UpdateRoleDecision", ({ variables }) => {
    const { id, status, rejectionReason } = variables as {
      id: string;
      status: RoleDecisionStatus;
      rejectionReason?: RoleRejectionReason | null;
    };
    return withErrors(() => ({
      updateRoleDecision: roleDiscoveryMockBackend.updateDecision(
        id,
        status,
        rejectionReason ?? undefined
      )
    }));
  }),

  graphql.mutation("UpdateRoleFreshness", ({ variables }) => {
    const { id, status, checkedAt } = variables as {
      id: string;
      status: RoleFreshnessStatus;
      checkedAt?: string | null;
    };
    return withErrors(() => ({
      updateRoleFreshness: roleDiscoveryMockBackend.updateFreshness(
        id,
        status,
        checkedAt ?? undefined
      )
    }));
  }),

  graphql.mutation("PromoteRole", ({ variables }) => {
    const { id } = variables as { id: string };
    return withErrors(() => {
      const result = roleDiscoveryMockBackend.promoteRole(id);
      return {
        promoteRole: {
          role: result.role,
          application: { id: result.applicationId }
        }
      };
    });
  })
];

export function resetRoleDiscoveryMockData() {
  roleDiscoveryMockBackend.reset();
}

function withErrors<T>(fn: () => T) {
  try {
    return HttpResponse.json<{ data: T }>({ data: fn() });
  } catch (error) {
    return HttpResponse.json<{ errors: { message: string }[] }>({
      errors: [
        {
          message:
            error instanceof Error ? error.message : "Mock backend request failed."
        }
      ]
    });
  }
}
