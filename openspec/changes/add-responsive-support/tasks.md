## 1. Pipeline Board — Responsive Layout

- [x] 1.1 Replace inline `gridTemplateColumns` style with a static Tailwind class lookup (`{ 2: 'grid-cols-2', 3: 'grid-cols-3' }`) keyed by stage count
- [x] 1.2 Add `md:` prefix to grid classes so single-column stacking is the mobile default
- [x] 1.3 Verify phase labels (Active, Interviewing, Closed) remain visible at all viewport sizes
- [x] 1.4 Add `min-h-[44px] min-w-[44px]` to interactive stage column headers for touch target compliance

## 2. Sidebar — Mobile Drawer

- [x] 2.1 Add `isSidebarOpen` state to `App.tsx` (or the `usePipelineControls` store) and pass open/close handlers down
- [x] 2.2 Add a hamburger toggle button in a top bar rendered only on mobile (`md:hidden`)
- [x] 2.3 Update `Sidebar` component to accept an `isOpen` prop and render as a fixed full-height overlay on mobile (`fixed inset-y-0 left-0 z-50`) when open
- [x] 2.4 Add a semi-transparent backdrop overlay behind the open drawer; clicking it closes the sidebar
- [x] 2.5 Add a close button inside the drawer with `min-h-[44px] min-w-[44px]`
- [x] 2.6 Hide the sidebar entirely on mobile when closed (`hidden md:flex`); keep the desktop layout unchanged

## 3. SlideOver — Full-Screen on Mobile

- [x] 3.1 Update `SlideOver` panel container to use `inset-0` on mobile and the existing fixed-width right-anchored position on `md:` and above
- [x] 3.2 Ensure the close button is positioned at the top of the panel and meets the 44×44px touch target minimum
- [x] 3.3 Verify existing focus trap, Escape key handling, and focus restoration still work correctly at full-screen size

## 4. Verification

- [x] 4.1 Visually test the board, sidebar, and slide-over at 320px, 768px, and 1280px viewport widths
- [x] 4.2 Confirm desktop layout is unchanged at 1280px
- [x] 4.3 Run the existing test suite (`npm test --workspace apps/web`) and confirm no regressions
