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

const now = "2026-07-04T12:00:00Z";

const seedTopics: RoleSearchTopic[] = [
  {
    id: "topic-1",
    name: "Senior full-stack roles",
    targetTitles: "Senior Software Engineer",
    preferredStack: "Go, React, TypeScript",
    location: "Remote",
    remotePreference: "Remote",
    employmentType: "Full-time",
    companyType: "Product",
    compensation: "$150k+",
    seniority: "Senior",
    notes: "Product companies with strong backend ownership.",
    createdAt: now,
    updatedAt: now
  }
];

const seedRoles: RoleRecord[] = [
  {
    id: "role-1",
    searchTopicId: "topic-1",
    company: "Northstar Labs",
    title: "Senior Software Engineer",
    postingUrl: "https://example.com/jobs/northstar-labs-1",
    source: "Other",
    sourceKind: "Search result",
    providerSource: "Mock role search",
    description: "Senior full-stack role using Go and React.",
    rawSourceText: "Mock imported search result.",
    location: "Remote",
    remoteEligibility: "Remote",
    employmentType: "Full-time",
    seniority: "Senior",
    compensation: "$150k+",
    stack: "Go, React, TypeScript",
    companyType: "Product",
    freshnessStatus: "Unknown",
    freshnessCheckedAt: null,
    decisionStatus: "New",
    rejectionReason: "",
    promotedApplicationId: null,
    metadata: "{}",
    createdAt: now,
    updatedAt: now
  }
];

function nextID(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

class RoleDiscoveryMockBackend {
  private topics = [...seedTopics];
  private roles = [...seedRoles];

  reset() {
    this.topics = [...seedTopics];
    this.roles = [...seedRoles];
  }

  listTopics() {
    return [...this.topics].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  createTopic(command: RoleSearchTopicCommand) {
    const topic: RoleSearchTopic = {
      id: nextID("topic"),
      ...command,
      createdAt: now,
      updatedAt: now
    };
    this.topics = [topic, ...this.topics];
    return topic;
  }

  updateTopic(command: RoleSearchTopicCommand & { id: string }) {
    const existing = this.findTopic(command.id);
    const topic = { ...existing, ...command, updatedAt: now };
    this.topics = this.topics.map((candidate) =>
      candidate.id === topic.id ? topic : candidate
    );
    return topic;
  }

  runSearch(topicId: string): RoleSearchRunResult {
    const topic = this.findTopic(topicId);
    const candidates = ["SignalWorks", "Atlas Product Group"].map(
      (company, index) =>
        this.roleFromCommand({
          searchTopicId: topic.id,
          company,
          title: topic.targetTitles || "Software Engineer",
          postingUrl: `https://example.com/jobs/${company.toLowerCase().replaceAll(" ", "-")}-${index + 1}`,
          source: "Other",
          sourceKind: "Search result",
          providerSource: "Mock role search",
          description: `${topic.targetTitles || "Software Engineer"} role using ${topic.preferredStack}.`,
          rawSourceText: `Mock search result for ${topic.name}.`,
          location: topic.location,
          remoteEligibility: "Unknown",
          employmentType: topic.employmentType,
          seniority: topic.seniority,
          compensation: topic.compensation,
          stack: topic.preferredStack,
          companyType: topic.companyType,
          freshnessStatus: "Unknown",
          metadata: "{}"
        })
    );

    const imported = [];
    const skipped = [];
    for (const candidate of candidates) {
      if (this.roles.some((role) => role.postingUrl === candidate.postingUrl)) {
        skipped.push({
          company: candidate.company,
          title: candidate.title,
          postingUrl: candidate.postingUrl,
          reason: "duplicate"
        });
      } else {
        this.roles = [candidate, ...this.roles];
        imported.push({
          roleId: candidate.id,
          company: candidate.company,
          title: candidate.title,
          postingUrl: candidate.postingUrl
        });
      }
    }
    return {
      topicId,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped
    };
  }

  listRoles(filter?: RoleRecordsFilter) {
    return this.roles.filter((role) => {
      if (filter?.decisionStatus && role.decisionStatus !== filter.decisionStatus) {
        return false;
      }
      if (
        filter?.freshnessStatus &&
        role.freshnessStatus !== filter.freshnessStatus
      ) {
        return false;
      }
      if (filter?.sourceKind && role.sourceKind !== filter.sourceKind) {
        return false;
      }
      if (filter?.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        return `${role.company} ${role.title}`.toLowerCase().includes(term);
      }
      return true;
    });
  }

  getRole(id: string) {
    return this.findRole(id);
  }

  createRole(command: RoleRecordCommand) {
    if (
      command.postingUrl &&
      this.roles.some((role) => role.postingUrl === command.postingUrl)
    ) {
      throw new Error("an active role already exists for that posting URL");
    }
    const role = this.roleFromCommand(command);
    this.roles = [role, ...this.roles];
    return role;
  }

  updateRole(id: string, command: RoleRecordCommand) {
    const existing = this.findRole(id);
    const role = { ...existing, ...command, updatedAt: now };
    this.roles = this.roles.map((candidate) =>
      candidate.id === id ? role : candidate
    );
    return role;
  }

  updateDecision(
    id: string,
    status: RoleDecisionStatus,
    rejectionReason?: RoleRejectionReason
  ) {
    const role = {
      ...this.findRole(id),
      decisionStatus: status,
      rejectionReason: status === "Rejected" ? (rejectionReason ?? "Other") : "",
      updatedAt: now
    };
    this.roles = this.roles.map((candidate) =>
      candidate.id === id ? role : candidate
    );
    return role;
  }

  updateFreshness(id: string, status: RoleFreshnessStatus, checkedAt?: string) {
    const role = {
      ...this.findRole(id),
      freshnessStatus: status,
      freshnessCheckedAt: checkedAt ?? now,
      updatedAt: now
    };
    this.roles = this.roles.map((candidate) =>
      candidate.id === id ? role : candidate
    );
    return role;
  }

  promoteRole(id: string): PromoteRoleResult {
    const existing = this.findRole(id);
    if (existing.promotedApplicationId) {
      throw new Error("role is already promoted");
    }
    const applicationId = nextID("app");
    const role = {
      ...existing,
      decisionStatus: "Promoted" as RoleDecisionStatus,
      promotedApplicationId: applicationId,
      updatedAt: now
    };
    this.roles = this.roles.map((candidate) =>
      candidate.id === id ? role : candidate
    );
    return { role, applicationId };
  }

  private roleFromCommand(command: RoleRecordCommand): RoleRecord {
    return {
      id: nextID("role"),
      ...command,
      rawSourceText: command.rawSourceText || command.description,
      freshnessCheckedAt: null,
      decisionStatus: "New",
      rejectionReason: "",
      promotedApplicationId: null,
      createdAt: now,
      updatedAt: now
    };
  }

  private findTopic(id: string) {
    const topic = this.topics.find((candidate) => candidate.id === id);
    if (!topic) throw new Error("role search topic could not be found");
    return topic;
  }

  private findRole(id: string) {
    const role = this.roles.find((candidate) => candidate.id === id);
    if (!role) throw new Error("role record could not be found");
    return role;
  }
}

export const roleDiscoveryMockBackend = new RoleDiscoveryMockBackend();
