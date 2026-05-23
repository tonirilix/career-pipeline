import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      changingStageApplicationIds={new Set()}
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
    expect(screen.getByRole("button", { name: "Jump Linear to selected stage" })).toHaveTextContent("Jump");
    expect(screen.getByLabelText("Jump Linear to stage")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("opens details from the card surface while keeping card actions separate", async () => {
    const user = userEvent.setup();
    const onStageChange = vi.fn(async () => {});
    const onViewDetails = vi.fn();

    render(
      <PipelineBoard
        applications={[
          createApplication({
            id: "linear",
            company: "Linear",
            roleTitle: "Frontend Engineer"
          })
        ]}
        changingStageApplicationIds={new Set()}
        onStageChange={onStageChange}
        onViewDetails={onViewDetails}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open Linear details" }));
    expect(onViewDetails).toHaveBeenCalledWith("linear");

    await user.click(screen.getByRole("button", { name: "Mark Linear as applied" }));
    expect(onStageChange).toHaveBeenCalledOnce();
    expect(onViewDetails).toHaveBeenCalledOnce();
  });

  it("keeps empty stage columns compact but discoverable", () => {
    renderBoard([]);

    const board = screen.getByRole("region", { name: "Application pipeline" });
    const savedColumn = within(board).getByRole("region", {
      name: "Saved applications"
    });

    expect(savedColumn).not.toBeNull();
    expect(within(savedColumn).getByText("Saved")).toBeInTheDocument();
    expect(
      within(savedColumn).getByLabelText("Saved applications")
    ).toHaveTextContent("0");
    expect(
      within(savedColumn).getByText("No applications")
    ).toBeInTheDocument();
  });
});
