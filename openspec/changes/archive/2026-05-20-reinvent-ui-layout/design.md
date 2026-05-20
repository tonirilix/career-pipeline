## Context

The app currently renders everything in a single vertical stack: header → inline form (conditional) → active count → pipeline controls → follow-up panels → kanban board → detail panel (conditional). This means:

- Opening the form or detail panel collapses the visible area and forces scrolling
- Filters and sorting have no persistent home — they compete with the board for space
- The 8-column kanban board (Saved → Applied → Screening → Technical interview → Onsite → Offer → Rejected → Withdrawn) maps rigidly to one hiring workflow and feels cluttered even when most columns are empty
- There is no visual hierarchy to guide attention

The codebase follows hexagonal architecture strictly: presentation components communicate through ports only. No domain or infrastructure changes are needed.

## Goals / Non-Goals

**Goals:**
- Sidebar for filters/navigation so the board has maximum horizontal space
- Slide-over drawer replaces both the inline opportunity form and the full-page detail panel
- Pipeline board grouped into phases (Active / Interviewing / Closed) to reduce visual noise
- Stats bar for quick health-check metrics above the board
- Monochromatic design language preserved (no new colors)
- All 52 existing tests continue to pass; new components covered by tests

**Non-Goals:**
- Custom/editable stage names — the domain stage model stays unchanged
- Drag-and-drop between columns
- Persistent sidebar collapse/expand state beyond session
- Mobile responsiveness (out of scope for this change)

## Decisions

### 1. Slide-over panel instead of modal or inline expansion

**Decision:** Use a right-side slide-over panel (fixed position, full viewport height, ~480px wide) for both the opportunity form and application details.

**Rationale:** Modals block context entirely. Inline expansion (current) pushes content down and loses the board. A slide-over keeps the board partially visible, reinforces spatial context ("I'm looking at the board and editing something on the side"), and is easy to dismiss. The monochromatic style suits a dark overlay behind the panel.

**Alternative considered:** Dialog/modal — rejected because it completely hides the pipeline board behind an overlay, which defeats the purpose of seeing where the application lives.

### 2. CSS-only slide-over (no Radix UI Dialog)

**Decision:** Implement `SlideOver` as a plain React component with Tailwind transition classes (`translate-x-full` → `translate-x-0`), a backdrop div, and `useEffect` for Escape key handling.

**Rationale:** No new dependencies. The component is simple enough to hand-roll. Radix UI Dialog would add a portal and focus trap (useful for true modals) but is overkill for a slide-over where focus trap semantics are less critical. Accessibility: `role="dialog"`, `aria-modal="true"`, focus moved to panel on open.

### 3. Left sidebar for controls

**Decision:** Fixed-width left sidebar (220px) containing the app title, active count, stats bar, and pipeline controls (filter/sort/search).

**Rationale:** Removes the vertical stack of controls above the board, giving the board full height. The sidebar is always visible — no toggle needed for this use case. 220px is wide enough for the filter selects and narrow enough to leave ≥1000px for the board on a 1280px screen.

**Alternative considered:** Top toolbar — rejected because it still takes vertical space away from the board and doesn't provide a clear home for the follow-up panels.

### 4. Pipeline phases grouping

**Decision:** Group the 8 stage columns into three visual phases:
- **Active** (Saved, Applied)
- **Interviewing** (Screening, Technical interview, Onsite)
- **Closed** (Offer, Rejected, Withdrawn)

Each phase renders as a labeled section. The Closed phase is collapsed by default when all its columns are empty, reducing visual clutter.

**Rationale:** Most users are in 1–2 phases at a time. Grouping provides visual breaks and lets users understand the flow at a glance. The underlying stage model is unchanged — this is purely presentational grouping.

**Alternative considered:** Let users configure column visibility — rejected as too complex for this change and requires domain changes.

### 5. Follow-up panels moved to sidebar

**Decision:** Move the overdue/upcoming follow-up panels from the main area into the sidebar below the pipeline controls.

**Rationale:** Follow-up work is contextual information, not the primary content. Sidebar placement keeps it visible without consuming board space.

### 6. Stats bar in sidebar header

**Decision:** Add a compact stats section in the sidebar showing: active applications, overdue follow-ups count, and upcoming follow-ups count.

**Rationale:** These three numbers are the most actionable health signals. Computing them from existing state requires no new data fetching. The lime accent color (`--color-accent`) is used for non-zero counts to draw attention.

## Risks / Trade-offs

- **Test churn:** Refactoring App.tsx layout will require updating test helpers that rely on landmark structure (e.g. `getByRole("region", ...)`). The a11y landmark names must stay identical to avoid this. → Mitigation: preserve all `aria-label` values exactly; update only structural test queries.

- **Sidebar width on smaller screens:** 220px sidebar + 8-column board may overflow on 1280px screens with all columns populated. → Mitigation: board columns already scroll horizontally; sidebar is fixed so it doesn't contribute to overflow.

- **Slide-over focus management:** Without a full focus trap, keyboard users can tab behind the overlay. → Mitigation: add a `focus-trap` effect in `SlideOver` that constrains Tab/Shift-Tab to panel children; restore focus to trigger element on close.

- **Escape key conflict:** If the slide-over and a native select dropdown are both open, Escape may close the wrong thing. → Mitigation: only bind Escape handler when slide-over is open; native selects handle their own Escape.

## Migration Plan

1. Build `SlideOver` and `Sidebar` as new components with full test coverage before touching `App.tsx`
2. Refactor `App.tsx` to use the new layout — one pass, keep all aria-labels identical
3. Move `PipelineControls` and `FollowUpWork` into sidebar
4. Trigger `OpportunityForm` and `ApplicationDetails` via slide-over
5. Refactor `PipelineBoard` to render phase groups
6. Run full test suite; fix any selector breakage
7. Visual QA in browser

Rollback: all changes are in the presentation layer — revert is a git reset with no data migration needed.

## Open Questions

- Should the slide-over have a max-height scroll or expand to full viewport height? (Current assumption: full height, scrollable content inside)
- Should empty stage columns within a phase be hidden or shown as placeholders? (Current assumption: shown as narrow placeholders to maintain spatial orientation)
