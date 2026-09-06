import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type { JobApplication } from "../domain/jobOpportunity";
import type { RoleRecord } from "../domain/roleDiscovery";
import { createWebQueryClient } from "../infrastructure/query/queryClient";
import {
  resetZustandPipelineControlsStore,
  useZustandPipelineControlsStore
} from "../infrastructure/zustand/pipelineControlsStore";
import { createAppRouter } from "./router";

const DAY = 24 * 60 * 60 * 1000;

function at(offsetDays: number) {
  return new Date(Date.now() + offsetDays * DAY).toISOString();
}

function unsupported(): Promise<never> {
  throw new Error("This test gateway does not support that command.");
}

function createApplication(
  overrides: Partial<JobApplication> & Pick<JobApplication, "id" | "company">
): JobApplication {
  return {
    id: overrides.id,
    company: overrides.company,
    roleTitle: overrides.roleTitle ?? "Frontend Engineer",
    postingUrl: "https://example.com/job",
    source: "LinkedIn",
    location: "",
    compensation: "",
    employmentType: "Full-time",
    stage: overrides.stage ?? "Applied",
    timeline: overrides.timeline ?? [
      { id: `${overrides.id}-created`, occurredAt: at(-9), description: "Saved" }
    ],
    interviews: overrides.interviews ?? [],
    followUps: overrides.followUps ?? [],
    notes: []
  };
}

function createRole(id: string, company: string): RoleRecord {
  return {
    id,
    searchTopicId: null,
    company,
    title: "Staff Engineer",
    postingUrl: "https://example.com/role",
    source: "",
    sourceKind: "Search result",
    providerSource: "",
    description: "",
    rawSourceText: "",
    location: "",
    remoteEligibility: "Unknown",
    employmentType: "Full-time",
    seniority: "Senior",
    compensation: "",
    stack: "",
    companyType: "Product",
    freshnessStatus: "Live",
    freshnessCheckedAt: null,
    decisionStatus: "New",
    rejectionReason: "",
    promotedApplicationId: null,
    metadata: "",
    createdAt: at(-2),
    updatedAt: at(-2)
  };
}

function createJobGateway(
  applications: JobApplication[],
  overrides: Partial<JobApplicationGateway> = {}
): JobApplicationGateway {
  return {
    listApplications: async () => applications,
    createSavedOpportunity: unsupported,
    advanceApplicationStage: unsupported,
    scheduleInterview: unsupported,
    recordInterviewOutcome: unsupported,
    createFollowUpReminder: unsupported,
    completeFollowUpReminder: unsupported,
    addApplicationNote: unsupported,
    ...overrides
  };
}

function createRoleGateway(roles: RoleRecord[] = []): RoleDiscoveryGateway {
  return {
    listTopics: async () => [],
    createTopic: unsupported,
    updateTopic: unsupported,
    runSearch: unsupported,
    listRoles: async () => roles,
    getRole: unsupported,
    createRoleFromUrl: unsupported,
    createRoleFromPaste: unsupported,
    updateRole: unsupported,
    updateRoleDecision: unsupported,
    updateRoleFreshness: unsupported,
    promoteRole: unsupported
  };
}

function createCandidateGateway(): CandidateContextGateway {
  return {
    getCandidateProfile: unsupported,
    updateCandidateProfile: unsupported,
    listCandidateMemoryRecords: async () => [],
    createCandidateMemoryRecord: unsupported,
    updateCandidateMemoryRecord: unsupported,
    archiveCandidateMemoryRecord: unsupported,
    supersedeCandidateMemoryRecord: unsupported,
    getCandidateGroundingContext: unsupported,
    listAIArtifacts: async () => [],
    createAIArtifact: unsupported,
    editAIArtifact: unsupported,
    updateAIArtifactStatus: unsupported,
    supersedeAIArtifact: unsupported
  };
}

