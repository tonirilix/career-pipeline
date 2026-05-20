import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatsBar } from "./StatsBar";

describe("StatsBar", () => {
  it("renders all three stat labels and values", () => {
    render(<StatsBar activeCount={3} overdueCount={1} upcomingCount={2} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("applies accent class to active count when > 0", () => {
    render(<StatsBar activeCount={2} overdueCount={0} upcomingCount={0} />);
    const activeValue = screen.getByText("2");
    expect(activeValue.className).toContain("text-accent");
  });

  it("applies accent class to overdue count when > 0", () => {
    render(<StatsBar activeCount={0} overdueCount={3} upcomingCount={0} />);
    const overdueValue = screen.getByText("3");
    expect(overdueValue.className).toContain("text-accent");
  });

  it("does not apply accent class when counts are zero", () => {
    render(<StatsBar activeCount={0} overdueCount={0} upcomingCount={0} />);
    const zeros = screen.getAllByText("0");
    zeros.forEach((el) => expect(el.className).not.toContain("text-accent"));
  });
});
