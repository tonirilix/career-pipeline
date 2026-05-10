import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { JobApplication } from "../domain/jobOpportunity";
import { createJobApplicationGraphqlGateway } from "../infrastructure/graphql/jobApplicationGraphqlGateway";
import { App } from "./App";

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
    createFollowUpReminder: unsupportedCommand,
    completeFollowUpReminder: unsupportedCommand,
    addApplicationNote: unsupportedCommand
  };
}

function getApplicationCompaniesInStage(stage: string) {
  const column = screen.getByRole("heading", { name: stage }).closest("article");

  expect(column).not.toBeNull();

  return within(column as HTMLElement)
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);
}

describe("Job application tracker shell", () => {
  it("renders a pipeline workspace with the expected application stages", () => {
    render(<App gateway={createJobApplicationGraphqlGateway()} />);

    expect(
      screen.getByRole("heading", { name: "Job Application Tracker" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add opportunity" })
    ).toBeInTheDocument();

    const board = screen.getByRole("region", {
      name: "Application pipeline"
    });

    [
      "Saved",
      "Applied",
      "Screening",
      "Technical interview",
      "Onsite",
      "Offer",
      "Rejected",
      "Withdrawn"
    ].forEach((stage) => {
      expect(
        within(board).getByRole("heading", { name: stage })
      ).toBeInTheDocument();
    });
  });

  it("lets a user create a saved job opportunity and see it in the Saved column", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    const savedColumn = screen
      .getByRole("heading", { name: "Saved" })
      .closest("article");

    expect(savedColumn).not.toBeNull();
    expect(
      await within(savedColumn as HTMLElement).findByText("Linear")
    ).toBeInTheDocument();
    expect(
      within(savedColumn as HTMLElement).getByText("Frontend Engineer")
    ).toBeInTheDocument();
    expect(
      within(savedColumn as HTMLElement).getByText("Referral")
    ).toBeInTheDocument();
  });

  it("shows understandable errors for required fields and invalid posting URLs", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Posting URL"), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    expect(await screen.findByText("Company is required")).toBeInTheDocument();
    expect(screen.getByText("Role title is required")).toBeInTheDocument();
    expect(
      screen.getByText("Posting URL must be a valid URL")
    ).toBeInTheDocument();
  });

  it("lets a user mark a saved opportunity as applied", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    const savedColumn = screen
      .getByRole("heading", { name: "Saved" })
      .closest("article");
    const appliedColumn = screen
      .getByRole("heading", { name: "Applied" })
      .closest("article");

    expect(savedColumn).not.toBeNull();
    expect(appliedColumn).not.toBeNull();
    expect(
      within(savedColumn as HTMLElement).queryByText("Linear")
    ).not.toBeInTheDocument();
    expect(
      await within(appliedColumn as HTMLElement).findByText("Linear")
    ).toBeInTheDocument();
  });

  it("shows an understandable error when a stage transition is invalid", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    await user.selectOptions(
      await screen.findByLabelText("Move Linear to stage"),
      "Offer"
    );
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

    expect(
      await screen.findByText("Cannot move an application from Saved to Offer.")
    ).toBeInTheDocument();
  });

  it("lets a user advance active stages, reject an application, and reopen it", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    const screeningColumn = screen
      .getByRole("heading", { name: "Screening" })
      .closest("article");

    expect(screeningColumn).not.toBeNull();
    expect(
      await within(screeningColumn as HTMLElement).findByText("Linear")
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Move Linear to stage"), "Rejected");
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

    const rejectedColumn = screen
      .getByRole("heading", { name: "Rejected" })
      .closest("article");

    expect(rejectedColumn).not.toBeNull();
    expect(
      await within(rejectedColumn as HTMLElement).findByText("Linear")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reopen Linear" }));

    const appliedColumn = screen
      .getByRole("heading", { name: "Applied" })
      .closest("article");

    expect(appliedColumn).not.toBeNull();
    expect(
      await within(appliedColumn as HTMLElement).findByText("Linear")
    ).toBeInTheDocument();
  });

  it("treats rejected applications as closed work until they are reopened", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
    await user.click(screen.getByRole("button", { name: "Save opportunity" }));

    expect(await screen.findByText("1 active application")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark Linear as applied" }));
    await user.selectOptions(
      await screen.findByLabelText("Move Linear to stage"),
      "Rejected"
    );
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

    const rejectedColumn = screen
      .getByRole("heading", { name: "Rejected" })
      .closest("article");

    expect(rejectedColumn).not.toBeNull();
    expect(
      await within(rejectedColumn as HTMLElement).findByText("Linear")
    ).toBeInTheDocument();
    expect(
      within(rejectedColumn as HTMLElement).getByText("Closed")
    ).toBeInTheDocument();
    expect(screen.getByText("0 active applications")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reopen Linear" }));

    expect(await screen.findByText("1 active application")).toBeInTheDocument();
  });

  it("lets a user inspect application details and timeline without leaving the board", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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
    expect(within(detail).getByText("Saved opportunity")).toBeInTheDocument();
  });

  it("keeps selected application timeline updated after stage changes", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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
    const timeline = within(detail).getByRole("list", { name: "Timeline events" });
    const events = within(timeline).getAllByRole("listitem");

    expect(events).toHaveLength(2);
    expect(events[0]).toHaveTextContent("Saved opportunity");
    expect(events[1]).toHaveTextContent("Moved from Saved to Applied");
  });

  it("lets a user schedule an interview for an applied application and see it in details", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.selectOptions(
      screen.getByLabelText("Interview type"),
      "Recruiter screen"
    );
    await user.type(screen.getByLabelText("Date and time"), "2026-05-12T15:00");
    await user.type(
      screen.getByLabelText("Interview notes"),
      "Ask about team shape"
    );
    await user.selectOptions(screen.getByLabelText("Outcome"), "Scheduled");
    await user.click(screen.getByRole("button", { name: "Schedule interview" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    const interviews = within(detail).getByRole("list", {
      name: "Scheduled interviews"
    });

    expect(
      await within(interviews).findByText("Recruiter screen")
    ).toBeInTheDocument();
    expect(within(interviews).getByText("Scheduled")).toBeInTheDocument();
    expect(within(interviews).getByText("Ask about team shape")).toBeInTheDocument();
    expect(
      within(detail).getByText("Scheduled Recruiter screen interview")
    ).toBeInTheDocument();
  });

  it("shows an understandable error when scheduling an interview for a saved opportunity", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.type(screen.getByLabelText("Date and time"), "2026-05-12T15:00");
    await user.click(screen.getByRole("button", { name: "Schedule interview" }));

    expect(
      await screen.findByText(
        "Interviews can only be scheduled after an opportunity has been applied to."
      )
    ).toBeInTheDocument();
  });

  it("shows an understandable error when scheduling an interview without a date", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.click(screen.getByRole("button", { name: "Schedule interview" }));

    expect(
      await screen.findByText("Interview date and time is required.")
    ).toBeInTheDocument();
  });

  it("lets a user create and complete an upcoming follow-up reminder", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.type(screen.getByLabelText("Follow-up due date"), "2026-05-11T12:00");
    await user.type(
      screen.getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await user.click(screen.getByRole("button", { name: "Create follow-up" }));

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
      within(followUpWork).getByText("No upcoming follow-ups")
    ).toBeInTheDocument();
  });

  it("shows an understandable error when a follow-up is due before the latest interaction", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.type(screen.getByLabelText("Follow-up due date"), "2026-05-09T12:00");
    await user.type(
      screen.getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await user.click(screen.getByRole("button", { name: "Create follow-up" }));

    expect(
      await screen.findByText(
        "Follow-up due date must be after the latest interaction."
      )
    ).toBeInTheDocument();
  });

  it("shows an understandable error when creating a follow-up without a due date", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.type(
      screen.getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await user.click(screen.getByRole("button", { name: "Create follow-up" }));

    expect(
      await screen.findByText("Follow-up due date is required.")
    ).toBeInTheDocument();
  });

  it("lets a user add a note and see it in application details and timeline", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.type(
      screen.getByLabelText("Application note"),
      "Recruiter mentioned the team is expanding."
    );
    await user.click(screen.getByRole("button", { name: "Add note" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });
    const notes = within(detail).getByRole("list", {
      name: "Application notes"
    });

    expect(
      await within(notes).findByText("Recruiter mentioned the team is expanding.")
    ).toBeInTheDocument();
    expect(within(detail).getByText("Added note")).toBeInTheDocument();
  });

  it("lets a user filter the pipeline by stage", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
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
    await user.click(
      await screen.findByRole("button", { name: "Mark Linear as applied" })
    );

    await user.selectOptions(screen.getByLabelText("Filter by stage"), "Applied");

    const board = screen.getByRole("region", { name: "Application pipeline" });

    expect(within(board).getByText("Linear")).toBeInTheDocument();
    expect(within(board).queryByText("Vercel")).not.toBeInTheDocument();
  });

  it("lets a user filter the pipeline by source", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

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

    await user.selectOptions(screen.getByLabelText("Filter by source"), "Referral");

    const board = screen.getByRole("region", { name: "Application pipeline" });

    expect(within(board).getByText("Linear")).toBeInTheDocument();
    expect(within(board).queryByText("Vercel")).not.toBeInTheDocument();
  });

  it("lets a user search the pipeline by company or role title", async () => {
    const user = userEvent.setup();

    render(<App gateway={createJobApplicationGraphqlGateway()} />);

    await user.click(screen.getByRole("button", { name: "Add opportunity" }));
    await user.type(screen.getByLabelText("Company"), "Linear");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Posting URL"),
      "https://linear.app/careers/frontend-engineer"
    );
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

    render(
      <App
        gateway={createReadOnlyGateway([
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
        ])}
      />
    );
    await screen.findByRole("heading", { name: "Linear" });

    await user.selectOptions(
      screen.getByLabelText("Sort applications"),
      "lastActivity"
    );

    expect(getApplicationCompaniesInStage("Saved")).toEqual([
      "Vercel",
      "Linear"
    ]);
  });

  it("lets a user sort the pipeline by follow-up date", async () => {
    const user = userEvent.setup();

    render(
      <App
        gateway={createReadOnlyGateway([
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
        ])}
      />
    );
    await screen.findByRole("heading", { name: "Linear" });

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
