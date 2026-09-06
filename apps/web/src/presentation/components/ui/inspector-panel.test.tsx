import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { InspectorPanel } from "./inspector-panel";
import { SlideOver } from "./slide-over";

function Harness({
  withSlideOver = false
}: {
  withSlideOver?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      <main className="min-w-0 flex-1">
        <button type="button" onClick={() => setIsOpen(true)}>
          Open item
        </button>
        <button type="button">List action</button>
      </main>
      <InspectorPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Acme — Frontend Engineer"
        type="Follow-up"
        stage="Applied"
      >
        <button type="button">Inspector action</button>
      </InspectorPanel>
      {withSlideOver ? (
        <SlideOver isOpen onClose={() => undefined} title="Application details">
          <p>Details</p>
        </SlideOver>
      ) : null}
    </div>
  );
}

describe("InspectorPanel", () => {
  it("renders no backdrop over the main content", () => {
    render(<Harness />);

    expect(screen.queryByTestId("slide-over-backdrop")).not.toBeInTheDocument();
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
  });

  it("keeps main content interactive while open", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const listAction = screen.getByRole("button", { name: "List action" });
    await user.click(listAction);

    expect(listAction).toHaveFocus();
    expect(
      screen.getByRole("complementary", { name: "Follow-up details" })
    ).toBeInTheDocument();
  });

  it("does not trap focus — Tab leaves the panel", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    screen.getByRole("button", { name: "Inspector action" }).focus();
    await user.tab();

    expect(
      screen.getByRole("button", { name: "Inspector action" })
    ).not.toHaveFocus();
  });

  it("does not lock body scroll", () => {
    const previousOverflow = document.body.style.overflow;
    render(<Harness />);

    expect(document.body.style.overflow).toBe(previousOverflow);
  });

  it("identifies the subject, its type, and its stage", () => {
    render(<Harness />);

    const panel = screen.getByRole("complementary", { name: "Follow-up details" });

    expect(panel).toHaveTextContent("Acme — Frontend Engineer");
    expect(panel).toHaveTextContent("Follow-up");
    expect(panel).toHaveTextContent("Applied");
  });

  it("presents no tab panels", () => {
    render(<Harness />);

    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(screen.queryAllByRole("tabpanel")).toHaveLength(0);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("complementary", { name: "Follow-up details" })
    ).not.toBeInTheDocument();
  });

  it("leaves Escape to a modal surface above it", async () => {
    const user = userEvent.setup();
    render(<Harness withSlideOver />);

    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("complementary", { name: "Follow-up details" })
    ).toBeInTheDocument();
  });

  it("closes from the desktop close control", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Close inspector" }));

    expect(
      screen.queryByRole("complementary", { name: "Follow-up details" })
    ).not.toBeInTheDocument();
  });

  it("offers a named back affordance for mobile", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const back = screen.getByRole("button", { name: "Back to list" });
    expect(back.className).toContain("min-h-11");
    expect(back.className).toContain("min-w-11");

    await user.click(back);

    expect(
      screen.queryByRole("complementary", { name: "Follow-up details" })
    ).not.toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    render(
      <InspectorPanel
        isOpen={false}
        onClose={() => undefined}
        title="Acme"
        type="Follow-up"
      >
        <p>Body</p>
      </InspectorPanel>
    );

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});
