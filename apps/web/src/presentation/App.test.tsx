import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { JobApplication } from "../domain/jobOpportunity";
import { createJobApplicationGraphqlGateway } from "../infrastructure/graphql/jobApplicationGraphqlGateway";
import { useZustandPipelineControlsStore } from "../infrastructure/zustand/pipelineControlsStore";
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
    createFollowUpReminder: unsupportedCommand,
    completeFollowUpReminder: unsupportedCommand,
    addApplicationNote: unsupportedCommand,
    ...overrides
  };
}

function getStageColumn(stage: string) {
  const board = screen.getByRole("region", { name: "Application pipeline" });
  return within(board).getByText(stage, { selector: "div" }).closest("article") as HTMLElement;
}

function getApplicationCompaniesInStage(stage: string) {
  const board = screen.getByRole("region", { name: "Application pipeline" });
  const column = within(board).getByText(stage, { selector: "div" }).closest("article");

  expect(column).not.toBeNull();

  return within(column as HTMLElement)
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);
}

function renderApp(gateway = createJobApplicationGraphqlGateway()) {
  return render(
    <App
      gateway={gateway}
      usePipelineControls={useZustandPipelineControlsStore}
    />
  );
}

describe("Job application tracker shell", () => {
  it("renders a pipeline workspace with the expected application stages", () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: "Job Application Tracker" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add opportunity" })
    ).toBeInTheDocument();

    const board = screen.getByRole("region", {
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

  it("collapses the Closed phase when empty and expands it when populated", async () => {
    const user = userEvent.setup();

    renderApp();

    const board = screen.getByRole("region", { name: "Application pipeline" });
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
    await user.selectOptions(await screen.findByLabelText("Move Linear to stage"), "Rejected");
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

    expect(await within(closedPhase).findByText("Rejected", { selector: "div" })).toBeInTheDocument();
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
      await screen.findByLabelText("Move Linear to stage"),
      "Offer"
    );
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

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

    await user.selectOptions(screen.getByLabelText("Move Linear to stage"), "Rejected");
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

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

    expect(await screen.findByText("1 active application")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark Linear as applied" }));
    await user.selectOptions(
      await screen.findByLabelText("Move Linear to stage"),
      "Rejected"
    );
    await user.click(screen.getByRole("button", { name: "Update Linear stage" }));

    const rejectedColumn = getStageColumn("Rejected");

    expect(rejectedColumn).not.toBeNull();
    expect(
      await within(rejectedColumn).findByText("Linear")
    ).toBeInTheDocument();
    expect(
      within(rejectedColumn).getByText("Closed")
    ).toBeInTheDocument();
    expect(screen.getByText("0 active applications")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reopen Linear" }));

    expect(await screen.findByText("1 active application")).toBeInTheDocument();
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
    const timeline = within(detail).getByRole("list", { name: "Timeline events" });
    const events = within(timeline).getAllByRole("listitem");

    expect(events).toHaveLength(2);
    expect(events[0]).toHaveTextContent("Saved opportunity");
    expect(events[1]).toHaveTextContent("Moved from Saved to Applied");
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

    await user.selectOptions(
      screen.getByLabelText("Interview type"),
      "Recruiter screen"
    );
    const interviewDateTime = screen.getByRole("group", { name: "Date and time" });
    await user.type(within(interviewDateTime).getByLabelText("Date"), "2026-05-12");
    await user.type(within(interviewDateTime).getByLabelText("Time"), "15:00");
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

    const interviewDateTime = screen.getByRole("group", { name: "Date and time" });
    await user.type(within(interviewDateTime).getByLabelText("Date"), "2026-05-12");
    await user.type(within(interviewDateTime).getByLabelText("Time"), "15:00");
    await user.click(screen.getByRole("button", { name: "Schedule interview" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent(
      "Interviews can only be scheduled after an opportunity has been applied to."
    );
    expect(within(interviewDateTime).getByLabelText("Date")).toHaveValue("2026-05-12");
    expect(within(interviewDateTime).getByLabelText("Time")).toHaveValue("15:00");
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

    await user.click(screen.getByRole("button", { name: "Schedule interview" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent("Interview date and time is required.");
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

    const followUpDueDate = screen.getByRole("group", { name: "Follow-up due date" });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-11");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "12:00");
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

    const followUpDueDate = screen.getByRole("group", { name: "Follow-up due date" });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-09");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "12:00");
    await user.type(
      screen.getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await user.click(screen.getByRole("button", { name: "Create follow-up" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent("Follow-up due date must be after the latest interaction.");
    expect(within(followUpDueDate).getByLabelText("Date")).toHaveValue("2026-05-09");
    expect(within(followUpDueDate).getByLabelText("Time")).toHaveValue("12:00");
    expect(screen.getByLabelText("Follow-up note")).toHaveValue(
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

    await user.type(
      screen.getByLabelText("Follow-up note"),
      "Send recruiter a thank-you note"
    );
    await user.click(screen.getByRole("button", { name: "Create follow-up" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    expect(
      await within(detail).findByRole("alert")
    ).toHaveTextContent("Follow-up due date is required.");
  });

  it("shows details command errors inside the details panel and preserves entered values", async () => {
    const user = userEvent.setup();
    const application = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied"
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
        }
      })
    );

    await user.click(await screen.findByRole("button", { name: "View Linear details" }));

    const detail = screen.getByRole("complementary", {
      name: "Application details"
    });

    await user.type(
      within(detail).getByLabelText("Application note"),
      "Recruiter mentioned a platform team opening."
    );
    await user.click(within(detail).getByRole("button", { name: "Add note" }));

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not add the note right now."
    );
    expect(within(detail).getByLabelText("Application note")).toHaveValue(
      "Recruiter mentioned a platform team opening."
    );

    const followUpDueDate = within(detail).getByRole("group", {
      name: "Follow-up due date"
    });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-20");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "10:00");
    await user.type(
      within(detail).getByLabelText("Follow-up note"),
      "Ask recruiter for feedback."
    );
    await user.click(within(detail).getByRole("button", { name: "Create follow-up" }));

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not create the follow-up right now."
    );
    expect(within(followUpDueDate).getByLabelText("Date")).toHaveValue("2026-05-20");
    expect(within(followUpDueDate).getByLabelText("Time")).toHaveValue("10:00");
    expect(within(detail).getByLabelText("Follow-up note")).toHaveValue(
      "Ask recruiter for feedback."
    );

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
    await user.selectOptions(within(detail).getByLabelText("Outcome"), "No decision");
    await user.click(within(detail).getByRole("button", { name: "Schedule interview" }));

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not schedule the interview right now."
    );
    expect(within(detail).getByLabelText("Interview type")).toHaveValue("Technical");
    expect(within(interviewDateTime).getByLabelText("Date")).toHaveValue("2026-05-21");
    expect(within(interviewDateTime).getByLabelText("Time")).toHaveValue("14:30");
    expect(within(detail).getByLabelText("Interview notes")).toHaveValue(
      "Prepare architecture examples."
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
