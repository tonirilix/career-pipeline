import type { QueryClient } from "@tanstack/react-query";

import type {
  RoleRecord,
  RoleRecordsFilter,
  RoleSearchTopic
} from "../../domain/roleDiscovery";

export const roleDiscoveryQueryKeys = {
  all: ["role-discovery"] as const,
  topics: () => [...roleDiscoveryQueryKeys.all, "topics"] as const,
  roles: (filter?: RoleRecordsFilter) =>
    [...roleDiscoveryQueryKeys.all, "roles", filter ?? {}] as const,
  role: (id: string) => [...roleDiscoveryQueryKeys.all, "role", id] as const
};

export const roleDiscoveryMutationKeys = {
  createTopic: () => ["role-discovery", "create-topic"] as const,
  updateTopic: () => ["role-discovery", "update-topic"] as const,
  runSearch: () => ["role-discovery", "run-search"] as const,
  createRole: () => ["role-discovery", "create-role"] as const,
  updateRole: () => ["role-discovery", "update-role"] as const,
  updateDecision: () => ["role-discovery", "update-decision"] as const,
  updateFreshness: () => ["role-discovery", "update-freshness"] as const,
  promoteRole: () => ["role-discovery", "promote-role"] as const
};

export function upsertCachedTopic(
  queryClient: QueryClient,
  topic: RoleSearchTopic
) {
  queryClient.setQueryData<RoleSearchTopic[]>(
    roleDiscoveryQueryKeys.topics(),
    (current = []) => upsertById(current, topic)
  );
}

export function upsertCachedRole(queryClient: QueryClient, role: RoleRecord) {
  queryClient.setQueriesData<RoleRecord[]>(
    { queryKey: [...roleDiscoveryQueryKeys.all, "roles"] },
    (current = []) => upsertById(current, role)
  );
  queryClient.setQueryData(roleDiscoveryQueryKeys.role(role.id), role);
}

export function invalidateRoleRecords(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: [...roleDiscoveryQueryKeys.all, "roles"]
  });
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  return items.some((candidate) => candidate.id === item.id)
    ? items.map((candidate) => (candidate.id === item.id ? item : candidate))
    : [item, ...items];
}