async function renderToday({
  applications = [] as JobApplication[],
  roles = [] as RoleRecord[],
  jobGatewayOverrides = {} as Partial<JobApplicationGateway>,
  initialPath = "/today"
} = {}) {
  resetZustandPipelineControlsStore();
  const queryClient = createWebQueryClient();
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createAppRouter({
    history,
    context: {
      candidateContextGateway: createCandidateGateway(),
      gateway: createJobGateway(applications, jobGatewayOverrides),
      roleDiscoveryGateway: createRoleGateway(roles),
      usePipelineControls: useZustandPipelineControlsStore
    }
  });

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  await screen.findByRole("navigation", { name: "Global navigation" });

  return { ...rendered, router };
}

function applicationWithFollowUp(id: string, company: string, dueOffsetDays: number) {
  return createApplication({
    id,
    company,
    followUps: [
      {
        id: `${id}-reminder`,
        applicationId: id,
        dueAt: at(dueOffsetDays),
        note: "Check in",
        completedAt: null
      }
    ]
  });
}

describe("Today workspace", () => {
  it("groups derived work into Now and This week", async () => {
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        applicationWithFollowUp("app-2", "Globex", 5)
      ]
    });

    const now = await screen.findByRole("region", { name: "Now" });
    const thisWeek = screen.getByRole("region", { name: "This week" });

    expect(within(now).getByText(/Acme/)).toBeInTheDocument();
    expect(within(thisWeek).getByText(/Globex/)).toBeInTheDocument();
  });

  it("summarises the counts of Now and This week in the header", async () => {
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        applicationWithFollowUp("app-2", "Globex", 5),
        applicationWithFollowUp("app-3", "Initech", 6)
      ]
    });

    expect(
      await screen.findByText("1 item needs you now · 2 more this week")
    ).toBeInTheDocument();
  });

  it("emphasises an overdue due indicator with the accent and leaves others alone", async () => {
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        applicationWithFollowUp("app-2", "Globex", 5)
      ]
    });

    const now = await screen.findByRole("region", { name: "Now" });
    const thisWeek = screen.getByRole("region", { name: "This week" });

    expect(within(now).getByRole("time").className).toContain("text-accent");
    expect(within(thisWeek).getByRole("time").className).not.toContain("text-accent");
  });

  it("gives a dateless item no due indicator", async () => {
    await renderToday({
      applications: [createApplication({ id: "app-1", company: "Acme", stage: "Offer" })]
    });

    const thisWeek = await screen.findByRole("region", { name: "This week" });

    expect(within(thisWeek).queryByRole("time")).not.toBeInTheDocument();
  });

  it("offers exactly one primary action per row", async () => {
    await renderToday({
      applications: [applicationWithFollowUp("app-1", "Acme", -2)]
    });

    const now = await screen.findByRole("region", { name: "Now" });
    const row = within(now).getByRole("listitem");

    // The row-opening control plus one primary action, and nothing else.
    expect(within(row).getAllByRole("button")).toHaveLength(2);
    expect(within(row).getByRole("button", { name: "Complete" })).toBeInTheDocument();
  });

  it("shows no AI badge on any row", async () => {
    await renderToday({
      applications: [applicationWithFollowUp("app-1", "Acme", -2)],
      roles: [createRole("role-1", "Northwind")]
    });

    await screen.findByRole("region", { name: "Now" });

    expect(screen.queryByText(/\bAI\b/)).not.toBeInTheDocument();
  });

  it("collapses Waiting by default and expands it on request", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -1),
        applicationWithFollowUp("app-2", "Farflung", 20)
      ]
    });

    const waiting = await screen.findByRole("region", { name: "Waiting" });
    const toggle = within(waiting).getByRole("button");

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(waiting).getByText("1")).toBeInTheDocument();
    expect(screen.queryByText(/Farflung/)).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Farflung/)).toBeInTheDocument();
  });

  it("renders the empty state when only Waiting items are derived", async () => {
    await renderToday({
      applications: [applicationWithFollowUp("app-1", "Farflung", 20)]
    });

    expect(
      await screen.findByText("Nothing needs your attention.")
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Waiting" })).toBeInTheDocument();
  });

  it("offers onward navigation from the empty state", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday();

    await user.click(await screen.findByRole("button", { name: "Go to Pipeline" }));

    await waitFor(() => expect(router.history.location.pathname).toBe("/pipeline"));
  });

  it("announces a busy state while application data is in flight", async () => {
    await renderToday();

    expect(screen.getByRole("status", { name: "Loading today" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("issues no mutation when it renders", async () => {
    const advanceApplicationStage = vi.fn(unsupported);
    const completeFollowUpReminder = vi.fn(unsupported);

    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        createApplication({ id: "app-2", company: "Globex", stage: "Saved" })
      ],
      roles: [createRole("role-1", "Northwind")],
      jobGatewayOverrides: { advanceApplicationStage, completeFollowUpReminder }
    });

    await screen.findByRole("region", { name: "Now" });

    expect(advanceApplicationStage).not.toHaveBeenCalled();
    expect(completeFollowUpReminder).not.toHaveBeenCalled();
  });

  it("navigates to Pipeline filtered to a stage from the header strip", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({
      applications: [createApplication({ id: "app-1", company: "Acme", stage: "Screening" })]
    });

    await user.click(
      await screen.findByRole("button", {
        name: "Show Screening applications in Pipeline"
      })
    );

    await waitFor(() => expect(router.history.location.pathname).toBe("/pipeline"));

    await user.click(screen.getByRole("button", { name: "View options" }));
    expect(screen.getByLabelText("Filter by stage")).toHaveValue("Screening");
  });

  it("is unaffected by pipeline filters", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        applicationWithFollowUp("app-2", "Globex", 5)
      ],
      initialPath: "/pipeline"
    });

    await screen.findByRole("region", { name: "Application pipeline" });
    await user.click(screen.getByRole("button", { name: "View options" }));
    await user.type(screen.getByLabelText("Search applications"), "Acme");

    await user.click(screen.getByRole("button", { name: /Today/ }));

    const now = await screen.findByRole("region", { name: "Now" });
    const thisWeek = screen.getByRole("region", { name: "This week" });
    expect(within(now).getByText(/Acme/)).toBeInTheDocument();
    expect(within(thisWeek).getByText(/Globex/)).toBeInTheDocument();
  });
});

