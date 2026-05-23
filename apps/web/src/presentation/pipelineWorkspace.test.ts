import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { ApplicationStage } from "../domain/applicationStage";
import type { JobApplication, JobSource } from "../domain/jobOpportunity";
import type { PipelineSortOption } from "./ports/pipelineControls";
import { usePipelineWorkspace } from "./pipelineWorkspace";

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

function createGateway(
  overrides: Partial<JobApplicationGateway> = {}
): JobApplicationGateway {
  async function unsupportedCommand(): Promise<never> {
    throw new Error("unsupported");
  }

  return {
    listApplications: async () => [],
    createSavedOpportunity: unsupportedCommand,
    advanceApplicationStage: unsupportedCommand,
    scheduleInterview: unsupportedCommand,
    createFollowUpReminder: unsupportedCommand,
    completeFollowUpReminder: unsupportedCommand,
    addApplicationNote: unsupportedCommand,
    ...overrides
  };
}

function useTestPipelineControls() {
  const [stageFilter, setStageFilter] = useTestState<ApplicationStage | "All">("All");
  const [sourceFilter, setSourceFilter] = useTestState<JobSource | "All">("All");
  const [searchTerm, setSearchTerm] = useTestState("");
  const [sortBy, setSortBy] = useTestState<PipelineSortOption>("created");

  return {
    stageFilter,
    sourceFilter,
    searchTerm,
    sortBy,
    setStageFilter,
    setSourceFilter,
    setSearchTerm,
    setSortBy
  };
}

const useTestState = useState;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePipelineWorkspace", () => {
  it("loads applications and derives filters, sorting, stage counts, and follow-up groups", async () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-05-10T12:00:00.000Z").getTime()
    );
    const linear = createApplication({
      id: "job-1",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      timeline: [
        { id: "event-1", occurredAt: "2026-05-09T12:00:00.000Z", description: "Applied" }
      ],
      followUps: [
        {
          id: "follow-up-1",
          applicationId: "job-1",
          dueAt: "2026-05-11T12:00:00.000Z",
          note: "Upcoming",
          completedAt: null
        }
      ]
    });
    const acme = createApplication({
      id: "job-2",
      company: "Acme",
      roleTitle: "Platform Engineer",
      source: "Referral",
      stage: "Screening",
      timeline: [
        { id: "event-2", occurredAt: "2026-05-10T10:00:00.000Z", description: "Screening" }
      ],
      followUps: [
        {
          id: "follow-up-2",
          applicationId: "job-2",
          dueAt: "2026-05-09T12:00:00.000Z",
          note: "Overdue",
          completedAt: null
        }
      ]
    });

    const gateway = createGateway({ listApplications: async () => [linear, acme] });
    const { result } = renderHook(() =>
      usePipelineWorkspace(gateway, useTestPipelineControls)
    );

    await waitFor(() => expect(result.current.isLoadingApplications).toBe(false));

    expect(result.current.activeApplicationCount).toBe(2);
    expect(result.current.stageCounts.find(({ stage }) => stage === "Applied")?.count).toBe(1);
    expect(result.current.overdueFollowUpItems.map(({ application }) => application.company)).toEqual(["Acme"]);
    expect(result.current.upcomingFollowUpItems.map(({ application }) => application.company)).toEqual(["Linear"]);

    act(() => result.current.setStageFilter("Applied"));
    expect(result.current.visibleApplications.map((application) => application.company)).toEqual(["Linear"]);

    act(() => result.current.setStageFilter("All"));
    act(() => result.current.setSearchTerm("platform"));
    expect(result.current.visibleApplications.map((application) => application.company)).toEqual(["Acme"]);

    act(() => result.current.setSearchTerm(""));
    act(() => result.current.setSortBy("lastActivity"));
    expect(result.current.visibleApplications.map((application) => application.company)).toEqual(["Acme", "Linear"]);
  });

  it("updates local applications after a stage command succeeds", async () => {
    const saved = createApplication({ id: "job-1", company: "Linear", roleTitle: "Frontend Engineer" });
    const applied = { ...saved, stage: "Applied" as const };
    const gateway = createGateway({
      listApplications: async () => [saved],
      advanceApplicationStage: async () => applied
    });
    const { result } = renderHook(() =>
      usePipelineWorkspace(gateway, useTestPipelineControls)
    );

    await waitFor(() => expect(result.current.isLoadingApplications).toBe(false));
    await act(async () => {
      await result.current.changeStage(saved, "Applied");
    });

    expect(result.current.visibleApplications[0].stage).toBe("Applied");
  });

  it("stores command errors when a workflow fails", async () => {
    const saved = createApplication({ id: "job-1", company: "Linear", roleTitle: "Frontend Engineer" });
    const gateway = createGateway({
      listApplications: async () => [saved],
      advanceApplicationStage: async () => {
        throw new Error("Cannot move an application from Saved to Offer.");
      }
    });
    const { result } = renderHook(() =>
      usePipelineWorkspace(gateway, useTestPipelineControls)
    );

    await waitFor(() => expect(result.current.isLoadingApplications).toBe(false));
    await act(async () => {
      await result.current.changeStage(saved, "Offer");
    });

    expect(result.current.commandError).toEqual({
      title: "Stage update failed",
      message: "Cannot move an application from Saved to Offer."
    });
  });
});
