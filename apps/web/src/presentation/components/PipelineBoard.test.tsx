import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApplicationStage } from "../../domain/applicationStage";
import type { JobApplication } from "../../domain/jobOpportunity";
import { PipelineBoard } from "./PipelineBoard";

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

function renderBoard(applications: JobApplication[]) {
  return render(
    <PipelineBoard
      applications={applications}
      onStageChange={vi.fn(async (_application: JobApplication, _stage: ApplicationStage) => {})}
      onViewDetails={vi.fn()}
    />
  );
}

describe("PipelineBoard compact layout", () => {
  it("uses compact visible card actions with full accessible names", () => {
    renderBoard([
      createApplication({
        id: "linear",
        company: "Linear",
        roleTitle: "Frontend Engineer",
        location: "Remote"
      })
    ]);

    const card = screen.getByRole("heading", { name: "Linear" }).closest("div");

    expect(card).not.toBeNull();
    expect(screen.getByRole("button", { name: "View Linear details" })).toHaveTextContent("Details");
    expect(screen.getByRole("button", { name: "Mark Linear as applied" })).toHaveTextContent("Apply");
    expect(screen.getByRole("button", { name: "Update Linear stage" })).toHaveTextContent("Set");
    expect(screen.getByLabelText("Move Linear to stage")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("keeps empty stage columns compact but discoverable", () => {
    renderBoard([]);

    const board = screen.getByRole("region", { name: "Application pipeline" });
    const savedColumn = within(board)
      .getByText("Saved", { selector: "div" })
      .closest("article");

    expect(savedColumn).not.toBeNull();
    expect(within(savedColumn as HTMLElement).getByText("Saved")).toBeInTheDocument();
    expect(
      within(savedColumn as HTMLElement).getByLabelText("Saved applications")
    ).toHaveTextContent("0");
    expect(
      within(savedColumn as HTMLElement).getByText("No applications")
    ).toBeInTheDocument();
  });
});
