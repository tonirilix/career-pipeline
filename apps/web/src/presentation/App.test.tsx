import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("Job application tracker shell", () => {
  it("renders a pipeline workspace with the expected application stages", () => {
    render(<App />);

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
});
