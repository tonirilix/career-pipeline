import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { JobApplication } from "../../domain/jobOpportunity";
import { ApplicationDetails } from "./ApplicationDetails";

type ApplicationDetailsProps = ComponentProps<typeof ApplicationDetails>;

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
    location: application.location ?? "Remote",
    compensation: application.compensation ?? "$180k",
    employmentType: application.employmentType ?? "Full-time",
    stage: application.stage ?? "Applied",
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

function createDetailsProps(
  overrides: Partial<ApplicationDetailsProps> = {}
): ApplicationDetailsProps {
  return {
    application: createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      interviews: [
        {
          id: "interview-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-12T15:00:00.000Z",
          outcome: "Scheduled",
          notes: "Ask about team shape"
        }
      ],
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
    }),
    commandError: null,
    addNoteStatus: "idle",
    createFollowUpStatus: "idle",
    scheduleInterviewStatus: "idle",
    recordInterviewOutcomeStatus: "idle",
    onAddNote: vi.fn(async () => true),
    onCreateFollowUp: vi.fn(async () => true),
    onScheduleInterview: vi.fn(async () => true),
    onRecordInterviewOutcome: vi.fn(async () => true),
    ...overrides
  };
}

function renderDetails(overrides: Partial<ApplicationDetailsProps> = {}) {
  const props = createDetailsProps(overrides);
  const view = render(<ApplicationDetails {...props} />);

  return {
    ...view,
    props,
    rerenderDetails(nextProps: Partial<ApplicationDetailsProps>) {
      Object.assign(props, nextProps);
      view.rerender(<ApplicationDetails {...props} />);
    }
  };
}

function detailsWorkspace() {
  return screen.getByRole("complementary", { name: "Application details" });
}

async function openSection(
  user: ReturnType<typeof userEvent.setup>,
  name: string | RegExp
) {
  await user.click(within(detailsWorkspace()).getByRole("button", { name }));
}

async function submitAction(
  user: ReturnType<typeof userEvent.setup>,
  name: string
) {
  const buttons = within(detailsWorkspace()).getAllByRole("button", { name });
  await user.click(buttons[buttons.length - 1]);
}

