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
});
