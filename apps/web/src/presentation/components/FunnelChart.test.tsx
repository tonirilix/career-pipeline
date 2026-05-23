import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { applicationStages } from "../../domain/applicationStage";
import { FunnelChart } from "./FunnelChart";

// Render a simple list of clickable items so onClick behaviour is testable
// without rendering the full nivo SVG in jsdom.
vi.mock("@nivo/funnel", () => ({
  ResponsiveFunnel: ({ onClick, data }: {
    onClick: (part: { data: { id: string } }, e: MouseEvent) => void;
    data: { id: string; value: number }[];
  }) => (
    <ul data-testid="nivo-funnel">
      {data.map((d) => (
        <li key={d.id}>
          <button type="button" onClick={(e) => onClick({ data: d }, e as unknown as MouseEvent)}>
            {d.id}
          </button>
        </li>
      ))}
    </ul>
  ),
}));

function makeAllZero() {
  return applicationStages.map((stage) => ({ stage, count: 0 }));
}

function makeWithCounts(overrides: Partial<Record<string, number>> = {}) {
  return applicationStages.map((stage) => ({
    stage,
    count: overrides[stage] ?? 0,
  }));
}

describe("FunnelChart", () => {
  it("renders a labelled button for all eight pipeline stages", () => {
    render(
      <FunnelChart stageCounts={makeAllZero()} activeStage="All" onStageClick={vi.fn()} />
    );

    for (const stage of applicationStages) {
      expect(screen.getByRole("button", { name: new RegExp(stage) })).toBeInTheDocument();
    }
  });

  it("shows zero counts in the header for all stages when pipeline is empty", () => {
    render(
      <FunnelChart stageCounts={makeAllZero()} activeStage="All" onStageClick={vi.fn()} />
    );

    const section = screen.getByRole("region", { name: "Application funnel" });
    const zeros = within(section).getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(applicationStages.length);
  });

  it("calls onStageClick with the stage when a header button is clicked", async () => {
    const user = userEvent.setup();
    const onStageClick = vi.fn();

    render(
      <FunnelChart
        stageCounts={makeWithCounts({ Applied: 3 })}
        activeStage="All"
        onStageClick={onStageClick}
      />
    );

    await user.click(screen.getByRole("button", { name: /Applied/ }));

    expect(onStageClick).toHaveBeenCalledWith("Applied");
  });

  it("calls onStageClick with 'All' when the active stage button is clicked again", async () => {
    const user = userEvent.setup();
    const onStageClick = vi.fn();

    render(
      <FunnelChart
        stageCounts={makeWithCounts({ Applied: 3 })}
        activeStage="Applied"
        onStageClick={onStageClick}
      />
    );

    // pressed: true selects the header button, not the clear badge
    await user.click(screen.getByRole("button", { pressed: true, name: /Applied/ }));

    expect(onStageClick).toHaveBeenCalledWith("All");
  });

  it("shows the active filter badge with a clear button when a stage is active", () => {
    render(
      <FunnelChart
        stageCounts={makeWithCounts({ Screening: 2 })}
        activeStage="Screening"
        onStageClick={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Clear Screening filter" })).toBeInTheDocument();
  });

  it("calls onStageClick with 'All' when the clear filter badge is clicked", async () => {
    const user = userEvent.setup();
    const onStageClick = vi.fn();

    render(
      <FunnelChart
        stageCounts={makeWithCounts({ Screening: 2 })}
        activeStage="Screening"
        onStageClick={onStageClick}
      />
    );

    await user.click(screen.getByRole("button", { name: "Clear Screening filter" }));

    expect(onStageClick).toHaveBeenCalledWith("All");
  });

  it("marks the active stage button as pressed", () => {
    render(
      <FunnelChart
        stageCounts={makeWithCounts({ Onsite: 1 })}
        activeStage="Onsite"
        onStageClick={vi.fn()}
      />
    );

    // Use aria-pressed to select specifically the header stage button (not the badge)
    expect(screen.getByRole("button", { pressed: true, name: /Onsite/ })).toBeInTheDocument();
  });

  it("wraps content in a region labelled 'Application funnel'", () => {
    render(
      <FunnelChart stageCounts={makeAllZero()} activeStage="All" onStageClick={vi.fn()} />
    );
    expect(
      screen.getByRole("region", { name: "Application funnel" })
    ).toBeInTheDocument();
  });
});
