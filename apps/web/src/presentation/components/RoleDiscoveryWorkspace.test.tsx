import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { RoleDiscoveryGateway } from "../../application/ports/roleDiscoveryGateway";
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
import { createWebQueryClient } from "../../infrastructure/query/queryClient";
import { RoleDiscoveryWorkspace } from "./RoleDiscoveryWorkspace";

describe("RoleDiscoveryWorkspace", () => {
  it("runs search, updates decisions, and promotes roles", async () => {
    const user = userEvent.setup();
    const gateway = createFakeRoleDiscoveryGateway();

    render(
      <QueryClientProvider client={createWebQueryClient()}>
        <RoleDiscoveryWorkspace gateway={gateway} />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Acme · Senior Engineer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run search/i }));
    expect(await screen.findByText("Imported 1")).toBeInTheDocument();
    expect(await screen.findByText("SignalWorks · Senior Engineer")).toBeInTheDocument();

    const acmeCard = screen.getByText("Acme · Senior Engineer").closest("article");
    expect(acmeCard).not.toBeNull();
    await user.click(within(acmeCard as HTMLElement).getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(within(acmeCard as HTMLElement).getByText("Saved")).toBeInTheDocument()
    );

    await user.click(within(acmeCard as HTMLElement).getByRole("button", { name: /promote/i }));
    await waitFor(() =>
      expect(
        within(acmeCard as HTMLElement).getByRole("button", { name: /promoted/i })
      ).toBeDisabled()
    );
  }, 15000);

  it("pages the role inbox with back and next controls", async () => {
    const user = userEvent.setup();
    const gateway = createFakeRoleDiscoveryGateway(6);

    render(
      <QueryClientProvider client={createWebQueryClient()}>
        <RoleDiscoveryWorkspace gateway={gateway} />
      </QueryClientProvider>
    );

    expect(await screen.findByText("1-5 of 6")).toBeInTheDocument();
    expect(screen.getByText("Acme · Senior Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Company 6 · Senior Engineer")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText("6-6 of 6")).toBeInTheDocument();
    expect(screen.getByText("Company 6 · Senior Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Acme · Senior Engineer")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(await screen.findByText("1-5 of 6")).toBeInTheDocument();
    expect(screen.getByText("Acme · Senior Engineer")).toBeInTheDocument();
  });
});

