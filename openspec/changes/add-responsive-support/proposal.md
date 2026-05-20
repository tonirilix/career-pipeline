## Why

The application was built desktop-first and is unusable on mobile and tablet — columns overflow, the slide-over panel takes up too much space, and touch targets are too small. Users who want to update their job pipeline on the go have no usable experience.

## What Changes

- Add responsive breakpoints across all layout components so the board adapts from mobile (320px) through tablet to desktop
- Collapse the multi-column pipeline board into a single scrollable column on mobile, grouped by phase (Active, Interviewing, Closed)
- Convert the fixed sidebar into a collapsible drawer on mobile with a hamburger toggle
- Make the slide-over detail panel full-screen on mobile instead of a fixed-width overlay
- Ensure all touch targets meet the 44×44px minimum
- Keep the existing desktop layout unchanged

## Capabilities

### New Capabilities

- `responsive-pipeline-board`: Board layout adapts to viewport — multi-column on desktop, single scrollable column on mobile with phase grouping retained
- `responsive-sidebar`: Sidebar collapses to a drawer on mobile; hamburger toggle opens/closes it; desktop sidebar is unchanged
- `responsive-slide-over`: Slide-over detail panel goes full-screen on mobile; fixed-width overlay on desktop unchanged

### Modified Capabilities

- `pipeline-layout`: Breakpoint behavior and mobile container rules added to existing layout requirements
- `pipeline-phases`: Phase grouping must work in both column and stacked-column layouts

## Impact

- `apps/web/src/presentation/components/PipelineBoard.tsx` — responsive column layout
- `apps/web/src/presentation/components/ui/sidebar.tsx` — collapsible drawer behavior
- `apps/web/src/presentation/components/ui/slide-over.tsx` — full-screen mobile variant
- Tailwind CSS utility classes only — no new dependencies
- No backend changes
- No domain or application layer changes
