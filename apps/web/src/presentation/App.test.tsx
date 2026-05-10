import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createJobApplicationGraphqlGateway } from "../infrastructure/graphql/jobApplicationGraphqlGateway";
import { App } from "./App";

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
});
