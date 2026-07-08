import { act, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  RouterContextProvider,
  RouterProvider
} from "@tanstack/react-router";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type {
  AIArtifact,
  CandidateMemoryRecord,
  CandidateProfile
} from "../domain/candidateContext";
import type { JobApplication } from "../domain/jobOpportunity";
import { createJobApplicationGraphqlGateway } from "../infrastructure/graphql/jobApplicationGraphqlGateway";
import { createWebQueryClient } from "../infrastructure/query/queryClient";
import {
  resetZustandPipelineControlsStore,
  useZustandPipelineControlsStore
} from "../infrastructure/zustand/pipelineControlsStore";
import { App } from "./App";
import { createAppRouter } from "./router";

function createApplication(
  application: Partial<JobApplication> &
    Pick<JobApplication, "id" | "company" | "roleTitle">
): JobApplication {
  return {
    id: application.id,
    company: application.company,
    roleTitle: application.roleTitle,
    postingUrl: application.postingUrl ?? "https://example.com/job",
    source: application.source ?? "LinkedIn",
    location: application.location ?? "",
    compensation: application.compensation ?? "",
    employmentType: application.employmentType ?? "Full-time",
    stage: application.stage ?? "Saved",
    timeline: application.timeline ?? [
      {
        id: `${application.id}-saved`,
        occurredAt: "2026-05-01T09:00:00.000Z",
        description: "Saved opportunity"
      }
    ],
    interviews: application.interviews ?? [],
    followUps: application.followUps ?? [],
    notes: application.notes ?? []
  };
}

function createReadOnlyGateway(
  applications: JobApplication[]
): JobApplicationGateway {
  async function unsupportedCommand(): Promise<never> {
    throw new Error("This test gateway only supports listing applications.");
  }

  return {
    listApplications: async () => applications,
    createSavedOpportunity: unsupportedCommand,
    advanceApplicationStage: unsupportedCommand,
    scheduleInterview: unsupportedCommand,
    recordInterviewOutcome: unsupportedCommand,
    createFollowUpReminder: unsupportedCommand,
    completeFollowUpReminder: unsupportedCommand,
    addApplicationNote: unsupportedCommand
  };
}

function createGateway(
  overrides: Partial<JobApplicationGateway> = {}
): JobApplicationGateway {
  async function unsupportedCommand(): Promise<never> {
    throw new Error("This test gateway does not support that command.");
  }

  return {
    listApplications: async () => [],
    createSavedOpportunity: unsupportedCommand,
    advanceApplicationStage: unsupportedCommand,
    scheduleInterview: unsupportedCommand,
    recordInterviewOutcome: unsupportedCommand,
    createFollowUpReminder: unsupportedCommand,
    completeFollowUpReminder: unsupportedCommand,
    addApplicationNote: unsupportedCommand,
    ...overrides
  };
}

function createCandidateProfile(
  overrides: Partial<CandidateProfile> = {}
): CandidateProfile {
  return {
    id: "default",
    targetRoles: "Frontend Engineer",
    preferredStack: "React, TypeScript",
    compensationExpectations: "$160k+",
    locationPreferences: "Remote",
    workConstraints: "No relocation",
    companyPreferences: "Product engineering teams",
    writingTone: "Direct and warm",
    positioningSummary: "Senior frontend engineer focused on product systems.",
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    ...overrides
  };
}

function createMemoryRecord(
  overrides: Partial<CandidateMemoryRecord> &
    Pick<CandidateMemoryRecord, "id" | "title">
): CandidateMemoryRecord {
  return {
    id: overrides.id,
    memoryType: overrides.memoryType ?? "Skill",
    title: overrides.title,
    body: overrides.body ?? "Led frontend platform work.",
    source: overrides.source ?? "Profile import",
    approved: overrides.approved ?? true,
    sensitive: overrides.sensitive ?? false,
    archivedAt: overrides.archivedAt ?? null,
    supersededBy: overrides.supersededBy ?? null,
    metadata: overrides.metadata ?? "{}",
    createdAt: overrides.createdAt ?? "2026-05-01T09:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-05-01T09:00:00.000Z"
  };
}

function createArtifact(overrides: Partial<AIArtifact> = {}): AIArtifact {
  return {
    id: "artifact-1",
    artifactType: "Recruiter message",
    owner: { type: "CandidateProfile", id: "default" },
    title: "Recruiter intro",
    sourceInputs: "[]",
    modelContent: "Generated draft",
    userEditedContent: "Edited draft",
    currentContent: "Edited draft",
    status: "Draft",
    sensitive: false,
    supersededBy: null,
    provenance: {
      providerName: "fake",
      modelName: "test-model",
      promptId: "recruiter-v1",
      usageMetadata: "{}",
      rawProviderId: null
    },
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    ...overrides
  };
}

function createCandidateContextGateway(
  overrides: Partial<CandidateContextGateway> = {}
): CandidateContextGateway {
  async function unsupportedCommand(): Promise<never> {
    throw new Error("This test gateway does not support that command.");
  }

  return {
    getCandidateProfile: async () => createCandidateProfile(),
    updateCandidateProfile: async (command) =>
      createCandidateProfile({ ...command }),
    listCandidateMemoryRecords: async () => [],
    createCandidateMemoryRecord: unsupportedCommand,
    updateCandidateMemoryRecord: unsupportedCommand,
    archiveCandidateMemoryRecord: unsupportedCommand,
    supersedeCandidateMemoryRecord: unsupportedCommand,
    getCandidateGroundingContext: async () => ({
      profile: createCandidateProfile(),
      memory: []
    }),
    listAIArtifacts: async () => [],
    createAIArtifact: unsupportedCommand,
    editAIArtifact: unsupportedCommand,
    updateAIArtifactStatus: unsupportedCommand,
    supersedeAIArtifact: unsupportedCommand,
    ...overrides
  };
}

function createRoleDiscoveryGateway(): RoleDiscoveryGateway {
  async function unsupportedCommand(): Promise<never> {
    throw new Error("This test gateway does not support role discovery commands.");
  }

  return {
    listTopics: async () => [],
    createTopic: unsupportedCommand,
    updateTopic: unsupportedCommand,
    runSearch: unsupportedCommand,
    listRoles: async () => [],
    getRole: unsupportedCommand,
    createRoleFromUrl: unsupportedCommand,
    createRoleFromPaste: unsupportedCommand,
    updateRole: unsupportedCommand,
    updateRoleDecision: unsupportedCommand,
    updateRoleFreshness: unsupportedCommand,
    promoteRole: unsupportedCommand
  };
}

