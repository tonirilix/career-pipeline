import type {
  PromoteRoleResult,
  RoleDecisionStatus,
  RoleFreshnessStatus,
  RoleRecord,
  RoleRecordCommand,
  RoleRecordsFilter,
  RoleRejectionReason,
  RoleSearchRunResult,
  RoleSearchTopic,
  RoleSearchTopicCommand
} from "../../domain/roleDiscovery";

export type RoleDiscoveryGateway = {
  listTopics(): Promise<RoleSearchTopic[]>;
  createTopic(command: RoleSearchTopicCommand): Promise<RoleSearchTopic>;
  updateTopic(id: string, command: RoleSearchTopicCommand): Promise<RoleSearchTopic>;
  runSearch(topicId: string, maxRoles?: number): Promise<RoleSearchRunResult>;
  listRoles(filter?: RoleRecordsFilter): Promise<RoleRecord[]>;
  getRole(id: string): Promise<RoleRecord>;
  createRoleFromUrl(command: RoleRecordCommand): Promise<RoleRecord>;
  createRoleFromPaste(command: RoleRecordCommand): Promise<RoleRecord>;
  updateRole(id: string, command: RoleRecordCommand): Promise<RoleRecord>;
  updateRoleDecision(
    id: string,
    status: RoleDecisionStatus,
    rejectionReason?: RoleRejectionReason
  ): Promise<RoleRecord>;
  updateRoleFreshness(
    id: string,
    status: RoleFreshnessStatus,
    checkedAt?: string
  ): Promise<RoleRecord>;
  promoteRole(id: string): Promise<PromoteRoleResult>;
};
