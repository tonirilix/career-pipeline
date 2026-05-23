## Why

Users cannot currently see how their job applications distribute across pipeline stages at a glance — the pipeline board requires horizontal scrolling to assess stage counts. A funnel chart in the sidebar would give immediate visual feedback on where applications are concentrated and where the pipeline narrows.

## What Changes

- Add a `FunnelChart` UI component that renders application counts per stage as a proportional funnel visualization
- Integrate the funnel chart into the sidebar, below the `StatsBar` and above the pipeline controls
- Derive per-stage counts from the existing application list (no new data fetching required)

## Capabilities

### New Capabilities

- `funnel-chart`: Visual funnel component that renders application counts across the eight pipeline stages (Saved → Applied → Screening → Technical interview → Onsite → Offer → Rejected → Withdrawn), with bars proportional to count and labels for each stage

### Modified Capabilities

- `pipeline-layout`: Sidebar gains a new funnel-chart region between StatsBar and pipeline controls

## Impact

- `apps/web/src/presentation/components/` — new `FunnelChart.tsx` component
- `apps/web/src/presentation/App.tsx` — wire per-stage counts and render `FunnelChart` inside sidebar
- `apps/web/src/application/jobApplications.ts` — may need a per-stage count selector if not already computable
- No API or backend changes; data is derived from the already-loaded application list
