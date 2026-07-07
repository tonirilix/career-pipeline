import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  createRoleFromPaste,
  createRoleFromUrl,
  createRoleSearchTopic,
  listRoleRecords,
  listRoleSearchTopics,
  promoteRole,
  runRoleSearch,
  updateRoleDecision,
  updateRoleFreshness,
  updateRoleRecord,
  updateRoleSearchTopic
} from "../application/roleDiscovery";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type {
  RoleDecisionStatus,
  RoleFreshnessStatus,
  RoleRecord,
  RoleRecordCommand,
  RoleRecordsFilter,
  RoleRejectionReason,
  RoleSearchRunResult,
  RoleSearchTopic,
  RoleSearchTopicCommand
} from "../domain/roleDiscovery";
import {
  invalidateRoleRecords,
  roleDiscoveryMutationKeys,
  roleDiscoveryQueryKeys,
  upsertCachedRole,
  upsertCachedTopic
} from "../infrastructure/query/roleDiscoveryQueries";
import type { CommandStatus } from "./useJobApplications";

const emptyTopics: RoleSearchTopic[] = [];
const emptyRoles: RoleRecord[] = [];

export function useRoleDiscovery(gateway: RoleDiscoveryGateway) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<RoleRecordsFilter>({});
  const [lastSearchResult, setLastSearchResult] =
    useState<RoleSearchRunResult | null>(null);

  const topicsQuery = useQuery({
    queryKey: roleDiscoveryQueryKeys.topics(),
    queryFn: () => listRoleSearchTopics(stableGateway)
  });

  const rolesQuery = useQuery({
    queryKey: roleDiscoveryQueryKeys.roles(filter),
    queryFn: () => listRoleRecords(stableGateway, cleanFilter(filter))
  });

  const createTopicMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.createTopic(),
    mutationFn: (command: RoleSearchTopicCommand) =>
      createRoleSearchTopic(stableGateway, command),
    onSuccess: (topic) => upsertCachedTopic(queryClient, topic)
  });

  const updateTopicMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.updateTopic(),
    mutationFn: ({
      id,
      command
    }: {
      id: string;
      command: RoleSearchTopicCommand;
    }) => updateRoleSearchTopic(stableGateway, id, command),
    onSuccess: (topic) => upsertCachedTopic(queryClient, topic)
  });

  const runSearchMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.runSearch(),
    mutationFn: ({ topicId, maxRoles }: { topicId: string; maxRoles?: number }) =>
      runRoleSearch(stableGateway, topicId, maxRoles),
    onSuccess: (result) => {
      setLastSearchResult(result);
      invalidateRoleRecords(queryClient);
    }
  });

  const createRoleMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.createRole(),
    mutationFn: ({
      command,
      kind
    }: {
      command: RoleRecordCommand;
      kind: "url" | "paste";
    }) =>
      kind === "url"
        ? createRoleFromUrl(stableGateway, command)
        : createRoleFromPaste(stableGateway, command),
    onSuccess: (role) => upsertCachedRole(queryClient, role)
  });

  const updateRoleMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.updateRole(),
    mutationFn: ({
      id,
      command
    }: {
      id: string;
      command: RoleRecordCommand;
    }) => updateRoleRecord(stableGateway, id, command),
    onSuccess: (role) => upsertCachedRole(queryClient, role)
  });

  const updateDecisionMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.updateDecision(),
    mutationFn: ({
      id,
      status,
      rejectionReason
    }: {
      id: string;
      status: RoleDecisionStatus;
      rejectionReason?: RoleRejectionReason;
    }) => updateRoleDecision(stableGateway, id, status, rejectionReason),
    onSuccess: (role) => upsertCachedRole(queryClient, role)
  });

  const updateFreshnessMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.updateFreshness(),
    mutationFn: ({
      id,
      status,
      checkedAt
    }: {
      id: string;
      status: RoleFreshnessStatus;
      checkedAt?: string;
    }) => updateRoleFreshness(stableGateway, id, status, checkedAt),
    onSuccess: (role) => upsertCachedRole(queryClient, role)
  });

  const promoteRoleMutation = useMutation({
    mutationKey: roleDiscoveryMutationKeys.promoteRole(),
    mutationFn: (id: string) => promoteRole(stableGateway, id),
    onSuccess: (result) => upsertCachedRole(queryClient, result.role)
  });

  return {
    createRoleFromPaste: (command: RoleRecordCommand) =>
      createRoleMutation.mutateAsync({ command, kind: "paste" }),
    createRoleFromUrl: (command: RoleRecordCommand) =>
      createRoleMutation.mutateAsync({ command, kind: "url" }),
    createRoleStatus: createRoleMutation.status as CommandStatus,
    createTopic: (command: RoleSearchTopicCommand) =>
      createTopicMutation.mutateAsync(command),
    createTopicStatus: createTopicMutation.status as CommandStatus,
    filter,
    isError: topicsQuery.isError || rolesQuery.isError,
    isLoading: topicsQuery.isPending || rolesQuery.isPending,
    lastSearchResult,
    promoteRole: (id: string) => promoteRoleMutation.mutateAsync(id),
    promoteRoleStatus: promoteRoleMutation.status as CommandStatus,
    roles: rolesQuery.data ?? emptyRoles,
    runSearch: (topicId: string, maxRoles?: number) =>
      runSearchMutation.mutateAsync({ topicId, maxRoles }),
    runSearchStatus: runSearchMutation.status as CommandStatus,
    setFilter,
    topics: topicsQuery.data ?? emptyTopics,
    updateDecision: (
      id: string,
      status: RoleDecisionStatus,
      rejectionReason?: RoleRejectionReason
    ) => updateDecisionMutation.mutateAsync({ id, status, rejectionReason }),
    updateDecisionStatus: updateDecisionMutation.status as CommandStatus,
    updateFreshness: (
      id: string,
      status: RoleFreshnessStatus,
      checkedAt?: string
    ) => updateFreshnessMutation.mutateAsync({ id, status, checkedAt }),
    updateFreshnessStatus: updateFreshnessMutation.status as CommandStatus,
    updateRole: (id: string, command: RoleRecordCommand) =>
      updateRoleMutation.mutateAsync({ id, command }),
    updateRoleStatus: updateRoleMutation.status as CommandStatus,
    updateTopic: (id: string, command: RoleSearchTopicCommand) =>
      updateTopicMutation.mutateAsync({ id, command }),
    updateTopicStatus: updateTopicMutation.status as CommandStatus
  };
}

function cleanFilter(filter: RoleRecordsFilter) {
  return Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== "" && value != null)
  );
}
