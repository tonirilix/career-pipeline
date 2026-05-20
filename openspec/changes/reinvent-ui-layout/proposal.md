## Why

The current UI is functional but not pleasant to use: the opportunity form appears inline pushing everything down, the kanban columns are rigidly tied to a single interview flow that doesn't accommodate different hiring processes, and there is no clear visual hierarchy or sense of place when navigating between views. The layout needs a ground-up rethink to become a tool people actually want to use.

## What Changes

- Replace inline opportunity form with a slide-over panel (right-side drawer) so the pipeline board stays visible while adding/editing
- Add a persistent left sidebar for navigation, filtering, and sorting — freeing the main area for the pipeline board
- Redesign the pipeline board with flexible, user-friendly stage columns: collapse empty columns, show application counts prominently, support horizontal scroll gracefully
- Replace the rigid 8-column stage flow with a configurable view that groups stages into meaningful phases (e.g. _Active_, _Interviewing_, _Closed_) without removing the underlying stage model
- Replace the full-page application details section (currently appended below the board) with a right-side drawer/panel that slides in on card click, keeping context visible
- Add a compact stats bar (active count, response rate, upcoming follow-ups) above the board as a quick health check

## Capabilities

### New Capabilities

- `slide-over-panel`: Reusable slide-over drawer component used for the opportunity form and application details — animates in from the right, closable via overlay click or Escape key
- `pipeline-layout`: Top-level layout composition — sidebar + main content area + slide-over layer; replaces the current single-column stacked layout
- `pipeline-phases`: Visual grouping of kanban columns into phases (Active / Interviewing / Closed) with collapsible closed phase to reduce visual noise

### Modified Capabilities

- `design-system`: New layout primitives (sidebar, drawer/slide-over) extend the existing component set

## Impact

- `src/presentation/App.tsx` — layout structure changes significantly; form and detail panel become drawer-triggered
- `src/presentation/components/PipelineBoard.tsx` — columns grouped into phases, collapsed state for empty/closed columns
- `src/presentation/components/ApplicationCard.tsx` — card click opens slide-over instead of scrolling to bottom panel
- `src/presentation/components/ApplicationDetails.tsx` — rendered inside slide-over panel
- `src/presentation/components/OpportunityForm.tsx` — rendered inside slide-over panel
- `src/presentation/components/PipelineControls.tsx` — moved into sidebar
- New components: `SlideOver`, `Sidebar`, `StatsBar`, `PipelinePhase`
- No changes to domain, application, or infrastructure layers
- No breaking changes to existing ports or use cases
