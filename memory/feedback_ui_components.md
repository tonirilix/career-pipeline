---
name: feedback_ui_components
description: Never modify files under src/presentation/components/ui/ to fix test failures — update the tests instead
metadata:
  type: feedback
---

Never modify files under `src/presentation/components/ui/` (shadcn/ui primitives like card.tsx, button.tsx, etc.) to work around test failures. Update the tests instead.

**Why:** User explicitly forbade this after I changed `CardTitle` from `<div>` to `<h2>` to make `getByRole("heading")` queries pass. The user wants to use the components as-is (standard shadcn/ui primitives) and have tests adapt to the component's actual DOM output.

**How to apply:** When a test fails because a ui/ primitive renders as a `<div>` instead of a semantic element (e.g., `<h2>`), fix the test query — use `getByText`, `getAllByText({ selector: "div" })`, data-testid, or aria-label — rather than changing the component's element type.
