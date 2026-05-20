import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SlideOver } from "./slide-over";

describe("SlideOver", () => {
  it("is hidden when isOpen is false", () => {
    render(
      <SlideOver isOpen={false} onClose={vi.fn()} title="Test panel">
        <p>Content</p>
      </SlideOver>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has role=dialog and aria-modal when isOpen is true", () => {
    render(
      <SlideOver isOpen={true} onClose={vi.fn()} title="Test panel">
        <p>Content</p>
      </SlideOver>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SlideOver isOpen={true} onClose={onClose} title="Test panel">
        <p>Content</p>
      </SlideOver>
    );
    await user.click(screen.getByRole("button", { name: "Close panel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SlideOver isOpen={true} onClose={onClose} title="Test panel">
        <button>Action</button>
      </SlideOver>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SlideOver isOpen={true} onClose={onClose} title="Test panel">
        <p>Content</p>
      </SlideOver>
    );
    await user.click(screen.getByTestId("slide-over-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
