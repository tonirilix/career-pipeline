## Context

The app already holds the full `applications` list in `App.tsx` state. The eight pipeline stages are defined in `applicationStage.ts` as a typed tuple. The sidebar renders `StatsBar` (active/overdue/upcoming counts), `PipelineControls`, and `FollowUpWork` — in that order — in the left column.

No charting library is currently present. The design-system spec uses Tailwind for all styling.

## Goals / Non-Goals

**Goals:**
- Render a `FunnelChart` component inside the sidebar that shows per-stage application counts
- Derive stage counts from the already-loaded `applications` array — no new data fetching
- Fit visually inside the existing sidebar without expanding its width or breaking the layout

**Non-Goals:**
- Interactive drill-down or click-to-filter behavior (can be added later)
- Server-side aggregation or a new API endpoint
- A third-party charting library — bars rendered with plain `div` elements and Tailwind width utilities
- Showing funnel data in the main content area or a separate route

## Decisions

### Decision: Pure CSS bars, no charting library

A bar-per-stage rendered as a `div` with `style={{ width: X% }}` against a muted background is sufficient for this feature. Adding Recharts or Chart.js would increase the bundle, require a new dependency approval, and introduce a major/minor version constraint — all for a single sidebar widget.

**Alternatives considered:** Recharts (popular, tree-shakeable) — rejected because the added weight is disproportionate to the value of a static bar display with no interactivity.

### Decision: Compute counts in App.tsx, pass as prop to FunnelChart

`App.tsx` already owns the applications list and performs similar derivations (active count, follow-up lists). A `stageCounts` memo keeps `FunnelChart` a pure presentation component — no application-layer coupling inside the UI component.

```ts
const stageCounts = useMemo(
  () => applicationStages.map((stage) => ({
    stage,
    count: applications.filter((a) => a.stage === stage).length
  })),
  [applications]
);
```

**Alternatives considered:** Passing the raw applications list to `FunnelChart` and filtering inside — rejected because it breaks the pattern used by `StatsBar` and `PipelineBoard`, which receive derived values.

### Decision: Placement — after StatsBar, before PipelineControls

The funnel provides a high-level stage overview; it belongs adjacent to the stats summary and above the filter controls that act on that data. This mirrors the information hierarchy: summary → visual breakdown → controls.

### Decision: Show all eight stages, not just active phases

Rejected vs. closed stages are part of the story — a user needs to see how many applications closed vs. progressed. Filtering to active stages only would misrepresent the pipeline shape.

## Risks / Trade-offs

- [Risk] Sidebar vertical height — eight stages adds content to an already tall sidebar. → Mitigation: keep each bar row compact (≈24px), use the existing scrollable sidebar overflow.
- [Risk] Very narrow max-count bars are hard to read when one stage dominates → Mitigation: percentage widths are relative to the max stage count, not total, so even small counts get a visible minimum bar width (min 4px).
- [Risk] Count derivation in App.tsx is O(n × 8) on every render → Mitigation: wrapped in `useMemo`; acceptable until application lists reach thousands of items.