describe("Today inspector", () => {
  it("opens a row into the inspector and marks the originating row", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [applicationWithFollowUp("app-1", "Acme", -2)]
    });

    const now = await screen.findByRole("region", { name: "Now" });
    const row = within(now).getByRole("listitem");

    await user.click(within(row).getByRole("button", { name: /Acme/ }));

    expect(
      screen.getByRole("complementary", { name: "Follow-up details" })
    ).toBeInTheDocument();
    expect(row).toHaveAttribute("data-selected", "true");
  });

  it("closes on Escape without disturbing the list", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [applicationWithFollowUp("app-1", "Acme", -2)]
    });

    const now = await screen.findByRole("region", { name: "Now" });
    await user.click(within(now).getByRole("button", { name: /Acme/ }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(within(now).getByRole("listitem")).toBeInTheDocument();
  });
});

describe("Today keyboard navigation", () => {
  it("moves the selection with j and k across group boundaries", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        applicationWithFollowUp("app-2", "Globex", 5)
      ]
    });

    const now = await screen.findByRole("region", { name: "Now" });
    const thisWeek = screen.getByRole("region", { name: "This week" });

    await user.keyboard("j");
    expect(within(now).getByRole("listitem")).toHaveAttribute("data-selected", "true");

    await user.keyboard("j");
    expect(within(thisWeek).getByRole("listitem")).toHaveAttribute(
      "data-selected",
      "true"
    );

    await user.keyboard("k");
    expect(within(now).getByRole("listitem")).toHaveAttribute("data-selected", "true");
  });

  it("opens the selected row with Enter", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [applicationWithFollowUp("app-1", "Acme", -2)]
    });

    await screen.findByRole("region", { name: "Now" });
    await user.keyboard("j");
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("complementary", { name: "Follow-up details" })
    ).toBeInTheDocument();
  });

  it("leaves collapsed Waiting rows out of the sequence", async () => {
    const user = userEvent.setup();
    await renderToday({
      applications: [
        applicationWithFollowUp("app-1", "Acme", -2),
        applicationWithFollowUp("app-2", "Farflung", 20)
      ]
    });

    const now = await screen.findByRole("region", { name: "Now" });

    await user.keyboard("jj");

    expect(within(now).getByRole("listitem")).toHaveAttribute("data-selected", "true");
  });

  it("stays inert while the user is typing", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({
      applications: [applicationWithFollowUp("app-1", "Acme", -2)],
      initialPath: "/pipeline"
    });

    await screen.findByRole("region", { name: "Application pipeline" });
    await user.click(screen.getByRole("button", { name: "View options" }));

    const search = screen.getByLabelText("Search applications");
    await user.click(search);
    // `g` then `t` would navigate to Today, and `j` would move the selection.
    await user.type(search, "gtj");

    expect(search).toHaveValue("gtj");
    expect(router.history.location.pathname).toBe("/pipeline");
  });

  it("resumes shortcuts after focus leaves the field", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({ initialPath: "/pipeline" });

    await screen.findByRole("region", { name: "Application pipeline" });
    await user.click(screen.getByRole("button", { name: "View options" }));
    const search = screen.getByLabelText("Search applications");
    await user.click(search);
    act(() => search.blur());
    await user.keyboard("gt");

    await waitFor(() => expect(router.history.location.pathname).toBe("/today"));
  });
});