function getStageColumn(stage: string) {
  const board = screen.getByRole("region", { name: "Application pipeline" });
  return within(board).getByRole("region", { name: `${stage} applications` });
}

function getApplicationCompaniesInStage(stage: string) {
  const board = screen.getByRole("region", { name: "Application pipeline" });
  const column = within(board).getByRole("region", { name: `${stage} applications` });

  expect(column).not.toBeNull();

  return within(column as HTMLElement)
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);
}

function getStatValue(label: string) {
  const labelNode = screen.getByText(label, { selector: "dt" });
  const statItem = labelNode.closest("div");

  expect(statItem).not.toBeNull();

  return within(statItem as HTMLElement).getByText(/^\d+$/);
}

function renderApp(
  gateway = createJobApplicationGraphqlGateway(),
  candidateContextGateway = createCandidateContextGateway(),
  roleDiscoveryGateway = createRoleDiscoveryGateway(),
  initialPath = "/pipeline"
) {
  resetZustandPipelineControlsStore();
  const queryClient = createWebQueryClient();
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createAppRouter({
    history,
    context: {
      candidateContextGateway,
      gateway,
      roleDiscoveryGateway,
      usePipelineControls: useZustandPipelineControlsStore
    }
  });

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>
        <App
          candidateContextGateway={candidateContextGateway}
          gateway={gateway}
          roleDiscoveryGateway={roleDiscoveryGateway}
          usePipelineControls={useZustandPipelineControlsStore}
        />
      </RouterContextProvider>
    </QueryClientProvider>
  );

  return { ...rendered, router };
}

function renderRoutedApp(
  gateway = createJobApplicationGraphqlGateway(),
  candidateContextGateway = createCandidateContextGateway(),
  roleDiscoveryGateway = createRoleDiscoveryGateway(),
  initialPath = "/pipeline"
) {
  resetZustandPipelineControlsStore();
  const queryClient = createWebQueryClient();
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createAppRouter({
    history,
    context: {
      candidateContextGateway,
      gateway,
      roleDiscoveryGateway,
      usePipelineControls: useZustandPipelineControlsStore
    }
  });

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  return { ...rendered, router };
}

async function openDetailsSection(
  user: ReturnType<typeof userEvent.setup>,
  detail: HTMLElement,
  section: "Notes" | "Follow-ups" | "Interviews" | "Timeline"
) {
  await user.click(within(detail).getByRole("button", { name: new RegExp(section) }));
}

async function clickFormSubmit(
  user: ReturnType<typeof userEvent.setup>,
  detail: HTMLElement,
  name: string
) {
  const buttons = within(detail).getAllByRole("button", { name });
  await user.click(buttons[buttons.length - 1]);
}

