import type { RoleDiscoveryGateway } from "./ports/roleDiscoveryGateway";
import type {
  RoleDecisionStatus,
  RoleFreshnessStatus,
  RoleRecordCommand,
  RoleRecordsFilter,
  RoleRejectionReason,
  RoleSearchTopicCommand
} from "../domain/roleDiscovery";

export function listRoleSearchTopics(gateway: RoleDiscoveryGateway) {
  return gateway.listTopics();
}

export function createRoleSearchTopic(
  gateway: RoleDiscoveryGateway,
  command: RoleSearchTopicCommand
) {
  return gateway.createTopic(command);
}

export function updateRoleSearchTopic(
  gateway: RoleDiscoveryGateway,
  id: string,
  command: RoleSearchTopicCommand
) {
  return gateway.updateTopic(id, command);
}

export function runRoleSearch(
  gateway: RoleDiscoveryGateway,
  topicId: string,
  maxRoles?: number
) {
  return gateway.runSearch(topicId, maxRoles);
}

export function listRoleRecords(
  gateway: RoleDiscoveryGateway,
  filter?: RoleRecordsFilter
) {
  return gateway.listRoles(filter);
}

export function getRoleRecord(gateway: RoleDiscoveryGateway, id: string) {
  return gateway.getRole(id);
}

export function createRoleFromUrl(
  gateway: RoleDiscoveryGateway,
  command: RoleRecordCommand
) {
  return gateway.createRoleFromUrl(withDefaultMetadata(command));
}

export function createRoleFromPaste(
  gateway: RoleDiscoveryGateway,
  command: RoleRecordCommand
) {
  return gateway.createRoleFromPaste(withDefaultMetadata(command));
}

export function updateRoleRecord(
  gateway: RoleDiscoveryGateway,
  id: string,
  command: RoleRecordCommand
) {
  return gateway.updateRole(id, withDefaultMetadata(command));
}

export function updateRoleDecision(
  gateway: RoleDiscoveryGateway,
  id: string,
  status: RoleDecisionStatus,
  rejectionReason?: RoleRejectionReason
) {
  return gateway.updateRoleDecision(id, status, rejectionReason);
}

export function updateRoleFreshness(
  gateway: RoleDiscoveryGateway,
  id: string,
  status: RoleFreshnessStatus,
  checkedAt?: string
) {
  return gateway.updateRoleFreshness(id, status, checkedAt);
}

export function promoteRole(gateway: RoleDiscoveryGateway, id: string) {
  return gateway.promoteRole(id);
}

function withDefaultMetadata(command: RoleRecordCommand) {
  return {
    ...command,
    metadata: command.metadata.trim() || "{}"
  };
}