describe("Workspace chords", () => {
  it("navigates with g t, g p, and g r", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({ initialPath: "/pipeline" });

    await screen.findByRole("region", { name: "Application pipeline" });

    await user.keyboard("gt");
    await waitFor(() => expect(router.history.location.pathname).toBe("/today"));

    await user.keyboard("gr");
    await waitFor(() => expect(router.history.location.pathname).toBe("/roles"));

    await user.keyboard("gp");
    await waitFor(() => expect(router.history.location.pathname).toBe("/pipeline"));
  });

  it("returns to the previous workspace through browser history", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({ initialPath: "/pipeline" });

    await screen.findByRole("region", { name: "Application pipeline" });
    await user.keyboard("gt");
    await waitFor(() => expect(router.history.location.pathname).toBe("/today"));

    await act(async () => {
      router.history.back();
    });

    await waitFor(() => expect(router.history.location.pathname).toBe("/pipeline"));
  });

  it("does nothing for an unrecognised second key and discards the prefix", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({ initialPath: "/pipeline" });

    await screen.findByRole("region", { name: "Application pipeline" });

    await user.keyboard("gz");
    expect(router.history.location.pathname).toBe("/pipeline");

    // The discarded prefix must not complete with a later key on its own.
    await user.keyboard("t");
    expect(router.history.location.pathname).toBe("/pipeline");
  });

  it("discards the prefix after the chord interval", async () => {
    const { router } = await renderToday({ initialPath: "/pipeline" });
    await screen.findByRole("region", { name: "Application pipeline" });

    vi.useFakeTimers();

    try {
      fireEvent.keyDown(window, { key: "g" });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      fireEvent.keyDown(window, { key: "t" });

      expect(router.history.location.pathname).toBe("/pipeline");
    } finally {
      vi.useRealTimers();
    }
  });

  it("navigates to Today from the command palette", async () => {
    const user = userEvent.setup();
    const { router } = await renderToday({ initialPath: "/pipeline" });

    await screen.findByRole("region", { name: "Application pipeline" });
    await user.click(screen.getByRole("button", { name: "Open command palette" }));

    const dialog = screen.getByRole("dialog", { name: "Command palette" });
    await user.click(within(dialog).getByRole("button", { name: "Go to Today" }));

    await waitFor(() => expect(router.history.location.pathname).toBe("/today"));
    expect(
      screen.queryByRole("dialog", { name: "Command palette" })
    ).not.toBeInTheDocument();
  });
});