describe("Job application tracker shell", () => {
  it("renders the pipeline workspace from a direct route", async () => {
    renderApp(createReadOnlyGateway([]), undefined, undefined, "/pipeline");

    expect(
      screen.getByRole("heading", { name: "Pipeline" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("region", { name: "Application pipeline" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pipeline/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("renders the candidate memory workspace from a direct route", async () => {
    renderApp(createGateway(), undefined, undefined, "/memory");

    expect(screen.getByRole("heading", { name: "Memory" })).toBeInTheDocument();
    expect(await screen.findByLabelText("Target roles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Memory/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("renders the role discovery workspace from a direct route", async () => {
    renderApp(createGateway(), undefined, createRoleDiscoveryGateway(), "/roles");

    expect(screen.getByRole("heading", { name: "Roles" })).toBeInTheDocument();
    expect(await screen.findByText("Find possible jobs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Roles/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("lands on the pipeline workspace from the root route", async () => {
    renderApp(createReadOnlyGateway([]), undefined, undefined, "/");

    expect(
      await screen.findByRole("region", { name: "Application pipeline" })
    ).toBeInTheDocument();
  });

  it("updates browser history when navigating between workspaces", async () => {
    const user = userEvent.setup();
    const { router } = renderApp(createReadOnlyGateway([]), undefined, undefined, "/pipeline");

    await user.click(screen.getByRole("button", { name: /Memory/ }));
    await screen.findByLabelText("Target roles");
    expect(router.history.location.pathname).toBe("/memory");

    await user.click(screen.getByRole("button", { name: /Roles/ }));
    await screen.findByText("Find possible jobs");
    expect(router.history.location.pathname).toBe("/roles");

    await user.click(screen.getByRole("button", { name: /Pipeline/ }));
    await screen.findByRole("region", { name: "Application pipeline" });
    expect(router.history.location.pathname).toBe("/pipeline");
  });

  it("closes mobile global navigation after route navigation", async () => {
    const user = userEvent.setup();
    renderApp(createGateway(), undefined, undefined, "/pipeline");

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getAllByRole("button", { name: "Close navigation" }).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Memory/ }));
    await screen.findByLabelText("Target roles");

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Close navigation" })
      ).not.toBeInTheDocument()
    );
  });

  it("returns to the previous workspace through browser history", async () => {
    const user = userEvent.setup();
    const { router } = renderRoutedApp(
      createReadOnlyGateway([]),
      undefined,
      undefined,
      "/pipeline"
    );

    await screen.findByRole("region", { name: "Application pipeline" });

    await user.click(screen.getByRole("button", { name: /Memory/ }));
    await screen.findByLabelText("Target roles");

    await act(async () => {
      router.history.back();
    });

    expect(
      await screen.findByRole("region", { name: "Application pipeline" })
    ).toBeInTheDocument();
  });

  it("shows a safe not-found state for unsupported routes", async () => {
    renderApp(createReadOnlyGateway([]), undefined, undefined, "/unknown");

    expect(await screen.findByText("Workspace not found.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pipeline/ })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("button", { name: /Memory/ })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("button", { name: /Roles/ })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("keeps global navigation focused on workspace routes", async () => {
    renderApp(createReadOnlyGateway([]), undefined, undefined, "/pipeline");

    const globalNavigation = screen.getByRole("navigation", {
      name: "Global navigation"
    });

    expect(
      within(globalNavigation).getByRole("button", { name: /Pipeline/ })
    ).toBeInTheDocument();
    expect(
      within(globalNavigation).getByRole("button", { name: /Memory/ })
    ).toBeInTheDocument();
    expect(
      within(globalNavigation).getByRole("button", { name: /Roles/ })
    ).toBeInTheDocument();
    expect(
      within(globalNavigation).queryByRole("button", { name: "Add opportunity" })
    ).not.toBeInTheDocument();
    expect(
      within(globalNavigation).queryByRole("region", { name: "Pipeline controls" })
    ).not.toBeInTheDocument();
    expect(
      within(globalNavigation).queryByRole("region", { name: "Follow-up work" })
    ).not.toBeInTheDocument();
  });

  it("renders pipeline controls as Pipeline workspace-local tools", async () => {
    const user = userEvent.setup();

    renderApp(createReadOnlyGateway([]), undefined, undefined, "/pipeline");

    const main = screen.getByRole("main");

    expect(
      within(main).getByRole("button", { name: "Add opportunity" })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("region", { name: "Pipeline view options" })
    ).toBeInTheDocument();
    expect(
      within(main).queryByRole("region", { name: "Pipeline controls" })
    ).not.toBeInTheDocument();

    await user.click(within(main).getByRole("button", { name: "View options" }));

    expect(
      within(main).getByRole("region", { name: "Pipeline controls" })
    ).toBeInTheDocument();
    expect(
      within(main).queryByRole("region", { name: "Follow-up work" })
    ).not.toBeInTheDocument();
    expect(getStatValue("Active")).toBeInTheDocument();
  });

  it("renders collapsible Pipeline saved views as secondary navigation", async () => {
    const user = userEvent.setup();

    renderApp(createReadOnlyGateway([]), undefined, undefined, "/pipeline");

    expect(
      screen.getByRole("navigation", { name: "Pipeline saved views" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Collapse secondary navigation" })
    );

    expect(
      screen.queryByRole("navigation", { name: "Pipeline saved views" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Expand secondary navigation" })
    );

    expect(
      screen.getByRole("navigation", { name: "Pipeline saved views" })
    ).toBeInTheDocument();
  });

  it("opens a command palette from global navigation and runs workspace commands", async () => {
    const user = userEvent.setup();

    renderApp(createReadOnlyGateway([]), undefined, undefined, "/pipeline");

    await user.click(screen.getByRole("button", { name: "Open command palette" }));

    const dialog = screen.getByRole("dialog", { name: "Command palette" });
    expect(within(dialog).getByText("Navigation")).toBeInTheDocument();
    expect(within(dialog).getByText("Pipeline")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Go to Memory" }));

    expect(await screen.findByLabelText("Target roles")).toBeInTheDocument();
  });

  it("opens the add opportunity flow from the command palette", async () => {
    const user = userEvent.setup();

    renderApp(createGateway(), undefined, undefined, "/memory");

    await user.click(screen.getByRole("button", { name: "Open command palette" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "Command palette" })).getByRole(
        "button",
        { name: "Add opportunity" }
      )
    );

    expect(
      await screen.findByRole("dialog", { name: "Add opportunity" })
    ).toBeInTheDocument();
  });

  it("does not render pipeline-only controls in the Memory workspace", async () => {
    renderApp(createGateway(), undefined, undefined, "/memory");

    await screen.findByLabelText("Target roles");

    expect(screen.queryByRole("button", { name: "Add opportunity" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Pipeline controls" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Follow-up work" })
    ).not.toBeInTheDocument();
  });

  it("does not render pipeline-only controls in the Roles workspace", async () => {
    renderApp(createGateway(), undefined, createRoleDiscoveryGateway(), "/roles");

    await screen.findByText("Find possible jobs");

    expect(screen.queryByRole("button", { name: "Add opportunity" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Pipeline controls" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Follow-up work" })
    ).not.toBeInTheDocument();
  });

  it("shows details workspace navigation counts while keeping the application summary visible", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      notes: [
        {
          id: "note-1",
          body: "Recruiter mentioned platform work.",
          createdAt: "2026-05-02T09:00:00.000Z"
        }
      ],
      followUps: [
        {
          id: "follow-up-1",
          applicationId: "linear",
          dueAt: "2026-05-10T12:00:00.000Z",
          note: "Send thank-you note",
          completedAt: null
        }
      ],
      interviews: [
        {
          id: "interview-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-08T15:00:00.000Z",
          outcome: "Scheduled",
          notes: "Ask about team shape"
        }
      ],
      timeline: [
        {
          id: "timeline-1",
          occurredAt: "2026-05-01T09:00:00.000Z",
          description: "Saved opportunity"
        },
        {
          id: "timeline-2",
          occurredAt: "2026-05-02T10:00:00.000Z",
          description: "Moved from Saved to Applied"
        }
      ]
    });

    renderApp(createReadOnlyGateway([application]));

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    expect(
      within(detail).getByRole("button", { name: /Notes.*1/ })
    ).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: /Follow-ups.*1/ })
    ).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: /Interviews.*1/ })
    ).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: /Timeline.*2/ })
    ).toBeInTheDocument();

    await openDetailsSection(user, detail, "Interviews");

    expect(within(detail).getByRole("heading", { name: "Linear" })).toBeInTheDocument();
    expect(within(detail).getByText("Frontend Engineer")).toBeInTheDocument();
    expect(within(detail).getByText("Applied")).toBeInTheDocument();
    expect(
      within(detail).getByRole("list", { name: "Scheduled interviews" })
    ).toBeInTheDocument();
  });

  it("edits the candidate profile from the memory workspace", async () => {
    const user = userEvent.setup();
    const updateCandidateProfile = vi.fn(async (command) =>
      createCandidateProfile(command)
    );

    renderApp(
      createGateway(),
      createCandidateContextGateway({
        updateCandidateProfile
      })
    );

    await user.click(screen.getByRole("button", { name: /Memory/ }));
    const targetRoles = await screen.findByLabelText("Target roles");

    await user.clear(targetRoles);
    await user.type(targetRoles, "Staff Frontend Engineer");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() =>
      expect(updateCandidateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          targetRoles: "Staff Frontend Engineer",
          preferredStack: "React, TypeScript"
        })
      )
    );
  });

  it("shows memory approval and sensitivity and can mark memory as superseded", async () => {
    const user = userEvent.setup();
    const current = createMemoryRecord({
      id: "memory-1",
      title: "React leadership",
      approved: true,
      sensitive: true
    });
    const replacement = createMemoryRecord({
      id: "memory-2",
      title: "Frontend platform leadership"
    });
    const supersedeCandidateMemoryRecord = vi.fn(async () => ({
      ...current,
      supersededBy: replacement.id
    }));

    renderApp(
      createGateway(),
      createCandidateContextGateway({
        listCandidateMemoryRecords: async () => [current, replacement],
        supersedeCandidateMemoryRecord
      })
    );

    await user.click(screen.getByRole("button", { name: /Memory/ }));

    expect(
      await screen.findByRole("heading", { name: "React leadership" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Approved")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Sensitive")[0]).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Supersede React leadership with"),
      replacement.id
    );
    await user.click(screen.getAllByRole("button", { name: "Mark superseded" })[0]);

    await waitFor(() =>
      expect(supersedeCandidateMemoryRecord).toHaveBeenCalledWith(
        current.id,
        replacement.id
      )
    );
  });

  it("displays edited artifact content and saves further edits", async () => {
    const user = userEvent.setup();
    const artifact = createArtifact({
      modelContent: "Generated recruiter draft",
      userEditedContent: "Edited recruiter draft",
      currentContent: "Edited recruiter draft"
    });
    const editAIArtifact = vi.fn(async (_id, userEditedContent) => ({
      ...artifact,
      userEditedContent,
      currentContent: userEditedContent ?? artifact.modelContent
    }));

    renderApp(
      createGateway(),
      createCandidateContextGateway({
        listAIArtifacts: async () => [artifact],
        editAIArtifact
      })
    );

    await user.click(screen.getByRole("button", { name: /Memory/ }));

    const artifactContent = await screen.findByLabelText(
      "Edited content for Recruiter intro"
    );
    expect(artifactContent).toHaveValue("Edited recruiter draft");
    expect(screen.queryByText("Generated recruiter draft")).not.toBeInTheDocument();

    await user.clear(artifactContent);
    await user.type(artifactContent, "Final recruiter draft");
    await user.click(screen.getByRole("button", { name: "Save artifact edit" }));

    await waitFor(() =>
      expect(editAIArtifact).toHaveBeenCalledWith(
        artifact.id,
        "Final recruiter draft"
      )
    );
  });

  it("does not offer Superseded as a directly selectable artifact status, and marks an artifact superseded through the dedicated action", async () => {
    const user = userEvent.setup();
    const artifact = createArtifact({ id: "artifact-1", title: "Recruiter intro" });
    const replacement = createArtifact({
      id: "artifact-2",
      title: "Recruiter intro v2"
    });
    const supersedeAIArtifact = vi.fn(async () => ({
      ...artifact,
      status: "Superseded" as const,
      supersededBy: replacement.id
    }));

    renderApp(
      createGateway(),
      createCandidateContextGateway({
        listAIArtifacts: async () => [artifact, replacement],
        supersedeAIArtifact
      })
    );

    await user.click(screen.getByRole("button", { name: /Memory/ }));
    await screen.findByLabelText("Edited content for Recruiter intro");

    expect(
      within(screen.getByLabelText("Status for Recruiter intro")).queryByText(
        "Superseded"
      )
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Supersede Recruiter intro with"),
      replacement.id
    );
    await user.click(screen.getAllByRole("button", { name: "Mark superseded" })[0]);

    await waitFor(() =>
      expect(supersedeAIArtifact).toHaveBeenCalledWith(artifact.id, replacement.id)
    );
  });

  it("keeps details forms hidden until explicit actions and lets users cancel them", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      interviews: [
        {
          id: "interview-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-12T15:00:00.000Z",
          outcome: "Scheduled",
          notes: "Ask about team shape"
        }
      ]
    });

    renderApp(createReadOnlyGateway([application]));

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    await openDetailsSection(user, detail, "Notes");
    expect(within(detail).queryByLabelText("Application note")).not.toBeInTheDocument();
    await user.click(within(detail).getByRole("button", { name: "Add note" }));
    expect(within(detail).getByLabelText("Application note")).toBeInTheDocument();
    await user.click(within(detail).getByRole("button", { name: "Cancel" }));
    expect(within(detail).queryByLabelText("Application note")).not.toBeInTheDocument();

    await openDetailsSection(user, detail, "Follow-ups");
    expect(
      within(detail).queryByRole("group", { name: "Follow-up due date" })
    ).not.toBeInTheDocument();
    await user.click(within(detail).getByRole("button", { name: "Create follow-up" }));
    expect(
      within(detail).getByRole("group", { name: "Follow-up due date" })
    ).toBeInTheDocument();
    await user.click(within(detail).getByRole("button", { name: "Cancel" }));
    expect(
      within(detail).queryByRole("group", { name: "Follow-up due date" })
    ).not.toBeInTheDocument();

    await openDetailsSection(user, detail, "Interviews");
    expect(
      within(detail).queryByRole("group", { name: "Date and time" })
    ).not.toBeInTheDocument();
    await clickFormSubmit(user, detail, "Schedule interview");
    expect(
      within(detail).getByRole("group", { name: "Date and time" })
    ).toBeInTheDocument();
    expect(within(detail).queryByLabelText("Outcome")).not.toBeInTheDocument();
    await user.click(within(detail).getByRole("button", { name: "Cancel" }));
    expect(
      within(detail).queryByRole("group", { name: "Date and time" })
    ).not.toBeInTheDocument();
  });

  it("shows application timeline events newest first", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      timeline: [
        {
          id: "timeline-1",
          occurredAt: "2026-05-01T09:00:00.000Z",
          description: "Saved opportunity"
        },
        {
          id: "timeline-2",
          occurredAt: "2026-05-03T10:00:00.000Z",
          description: "Moved from Saved to Applied"
        },
        {
          id: "timeline-3",
          occurredAt: "2026-05-02T11:00:00.000Z",
          description: "Added note"
        }
      ]
    });

    renderApp(createReadOnlyGateway([application]));

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Timeline");

    const timeline = within(detail).getByRole("list", { name: "Timeline events" });
    const events = within(timeline).getAllByRole("listitem");

    expect(events).toHaveLength(3);
    expect(events[0]).toHaveTextContent("Moved from Saved to Applied");
    expect(events[1]).toHaveTextContent("Added note");
    expect(events[2]).toHaveTextContent("Saved opportunity");
  });

  it("keeps the interview schedule form above existing interviews with a single submit action", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      interviews: [
        {
          id: "interview-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-12T15:00:00.000Z",
          outcome: "Scheduled",
          notes: "Ask about team shape"
        }
      ]
    });

    renderApp(createReadOnlyGateway([application]));

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Interviews");
    await user.click(within(detail).getByRole("button", { name: "Schedule interview" }));

    expect(
      within(detail).getAllByRole("button", { name: "Schedule interview" })
    ).toHaveLength(1);

    const form = within(detail).getByRole("group", { name: "Date and time" }).closest("form");
    const interviewList = within(detail).getByRole("list", {
      name: "Scheduled interviews"
    });

    if (!form) {
      throw new Error("Expected the schedule interview form to be visible.");
    }
    expect(
      form.compareDocumentPosition(interviewList) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("hides active work actions for closed applications while allowing notes", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(await screen.findByRole("button", { name: "Mark Linear as applied" }));
    await user.selectOptions(await screen.findByLabelText("Jump Linear to stage"), "Rejected");
    await user.click(screen.getByRole("button", { name: "Jump Linear to selected stage" }));
    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    await openDetailsSection(user, detail, "Follow-ups");
    expect(
      within(detail).queryByRole("button", { name: "Create follow-up" })
    ).not.toBeInTheDocument();
    expect(
      within(detail).getByText("Reopen this application to create follow-ups.")
    ).toBeInTheDocument();

    await openDetailsSection(user, detail, "Interviews");
    expect(
      within(detail).queryByRole("button", { name: "Schedule interview" })
    ).not.toBeInTheDocument();
    expect(
      within(detail).getByText(
        "Interviews can only be scheduled for active applications before the offer stage."
      )
    ).toBeInTheDocument();

    await openDetailsSection(user, detail, "Notes");
    expect(within(detail).getByRole("button", { name: "Add note" })).toBeInTheDocument();
  });

  it("shows an application funnel chart above the pipeline board in the main content area", async () => {
    renderApp();

    await screen.findByRole("region", { name: "Application pipeline" });

    const main = screen.getByRole("main");
    expect(
      within(main).getByRole("region", { name: "Application funnel" })
    ).toBeInTheDocument();
  });

  it("clicking a funnel stage button filters the pipeline board to that stage", async () => {
    const user = userEvent.setup();

    renderApp();

    await screen.findByRole("region", { name: "Application pipeline" });

    // Click "Applied" stage button in the funnel header
    const funnel = screen.getByRole("region", { name: "Application funnel" });
    await user.click(within(funnel).getByRole("button", { name: /^Applied/ }));

    // The pipeline controls dropdown should reflect the filter
    await user.click(screen.getByRole("button", { name: "View options" }));
    expect(screen.getByLabelText("Filter by stage")).toHaveValue("Applied");
  });

  it("clicking the active funnel stage button again clears the filter", async () => {
    const user = userEvent.setup();

    renderApp();

    await screen.findByRole("region", { name: "Application pipeline" });

    const funnel = screen.getByRole("region", { name: "Application funnel" });
    // First click: filter to Applied
    await user.click(within(funnel).getByRole("button", { name: /^Applied/ }));
    // Second click: use aria-pressed to target the header button, not the clear badge
    await user.click(within(funnel).getByRole("button", { pressed: true, name: /^Applied/ }));

    await user.click(screen.getByRole("button", { name: "View options" }));
    expect(screen.getByLabelText("Filter by stage")).toHaveValue("All");
  });

  it("renders a pipeline workspace with the expected application stages", async () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: "Career Pipeline" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add opportunity" })
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent("Loading applications...");

    const board = await screen.findByRole("region", {
      name: "Application pipeline"
    });

    // Active and Interviewing phases are always visible
    ["Saved", "Applied", "Screening", "Technical interview", "Onsite"].forEach((stage) => {
      expect(within(board).getByText(stage)).toBeInTheDocument();
    });

    // Phase region labels are always present
    expect(within(board).getByRole("region", { name: "Active phase" })).toBeInTheDocument();
    expect(within(board).getByRole("region", { name: "Interviewing phase" })).toBeInTheDocument();
    expect(within(board).getByRole("region", { name: "Closed phase" })).toBeInTheDocument();

    // Closed phase is collapsed by default; stage columns are not rendered
    ["Offer", "Rejected", "Withdrawn"].forEach((stage) => {
      expect(within(board).queryByText(stage, { selector: "div" })).not.toBeInTheDocument();
    });
  });

  it("collapses the Closed phase when empty, expands it when populated, and still lets the user collapse it", async () => {
    const user = userEvent.setup();

    renderApp();

    const board = await screen.findByRole("region", { name: "Application pipeline" });
    const closedPhase = within(board).getByRole("region", { name: "Closed phase" });

    // Collapsed by default — toggle button visible, stage columns hidden
    expect(within(closedPhase).getByRole("button", { name: /Closed/i })).toBeInTheDocument();
    expect(within(closedPhase).queryByText("Offer", { selector: "div" })).not.toBeInTheDocument();

    // Manually expand via toggle
    await user.click(within(closedPhase).getByRole("button", { name: /Closed/i }));
    expect(within(closedPhase).getByText("Offer", { selector: "div" })).toBeInTheDocument();

    // Collapse again
    await user.click(within(closedPhase).getByRole("button", { name: /Closed/i }));
    expect(within(closedPhase).queryByText("Offer", { selector: "div" })).not.toBeInTheDocument();

    // Add an application and move it to a closed stage — Closed phase auto-expands
    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(screen.getByLabelText("Posting URL"), "https://linear.app/careers/frontend-engineer");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.click(await screen.findByRole("button", { name: "Mark Linear as applied" }));
    await user.selectOptions(await screen.findByLabelText("Jump Linear to stage"), "Rejected");
    await user.click(screen.getByRole("button", { name: "Jump Linear to selected stage" }));

    expect(await within(closedPhase).findByText("Rejected", { selector: "div" })).toBeInTheDocument();

    await user.click(within(closedPhase).getByRole("button", { name: /Closed/i }));
    expect(within(closedPhase).queryByText("Rejected", { selector: "div" })).not.toBeInTheDocument();
  });

  it("lets a user create a saved job opportunity and see it in the Saved column", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.selectOptions(screen.getByLabelText("Source"), "Referral");
    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.type(screen.getByLabelText("Compensation"), "$160k-$190k");
    await user.selectOptions(screen.getByLabelText("Employment type"), "Full-time");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    const savedColumn = getStageColumn("Saved");

    expect(savedColumn).not.toBeNull();
    expect(
      await within(savedColumn).findByText("Linear")
    ).toBeInTheDocument();
    expect(
      within(savedColumn).getByText("Frontend Engineer")
    ).toBeInTheDocument();
    expect(
      within(savedColumn).getByText("Referral")
    ).toBeInTheDocument();
  });

  it("shows understandable errors for required fields and invalid posting URLs", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Posting URL"), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    const alert = await screen.findByRole("alert");

    expect(within(alert).getByText("Company is required")).toBeInTheDocument();
    expect(within(alert).getByText("Role title is required")).toBeInTheDocument();
    expect(
      within(alert).getByText("Posting URL must be a valid URL")
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Company/ })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByRole("textbox", { name: /^Role title/ })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByRole("textbox", { name: /^Posting URL/ })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("shows a visible alert when saved opportunities cannot load", async () => {
    renderApp(
      createGateway({
        listApplications: async () => {
          throw new Error("Network unavailable");
        }
      })
    );

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Applications could not load");
    expect(alert).toHaveTextContent("Refresh the page or try again in a moment.");
  });

  it("shows a visible form alert when saving a valid opportunity fails", async () => {
    const user = userEvent.setup();

    renderApp(
      createGateway({
        createSavedOpportunity: async () => {
          throw new Error("Write failed");
        }
      })
    );

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    const dialog = screen.getByRole("dialog", { name: "Add opportunity" });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Could not save the opportunity. Try again."
    );
    expect(within(dialog).getByLabelText("Company")).toHaveValue("Linear");
    expect(within(dialog).getByLabelText("Role title")).toHaveValue(
      "Frontend Engineer"
    );
    expect(within(dialog).getByLabelText("Posting URL")).toHaveValue(
      "https://linear.app/careers/frontend-engineer"
    );
  });

  it("lets a user mark a saved opportunity as applied", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );

    const savedColumn = getStageColumn("Saved");
    const appliedColumn = getStageColumn("Applied");

    expect(savedColumn).not.toBeNull();
    expect(appliedColumn).not.toBeNull();
    expect(
      within(savedColumn).queryByText("Linear")
    ).not.toBeInTheDocument();
    expect(
      await within(appliedColumn).findByText("Linear")
    ).toBeInTheDocument();
  });

  it("shows an understandable error when a stage transition is invalid", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.selectOptions(
      await screen.findByLabelText("Jump Linear to stage"),
      "Offer"
    );
    await user.click(screen.getByRole("button", { name: "Jump Linear to selected stage" }));

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Cannot move an application from Saved to Offer.");
  });

  it("lets a user advance active stages, reject an application, and reopen it", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );
    await user.click(
      await screen.findByRole("button", { name: "Move Linear to Screening" })
    );

    const screeningColumn = getStageColumn("Screening");

    expect(screeningColumn).not.toBeNull();
    expect(
      await within(screeningColumn).findByText("Linear")
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Jump Linear to stage"), "Rejected");
    await user.click(screen.getByRole("button", { name: "Jump Linear to selected stage" }));

    const rejectedColumn = getStageColumn("Rejected");

    expect(rejectedColumn).not.toBeNull();
    expect(
      await within(rejectedColumn).findByText("Linear")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reopen Linear" }));

    const appliedColumn = getStageColumn("Applied");

    expect(appliedColumn).not.toBeNull();
    expect(
      await within(appliedColumn).findByText("Linear")
    ).toBeInTheDocument();
  });

  it("treats rejected applications as closed work until they are reopened", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await waitFor(() => expect(getStatValue("Active")).toHaveTextContent("1"));

    await user.click(screen.getByRole("button", { name: "Mark Linear as applied" }));
    await user.selectOptions(
      await screen.findByLabelText("Jump Linear to stage"),
      "Rejected"
    );
    await user.click(screen.getByRole("button", { name: "Jump Linear to selected stage" }));

    const rejectedColumn = getStageColumn("Rejected");

    expect(rejectedColumn).not.toBeNull();
    expect(
      await within(rejectedColumn).findByText("Linear")
    ).toBeInTheDocument();
    expect(
      within(rejectedColumn).getByText("Closed")
    ).toBeInTheDocument();
    expect(getStatValue("Active")).toHaveTextContent("0");

    await user.click(screen.getByRole("button", { name: "Reopen Linear" }));

    await waitFor(() => expect(getStatValue("Active")).toHaveTextContent("1"));
  });

  it("lets a user inspect application details and timeline without leaving the board", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.selectOptions(screen.getByLabelText("Source"), "Referral");
    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.type(screen.getByLabelText("Compensation"), "$160k-$190k");
    await user.selectOptions(screen.getByLabelText("Employment type"), "Full-time");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.click(
      await screen.findByRole("button", { name: "View Linear details" })
    );

    expect(
      screen.getByRole("region", { name: "Application pipeline" })
    ).toBeInTheDocument();

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    expect(
      within(detail).getByRole("heading", { name: "Linear" })
    ).toBeInTheDocument();
    expect(within(detail).getByText("Frontend Engineer")).toBeInTheDocument();
    expect(within(detail).getByText("Saved")).toBeInTheDocument();
    expect(within(detail).getByText("Referral")).toBeInTheDocument();
    expect(within(detail).getByText("Remote")).toBeInTheDocument();
    expect(within(detail).getByText("$160k-$190k")).toBeInTheDocument();
    expect(within(detail).getByText("Full-time")).toBeInTheDocument();
    expect(
      within(detail).getByRole("link", {
        name: "https://linear.app/careers/frontend-engineer"
      })
    ).toHaveAttribute("href", "https://linear.app/careers/frontend-engineer");
    await openDetailsSection(user, detail, "Timeline");
    expect(within(detail).getByText("Saved opportunity")).toBeInTheDocument();
  });

  it("keeps selected application timeline updated after stage changes", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "View Linear details" })
    );
    await user.click(screen.getByRole("button", { name: "Mark Linear as applied" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Timeline");
    const timeline = within(detail).getByRole("list", { name: "Timeline events" });
    const events = within(timeline).getAllByRole("listitem");

    expect(events).toHaveLength(2);
    expect(within(timeline).getByText("Saved opportunity")).toBeInTheDocument();
    expect(within(timeline).getByText("Moved from Saved to Applied")).toBeInTheDocument();
  });

  it("lets a user schedule an interview for an applied application and see it in details", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );
    await user.click(screen.getByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Interviews");
    await clickFormSubmit(user, detail, "Schedule interview");

    await user.selectOptions(
      within(detail).getByLabelText("Interview type"),
      "Recruiter screen"
    );
    const interviewDateTime = within(detail).getByRole("group", { name: "Date and time" });
    await user.type(within(interviewDateTime).getByLabelText("Date"), "2026-05-12");
    await user.type(within(interviewDateTime).getByLabelText("Time"), "15:00");
    await user.type(
      within(detail).getByLabelText("Interview notes"),
      "Ask about team shape"
    );
    await clickFormSubmit(user, detail, "Schedule interview");

    const interviews = within(detail).getByRole("list", {
      name: "Scheduled interviews"
    });

    expect(
      await within(interviews).findByText("Recruiter screen")
    ).toBeInTheDocument();
    expect(within(interviews).getByText("Scheduled")).toBeInTheDocument();
    expect(within(interviews).getByText("Ask about team shape")).toBeInTheDocument();
    await openDetailsSection(user, detail, "Timeline");
    expect(
      within(detail).getByText("Scheduled Recruiter screen interview")
    ).toBeInTheDocument();
  });

  it("does not offer interview scheduling for a saved opportunity", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "View Linear details" })
    );

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Interviews");

    expect(
      within(detail).queryByRole("button", { name: "Schedule interview" })
    ).not.toBeInTheDocument();
    expect(
      within(detail).getByText(
        "Interviews can only be scheduled for active applications before the offer stage."
      )
    ).toBeInTheDocument();
    expect(
      within(detail).queryByRole("group", { name: "Date and time" })
    ).not.toBeInTheDocument();
  });

  it("lets a user record an interview outcome separately from scheduling", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      interviews: [
        {
          id: "interview-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-12T15:00:00.000Z",
          outcome: "Scheduled",
          notes: "Ask about team shape"
        }
      ]
    });

    renderApp(
      createGateway({
        listApplications: async () => [application],
        recordInterviewOutcome: async (command) => ({
          ...application,
          interviews: application.interviews.map((interview) =>
            interview.id === command.interviewId
              ? { ...interview, outcome: command.outcome }
              : interview
          ),
          timeline: [
            ...application.timeline,
            {
              id: "timeline-outcome",
              occurredAt: "2026-05-12T16:00:00.000Z",
              description: `Recorded ${command.outcome} for Recruiter screen interview`
            }
          ]
        })
      })
    );

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Interviews");

    await clickFormSubmit(user, detail, "Record outcome");
    await user.selectOptions(within(detail).getByLabelText("Outcome"), "Passed");
    await clickFormSubmit(user, detail, "Record outcome");

    expect(await within(detail).findByText("Passed")).toBeInTheDocument();
    expect(within(detail).queryByText("Scheduled")).not.toBeInTheDocument();
  });

  it("shows an understandable error when scheduling an interview without a date", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );
    await user.click(screen.getByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Interviews");
    await clickFormSubmit(user, detail, "Schedule interview");
    await clickFormSubmit(user, detail, "Schedule interview");

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent("Interview date and time are required.");
  });

  it("lets a user create and complete an upcoming follow-up reminder", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );
    await user.click(screen.getByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Follow-ups");
    await clickFormSubmit(user, detail, "Create follow-up");

    const followUpDueDate = within(detail).getByRole("group", { name: "Follow-up due date" });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-11");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "12:00");
    await user.type(
      within(detail).getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await clickFormSubmit(user, detail, "Create follow-up");

    await user.click(screen.getByRole("button", { name: /Needs attention/ }));

    const followUpWork = screen.getByRole("region", { name: "Follow-up work" });
    const upcoming = within(followUpWork).getByRole("list", {
      name: "Upcoming follow-ups"
    });

    expect(
      await within(upcoming).findByText("Send recruiter a thank-you note")
    ).toBeInTheDocument();
    expect(within(upcoming).getByText("Linear")).toBeInTheDocument();

    await user.click(
      within(upcoming).getByRole("button", {
        name: "Complete follow-up for Linear"
      })
    );

    expect(
      within(followUpWork).getByText("No follow-ups need attention.")
    ).toBeInTheDocument();
  });

  it("shows an understandable error when a follow-up is due before the latest interaction", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "View Linear details" })
    );

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Follow-ups");
    await clickFormSubmit(user, detail, "Create follow-up");

    const followUpDueDate = within(detail).getByRole("group", { name: "Follow-up due date" });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-09");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "12:00");
    await user.type(
      within(detail).getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await clickFormSubmit(user, detail, "Create follow-up");

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent("Follow-up due date must be after the latest interaction.");
    expect(within(followUpDueDate).getByLabelText("Date")).toHaveValue("2026-05-09");
    expect(within(followUpDueDate).getByLabelText("Time")).toHaveValue("12:00");
    expect(within(detail).getByLabelText("Follow-up note")).toHaveValue(
      "Send recruiter a thank-you note"
    );
  });

  it("shows an understandable error when creating a follow-up without a due date", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "View Linear details" })
    );

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Follow-ups");
    await clickFormSubmit(user, detail, "Create follow-up");

    await user.type(
      within(detail).getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await clickFormSubmit(user, detail, "Create follow-up");

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent("Follow-up date and time are required.");
  });

  it("shows details command errors inside the details panel and preserves entered values", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      interviews: [
        {
          id: "interview-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-12T15:00:00.000Z",
          outcome: "Scheduled",
          notes: "Ask about team shape"
        }
      ]
    });

    renderApp(
      createGateway({
        listApplications: async () => [application],
        addApplicationNote: async () => {
          throw new Error("Could not add the note right now.");
        },
        createFollowUpReminder: async () => {
          throw new Error("Could not create the follow-up right now.");
        },
        scheduleInterview: async () => {
          throw new Error("Could not schedule the interview right now.");
        },
        recordInterviewOutcome: async () => {
          throw new Error("Could not record the interview outcome right now.");
        }
      })
    );

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    await openDetailsSection(user, detail, "Notes");
    await clickFormSubmit(user, detail, "Add note");
    await user.type(
      within(detail).getByLabelText("Application note"),
      "Recruiter mentioned a platform team opening."
    );
    await clickFormSubmit(user, detail, "Add note");

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not add the note right now."
    );
    expect(within(detail).getByLabelText("Application note")).toHaveValue(
      "Recruiter mentioned a platform team opening."
    );

    await openDetailsSection(user, detail, "Follow-ups");
    await clickFormSubmit(user, detail, "Create follow-up");
    const followUpDueDate = within(detail).getByRole("group", {
      name: "Follow-up due date"
    });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-20");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "10:00");
    await user.type(
      within(detail).getByLabelText("Follow-up note"),
      "Ask recruiter for feedback."
    );
    await clickFormSubmit(user, detail, "Create follow-up");

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not create the follow-up right now."
    );
    expect(within(followUpDueDate).getByLabelText("Date")).toHaveValue("2026-05-20");
    expect(within(followUpDueDate).getByLabelText("Time")).toHaveValue("10:00");
    expect(within(detail).getByLabelText("Follow-up note")).toHaveValue(
      "Ask recruiter for feedback."
    );

    await openDetailsSection(user, detail, "Interviews");
    await clickFormSubmit(user, detail, "Schedule interview");
    await user.selectOptions(within(detail).getByLabelText("Interview type"), "Technical");
    const interviewDateTime = within(detail).getByRole("group", {
      name: "Date and time"
    });
    await user.type(within(interviewDateTime).getByLabelText("Date"), "2026-05-21");
    await user.type(within(interviewDateTime).getByLabelText("Time"), "14:30");
    await user.type(
      within(detail).getByLabelText("Interview notes"),
      "Prepare architecture examples."
    );
    await clickFormSubmit(user, detail, "Schedule interview");

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not schedule the interview right now."
    );
    expect(within(detail).getByLabelText("Interview type")).toHaveValue("Technical");
    expect(within(interviewDateTime).getByLabelText("Date")).toHaveValue("2026-05-21");
    expect(within(interviewDateTime).getByLabelText("Time")).toHaveValue("14:30");
    expect(within(detail).getByLabelText("Interview notes")).toHaveValue(
      "Prepare architecture examples."
    );

    await user.click(within(detail).getByRole("button", { name: "Cancel" }));
    await clickFormSubmit(user, detail, "Record outcome");
    await user.selectOptions(within(detail).getByLabelText("Outcome"), "No decision");
    await clickFormSubmit(user, detail, "Record outcome");

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not record the interview outcome right now."
    );
    expect(within(detail).getByLabelText("Outcome")).toHaveValue("No decision");
  });

  it("lets a user add a note and see it in application details and timeline", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "View Linear details" })
    );

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    await openDetailsSection(user, detail, "Notes");
    await clickFormSubmit(user, detail, "Add note");

    await user.type(
      within(detail).getByLabelText("Application note"),
      "Recruiter mentioned the team is expanding."
    );
    await clickFormSubmit(user, detail, "Add note");

    const notes = within(detail).getByRole("list", {
      name: "Application notes"
    });

    expect(
      await within(notes).findByText("Recruiter mentioned the team is expanding.")
    ).toBeInTheDocument();
    await openDetailsSection(user, detail, "Timeline");
    expect(within(detail).getByText("Added note")).toBeInTheDocument();
  });

  it("lets a user filter the pipeline by stage", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    expect(await within(getStageColumn("Saved")).findByText("Linear")).toBeInTheDocument();
    await user.click(
      await screen.findByRole("button", { name: "Add opportunity" })
    );
    await user.type(screen.getByLabelText("Company"), "Vercel");
    await user.type(screen.getByLabelText("Role title"), "UI Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://vercel.com/careers/ui-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );

    await user.click(screen.getByRole("button", { name: "View options" }));
    await user.selectOptions(screen.getByLabelText("Filter by stage"), "Applied");

    const board = screen.getByRole("region", { name: "Application pipeline" });

    expect(within(board).getByText("Linear")).toBeInTheDocument();
    expect(within(board).queryByText("Vercel")).not.toBeInTheDocument();
  });

  it("lets a user filter the pipeline by source", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.selectOptions(screen.getByLabelText("Source"), "Referral");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    await user.click(
      await screen.findByRole("button", { name: "Add opportunity" })
    );
    await user.type(screen.getByLabelText("Company"), "Vercel");
    await user.type(screen.getByLabelText("Role title"), "UI Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://vercel.com/careers/ui-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.click(screen.getByRole("button", { name: "View options" }));
    await user.selectOptions(screen.getByLabelText("Filter by source"), "Referral");

    const board = screen.getByRole("region", { name: "Application pipeline" });

    expect(within(board).getByText("Linear")).toBeInTheDocument();
    expect(within(board).queryByText("Vercel")).not.toBeInTheDocument();
  });

  it("lets a user search the pipeline by company or role title", async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    expect(await within(getStageColumn("Saved")).findByText("Linear")).toBeInTheDocument();
    await user.click(
      await screen.findByRole("button", { name: "Add opportunity" })
    );
    await user.type(screen.getByLabelText("Company"), "Vercel");
    await user.type(screen.getByLabelText("Role title"), "UI Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://vercel.com/careers/ui-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));
    expect(await within(getStageColumn("Saved")).findByText("Vercel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View options" }));
    await user.type(screen.getByLabelText("Search applications"), "frontend");

    const board = screen.getByRole("region", { name: "Application pipeline" });

    expect(within(board).getByText("Linear")).toBeInTheDocument();
    expect(within(board).queryByText("Vercel")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Search applications"));
    await user.type(screen.getByLabelText("Search applications"), "vercel");

    expect(within(board).queryByText("Linear")).not.toBeInTheDocument();
    expect(within(board).getByText("Vercel")).toBeInTheDocument();
  });

  it("lets a user sort the pipeline by last activity", async () => {
    const user = userEvent.setup();

    renderApp(
      createReadOnlyGateway([
        createApplication({
          id: "linear",
          company: "Linear",
          roleTitle: "Frontend Engineer",
          timeline: [
            {
              id: "linear-saved",
              occurredAt: "2026-05-01T09:00:00.000Z",
              description: "Saved opportunity"
            }
          ]
        }),
        createApplication({
          id: "vercel",
          company: "Vercel",
          roleTitle: "UI Engineer",
          timeline: [
            {
              id: "vercel-saved",
              occurredAt: "2026-05-04T09:00:00.000Z",
              description: "Saved opportunity"
            }
          ]
        })
      ])
    );
    await screen.findByRole("heading", { name: "Linear" });

    await user.click(screen.getByRole("button", { name: "View options" }));
    await user.selectOptions(
      screen.getByLabelText("Sort applications"),
      "lastActivity"
    );

    await waitFor(() =>
      expect(getApplicationCompaniesInStage("Saved")).toEqual([
        "Vercel",
        "Linear"
      ])
    );
  });

  it("lets a user sort the pipeline by follow-up date", async () => {
    const user = userEvent.setup();

    renderApp(
      createReadOnlyGateway([
        createApplication({
          id: "linear",
          company: "Linear",
          roleTitle: "Frontend Engineer",
          followUps: [
            {
              id: "linear-follow-up",
              applicationId: "linear",
              dueAt: "2026-05-15T09:00:00.000Z",
              note: "Check in with recruiter",
              completedAt: null
            }
          ]
        }),
        createApplication({
          id: "vercel",
          company: "Vercel",
          roleTitle: "UI Engineer",
          followUps: [
            {
              id: "vercel-follow-up",
              applicationId: "vercel",
              dueAt: "2026-05-12T09:00:00.000Z",
              note: "Send portfolio",
              completedAt: null
            }
          ]
        }),
        createApplication({
          id: "figma",
          company: "Figma",
          roleTitle: "Product Engineer"
        })
      ])
    );
    await screen.findByRole("heading", { name: "Linear" });

    await user.click(screen.getByRole("button", { name: "View options" }));
    await user.selectOptions(
      screen.getByLabelText("Sort applications"),
      "followUpDate"
    );

    expect(getApplicationCompaniesInStage("Saved")).toEqual([
      "Vercel",
      "Linear",
      "Figma"
    ]);
  });
});