function createFakeRoleDiscoveryGateway(initialRoleCount = 1): RoleDiscoveryGateway {
  const now = "2026-07-04T09:00:00.000Z";
  const topic: RoleSearchTopic = {
    id: "topic-1",
    name: "Senior roles",
    targetTitles: "Senior Engineer",
    preferredStack: "Go, React",
    location: "Remote",
    remotePreference: "Remote",
    employmentType: "Full-time",
    companyType: "Product",
    compensation: "$150k+",
    seniority: "Senior",
    notes: "",
    createdAt: now,
    updatedAt: now
  };
  let topics = [topic];
  let nextRoleID = 1;
  let roles: RoleRecord[] = Array.from({ length: initialRoleCount }, (_, index) =>
    roleFromCommand({
      searchTopicId: "topic-1",
      company: index === 0 ? "Acme" : `Company ${index + 1}`,
      title: "Senior Engineer",
      postingUrl:
        index === 0
          ? "https://jobs.example/acme"
          : `https://jobs.example/company-${index + 1}`,
      source: "Other",
      sourceKind: "Search result",
      providerSource: "fake",
      description: "Role description",
      rawSourceText: "Raw role text",
      location: "Remote",
      remoteEligibility: "Remote",
      employmentType: "Full-time",
      seniority: "Senior",
      compensation: "$150k+",
      stack: "Go",
      companyType: "Product",
      freshnessStatus: "Unknown",
      metadata: "{}"
    })
  );

  function roleFromCommand(command: RoleRecordCommand): RoleRecord {
    return {
      id: `role-${nextRoleID++}`,
      ...command,
      freshnessCheckedAt: null,
      decisionStatus: "New",
      rejectionReason: "",
      promotedApplicationId: null,
      createdAt: now,
      updatedAt: now
    };
  }

  return {
    listTopics: async () => topics,
    createTopic: async (command: RoleSearchTopicCommand) => {
      const created = { id: "topic-2", ...command, createdAt: now, updatedAt: now };
      topics = [created, ...topics];
      return created;
    },
    updateTopic: async (id: string, command: RoleSearchTopicCommand) => {
      const updated = { id, ...command, createdAt: now, updatedAt: now };
      topics = topics.map((candidate) =>
        candidate.id === id ? updated : candidate
      );
      return updated;
    },
    runSearch: async (): Promise<RoleSearchRunResult> => {
      const role = roleFromCommand({
        searchTopicId: "topic-1",
        company: "SignalWorks",
        title: "Senior Engineer",
        postingUrl: "https://jobs.example/signalworks",
        source: "Other",
        sourceKind: "Search result",
        providerSource: "fake",
        description: "Imported role",
        rawSourceText: "Imported raw text",
        location: "Remote",
        remoteEligibility: "Remote",
        employmentType: "Full-time",
        seniority: "Senior",
        compensation: "$150k+",
        stack: "Go",
        companyType: "Product",
        freshnessStatus: "Unknown",
        metadata: "{}"
      });
      roles = [role, ...roles];
      return {
        topicId: "topic-1",
        importedCount: 1,
        skippedCount: 0,
        imported: [
          {
            roleId: role.id,
            company: role.company,
            title: role.title,
            postingUrl: role.postingUrl
          }
        ],
        skipped: []
      };
    },
    listRoles: async (filter?: RoleRecordsFilter) =>
      roles.filter((role) =>
        filter?.searchTerm
          ? `${role.company} ${role.title}`
              .toLowerCase()
              .includes(filter.searchTerm.toLowerCase())
          : true
      ),
    getRole: async (id: string) => roles.find((role) => role.id === id) ?? roles[0],
    createRoleFromUrl: async (command: RoleRecordCommand) => {
      const role = roleFromCommand(command);
      roles = [role, ...roles];
      return role;
    },
    createRoleFromPaste: async (command: RoleRecordCommand) => {
      const role = roleFromCommand(command);
      roles = [role, ...roles];
      return role;
    },
    updateRole: async (id: string, command: RoleRecordCommand) => {
      const role = { ...roleFromCommand(command), id };
      roles = roles.map((candidate) => (candidate.id === id ? role : candidate));
      return role;
    },
    updateRoleDecision: async (
      id: string,
      status: RoleDecisionStatus,
      rejectionReason?: RoleRejectionReason
    ) => {
      const role = roles.find((candidate) => candidate.id === id) ?? roles[0];
      const updated = {
        ...role,
        decisionStatus: status,
        rejectionReason: status === "Rejected" ? (rejectionReason ?? "Other") : ""
      };
      roles = roles.map((candidate) => (candidate.id === id ? updated : candidate));
      return updated;
    },
    updateRoleFreshness: async (
      id: string,
      status: RoleFreshnessStatus,
      checkedAt?: string
    ) => {
      const role = roles.find((candidate) => candidate.id === id) ?? roles[0];
      const updated = {
        ...role,
        freshnessStatus: status,
        freshnessCheckedAt: checkedAt ?? now
      };
      roles = roles.map((candidate) => (candidate.id === id ? updated : candidate));
      return updated;
    },
    promoteRole: async (id: string): Promise<PromoteRoleResult> => {
      const role = roles.find((candidate) => candidate.id === id) ?? roles[0];
      const updated = {
        ...role,
        decisionStatus: "Promoted" as RoleDecisionStatus,
        promotedApplicationId: "app-1"
      };
      roles = roles.map((candidate) => (candidate.id === id ? updated : candidate));
      return { role: updated, applicationId: "app-1" };
    }
  };
}
