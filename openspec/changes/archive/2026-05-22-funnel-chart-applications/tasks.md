## 1. FunnelChart Component

- [x] 1.1 Create `apps/web/src/presentation/components/FunnelChart.tsx` accepting a `stageCounts: { stage: ApplicationStage; count: number }[]` prop
- [x] 1.2 Render a labelled row for each of the eight stages with a proportional bar (width relative to the max count) and a count value
- [x] 1.3 Apply a minimum bar width (e.g. 4px / `min-w-1`) so zero-count stages remain visually distinct
- [x] 1.4 Wrap the chart in a `<section aria-label="Application funnel">` region so it satisfies the pipeline-layout spec scenario

## 2. Stage Count Derivation

- [x] 2.1 In `App.tsx`, add a `stageCounts` memo that maps each entry in `applicationStages` to its count in the `applications` array
- [x] 2.2 Pass `stageCounts` as a prop to `FunnelChart`

## 3. Sidebar Integration

- [x] 3.1 Import and render `FunnelChart` in `App.tsx` inside the `Sidebar`, positioned after `StatsBar` and before `PipelineControls`

## 4. Tests

- [x] 4.1 Add a unit test for `FunnelChart` verifying all eight stage labels are rendered
- [x] 4.2 Add a scenario verifying a zero-count stage row is still present in the DOM
- [x] 4.3 Add a scenario verifying that the stage with the highest count receives the widest bar (full-width class or `width: 100%`)
- [x] 4.4 Update `App.test.tsx` (or `PipelineBoard.test.tsx`) to assert the "Application funnel" region is present in the sidebar
