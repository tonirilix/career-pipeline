## Context

The UI was built desktop-first. `PipelineBoard` uses an inline `gridTemplateColumns` style with a fixed `minmax(200px, 1fr)` that forces horizontal overflow on small viewports. `Sidebar` is a fixed `w-[220px]` element that always occupies space. `SlideOver` renders as a fixed-width right-panel overlay regardless of viewport.

No responsive utilities are currently applied. Tailwind CSS v4 is already in the project — breakpoints (`sm:`, `md:`, `lg:`) are available at zero cost.

## Goals / Non-Goals

**Goals:**
- Board readable and usable on 320px+ viewports
- Sidebar accessible on mobile without permanently consuming horizontal space
- Slide-over usable on mobile (full-screen rather than a narrow panel)
- No layout regression on desktop
- No new dependencies — Tailwind utilities only

**Non-Goals:**
- Native app feel or gesture navigation
- Offline support
- Tablet-specific optimizations beyond what the breakpoint system gives for free
- Changing the visual design language (colors, typography, component shapes)

## Decisions

### 1. Breakpoint strategy: mobile-first Tailwind utilities

Apply styles at the base (mobile) breakpoint and override at `md:` (768px) for desktop. This is the Tailwind convention and keeps class lists readable.

**Alternative considered:** CSS media queries in a stylesheet. Rejected — adds a file boundary and loses co-location with component markup.

### 2. Pipeline board: single column on mobile, CSS Grid on desktop

On mobile (`< md`), render each phase as a stacked list of stage columns, one per row. On desktop (`md:`), restore the current `gridTemplateColumns` layout. The phase grouping (Active / Interviewing / Closed) is preserved at all sizes.

The `style={{ gridTemplateColumns: ... }}` inline style is replaced with a Tailwind `grid-cols-*` class gated behind `md:`. On mobile the grid becomes a single column or a flex column.

**Alternative considered:** Horizontal scroll on mobile (keep current layout, add `overflow-x-auto`). Rejected — scrolling a grid of cards is not usable; stages get cut off with no affordance.

### 3. Sidebar: always-visible on desktop, drawer on mobile

On mobile the sidebar is hidden (`hidden md:flex`). A hamburger button in a top bar reveals it as a full-height drawer overlay (fixed position, `z-50`). Closing happens via an overlay click or a close button inside the drawer.

State (`isSidebarOpen`) lives in `App.tsx` and is passed down as a prop or via the existing `usePipelineControls` store.

**Alternative considered:** Bottom navigation bar on mobile. Rejected — the sidebar content (stats, filters, follow-ups) doesn't map cleanly to 4–5 bottom tabs.

### 4. Slide-over: full-screen on mobile, unchanged on desktop

On mobile (`< md`) the slide-over panel uses `inset-0` (full viewport) instead of the current right-anchored fixed width. The close button moves to the top of the panel. On desktop the existing behavior is unchanged.

This is a CSS-only change inside `SlideOver` — the component API stays the same.

### 5. Touch targets: Tailwind `min-h-[44px] min-w-[44px]` on interactive elements

Any button or link that is currently smaller than 44×44px gets a minimum size class added. This applies primarily to stage column headers, the close button in the slide-over, and the sidebar toggle.

## Risks / Trade-offs

- **Drawer state adds complexity to `App.tsx`** → Keep it local with `useState`; no need for the Zustand store.
- **Inline `gridTemplateColumns` style must be removed** → The number of columns per phase is dynamic (2–3 stages). Use `grid-cols-2` and `grid-cols-3` Tailwind classes dynamically via a lookup instead of an inline style. Tailwind v4 requires full class names to be present in source (no dynamic string construction), so use a `colsClass` map keyed by count.
- **Slide-over focus trap works correctly at full-screen** → No changes needed; the existing focus-trap logic is viewport-agnostic.

## Migration Plan

1. No data migration required.
2. Changes are purely presentational — no API contract changes.
3. Deploy normally; no feature flag needed.
4. Rollback: revert the three component files.