describe("ApplicationDetails", () => {
  it("navigates detail sections while preserving counts and summary context", async () => {
    const user = userEvent.setup();
    renderDetails();

    const detail = detailsWorkspace();
    expect(within(detail).getByRole("heading", { name: "Linear" })).toBeInTheDocument();
    expect(within(detail).getByText("Frontend Engineer")).toBeInTheDocument();
    expect(within(detail).getByText("Applied")).toBeInTheDocument();
    expect(within(detail).getByRole("button", { name: /Notes.*1/ })).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: /Follow-ups.*1/ })
    ).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: /Interviews.*1/ })
    ).toBeInTheDocument();
    expect(
      within(detail).getByRole("button", { name: /Timeline.*2/ })
    ).toBeInTheDocument();

    await openSection(user, /Interviews.*1/);

    expect(
      within(detail).getByRole("list", { name: "Scheduled interviews" })
    ).toBeInTheDocument();
    expect(within(detail).getByRole("heading", { name: "Linear" })).toBeInTheDocument();
  });

  it("keeps detail workflow forms hidden until users open them and supports cancel", async () => {
    const user = userEvent.setup();
    renderDetails();

    await openSection(user, /Notes.*1/);
    expect(within(detailsWorkspace()).queryByLabelText("Application note")).not.toBeInTheDocument();
    await submitAction(user, "Add note");
    expect(within(detailsWorkspace()).getByLabelText("Application note")).toBeInTheDocument();
    await user.click(within(detailsWorkspace()).getByRole("button", { name: "Cancel" }));
    expect(within(detailsWorkspace()).queryByLabelText("Application note")).not.toBeInTheDocument();

    await openSection(user, /Follow-ups.*1/);
    expect(
      within(detailsWorkspace()).queryByRole("group", { name: "Follow-up due date" })
    ).not.toBeInTheDocument();
    await submitAction(user, "Create follow-up");
    expect(
      within(detailsWorkspace()).getByRole("group", { name: "Follow-up due date" })
    ).toBeInTheDocument();
    await user.click(within(detailsWorkspace()).getByRole("button", { name: "Cancel" }));
    expect(
      within(detailsWorkspace()).queryByRole("group", { name: "Follow-up due date" })
    ).not.toBeInTheDocument();

    await openSection(user, /Interviews.*1/);
    expect(
      within(detailsWorkspace()).queryByRole("group", { name: "Date and time" })
    ).not.toBeInTheDocument();
    await submitAction(user, "Schedule interview");
    expect(
      within(detailsWorkspace()).getByRole("group", { name: "Date and time" })
    ).toBeInTheDocument();
    await user.click(within(detailsWorkspace()).getByRole("button", { name: "Cancel" }));
    expect(
      within(detailsWorkspace()).queryByRole("group", { name: "Date and time" })
    ).not.toBeInTheDocument();

    await submitAction(user, "Record outcome");
    expect(within(detailsWorkspace()).getByLabelText("Outcome")).toBeInTheDocument();
    await user.click(within(detailsWorkspace()).getByRole("button", { name: "Cancel" }));
    expect(within(detailsWorkspace()).queryByLabelText("Outcome")).not.toBeInTheDocument();
  });

  it("preserves command inputs after failures and resets them after successes", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn(async () => false);
    const onCreateFollowUp = vi.fn(async () => false);
    const onScheduleInterview = vi.fn(async () => false);
    const onRecordInterviewOutcome = vi.fn(async () => false);
    const view = renderDetails({
      onAddNote,
      onCreateFollowUp,
      onRecordInterviewOutcome,
      onScheduleInterview
    });

    await openSection(user, /Notes.*1/);
    await submitAction(user, "Add note");
    await user.type(
      within(detailsWorkspace()).getByLabelText("Application note"),
      "Keep this note."
    );
    await submitAction(user, "Add note");
    await waitFor(() => expect(onAddNote).toHaveBeenCalled());
    view.rerenderDetails({
      commandError: { workflow: "note", message: "Could not add note." }
    });
    expect(within(detailsWorkspace()).getByLabelText("Application note")).toHaveValue(
      "Keep this note."
    );

    view.rerenderDetails({
      commandError: null,
      onAddNote: vi.fn(async () => true)
    });
    await submitAction(user, "Add note");
    await waitFor(() =>
      expect(within(detailsWorkspace()).queryByLabelText("Application note")).not.toBeInTheDocument()
    );
    await submitAction(user, "Add note");
    expect(within(detailsWorkspace()).getByLabelText("Application note")).toHaveValue("");

    await openSection(user, /Follow-ups.*1/);
    await submitAction(user, "Create follow-up");
    const followUpDueDate = within(detailsWorkspace()).getByRole("group", {
      name: "Follow-up due date"
    });
    await user.type(within(followUpDueDate).getByLabelText("Date"), "2026-05-20");
    await user.type(within(followUpDueDate).getByLabelText("Time"), "10:00");
    await user.type(within(detailsWorkspace()).getByLabelText("Follow-up note"), "Ask for feedback.");
    await submitAction(user, "Create follow-up");
    await waitFor(() => expect(onCreateFollowUp).toHaveBeenCalled());
    view.rerenderDetails({
      commandError: { workflow: "followUp", message: "Could not create follow-up." }
    });
    expect(within(followUpDueDate).getByLabelText("Date")).toHaveValue("2026-05-20");
    expect(within(followUpDueDate).getByLabelText("Time")).toHaveValue("10:00");
    expect(within(detailsWorkspace()).getByLabelText("Follow-up note")).toHaveValue(
      "Ask for feedback."
    );

    view.rerenderDetails({
      commandError: null,
      onCreateFollowUp: vi.fn(async () => true)
    });
    await submitAction(user, "Create follow-up");
    await waitFor(() =>
      expect(
        within(detailsWorkspace()).queryByRole("group", { name: "Follow-up due date" })
      ).not.toBeInTheDocument()
    );
    await submitAction(user, "Create follow-up");
    const resetFollowUpDueDate = within(detailsWorkspace()).getByRole("group", {
      name: "Follow-up due date"
    });
    expect(within(resetFollowUpDueDate).getByLabelText("Date")).toHaveValue("");
    expect(within(resetFollowUpDueDate).getByLabelText("Time")).toHaveValue("");
    expect(within(detailsWorkspace()).getByLabelText("Follow-up note")).toHaveValue("");

    await openSection(user, /Interviews.*1/);
    await submitAction(user, "Schedule interview");
    await user.selectOptions(within(detailsWorkspace()).getByLabelText("Interview type"), "Technical");
    const interviewDateTime = within(detailsWorkspace()).getByRole("group", {
      name: "Date and time"
    });
    await user.type(within(interviewDateTime).getByLabelText("Date"), "2026-05-21");
    await user.type(within(interviewDateTime).getByLabelText("Time"), "14:30");
    await user.type(
      within(detailsWorkspace()).getByLabelText("Interview notes"),
      "Prepare architecture examples."
    );
    await submitAction(user, "Schedule interview");
    await waitFor(() => expect(onScheduleInterview).toHaveBeenCalled());
    view.rerenderDetails({
      commandError: { workflow: "interview", message: "Could not schedule interview." }
    });
    expect(within(detailsWorkspace()).getByLabelText("Interview type")).toHaveValue("Technical");
    expect(within(interviewDateTime).getByLabelText("Date")).toHaveValue("2026-05-21");
    expect(within(interviewDateTime).getByLabelText("Time")).toHaveValue("14:30");
    expect(within(detailsWorkspace()).getByLabelText("Interview notes")).toHaveValue(
      "Prepare architecture examples."
    );

    view.rerenderDetails({
      commandError: null,
      onScheduleInterview: vi.fn(async () => true)
    });
    await submitAction(user, "Schedule interview");
    await waitFor(() =>
      expect(
        within(detailsWorkspace()).queryByRole("group", { name: "Date and time" })
      ).not.toBeInTheDocument()
    );
    await submitAction(user, "Schedule interview");
    const resetInterviewDateTime = within(detailsWorkspace()).getByRole("group", {
      name: "Date and time"
    });
    expect(within(detailsWorkspace()).getByLabelText("Interview type")).toHaveValue(
      "Recruiter screen"
    );
    expect(within(resetInterviewDateTime).getByLabelText("Date")).toHaveValue("");
    expect(within(resetInterviewDateTime).getByLabelText("Time")).toHaveValue("");
    expect(within(detailsWorkspace()).getByLabelText("Interview notes")).toHaveValue("");

    await user.click(within(detailsWorkspace()).getByRole("button", { name: "Cancel" }));
    await submitAction(user, "Record outcome");
    await user.selectOptions(within(detailsWorkspace()).getByLabelText("Outcome"), "No decision");
    await submitAction(user, "Record outcome");
    await waitFor(() => expect(onRecordInterviewOutcome).toHaveBeenCalled());
    view.rerenderDetails({
      commandError: { workflow: "interview", message: "Could not record outcome." }
    });
    expect(within(detailsWorkspace()).getByLabelText("Outcome")).toHaveValue("No decision");

    view.rerenderDetails({
      commandError: null,
      onRecordInterviewOutcome: vi.fn(async () => true)
    });
    await submitAction(user, "Record outcome");
    await waitFor(() =>
      expect(within(detailsWorkspace()).queryByLabelText("Outcome")).not.toBeInTheDocument()
    );
    await submitAction(user, "Record outcome");
    expect(within(detailsWorkspace()).getByLabelText("Outcome")).toHaveValue("Passed");
  });

  it("disables submit controls for pending workflow commands", async () => {
    const user = userEvent.setup();
    let view = renderDetails({ addNoteStatus: "pending" });

    await openSection(user, /Notes.*1/);
    await submitAction(user, "Add note");
    const addNoteButtons = within(detailsWorkspace()).getAllByRole("button", {
      name: "Add note"
    });
    expect(
      addNoteButtons[addNoteButtons.length - 1]
    ).toBeDisabled();

    view.unmount();
    view = renderDetails({ createFollowUpStatus: "pending" });
    await openSection(user, /Follow-ups.*1/);
    await submitAction(user, "Create follow-up");
    expect(
      within(detailsWorkspace()).getByRole("button", { name: "Create follow-up" })
    ).toBeDisabled();

    view.unmount();
    view = renderDetails({ scheduleInterviewStatus: "pending" });
    await openSection(user, /Interviews.*1/);
    await submitAction(user, "Schedule interview");
    expect(
      within(detailsWorkspace()).getByRole("button", { name: "Schedule interview" })
    ).toBeDisabled();

    view.unmount();
    renderDetails({ recordInterviewOutcomeStatus: "pending" });
    await openSection(user, /Interviews.*1/);
    await submitAction(user, "Record outcome");
    expect(
      within(detailsWorkspace()).getByRole("button", { name: "Record outcome" })
    ).toBeDisabled();
  });
});
