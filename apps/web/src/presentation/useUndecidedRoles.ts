import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { listRoleRecords } from "../application/roleDiscovery";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type { RoleRecord, RoleRecordsFilter } from "../domain/roleDiscovery";
import { roleDiscoveryQueryKeys } from "../infrastructure/query/roleDiscoveryQueries";

const undecidedFilter: RoleRecordsFilter = { decisionStatus: "New" };
const emptyRoles: RoleRecord[] = [];

/**
 * The shell's one narrow roles read: roles with no decision recorded.
 *
 * The rail's Roles count and Today's Triage rows both read this, on one query
 * key, so a single request serves both. `RoleDiscoveryWorkspace` keeps its own
 * fuller, lazily loaded queries under different keys.
 */
export function useUndecidedRoles(gateway: RoleDiscoveryGateway) {
  const stableGateway = useMemo(() => gateway, [gateway]);

  const rolesQuery = useQuery({
    queryKey: roleDiscoveryQueryKeys.roles(undecidedFilter),
    queryFn: () => listRoleRecords(stableGateway, undecidedFilter)
  });

  return {
    roles: rolesQuery.data ?? emptyRoles,
    isLoading: rolesQuery.isPending
  };
}
