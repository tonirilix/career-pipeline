## 1. Pipeline Board — Responsive Layout

- [ ] 1.1 Replace inline `gridTemplateColumns` style with a static Tailwind class lookup (`{ 2: 'grid-cols-2', 3: 'grid-cols-3' }`) keyed by stage count
- [ ] 1.2 Add `md:` prefix to grid classes so single-column stacking is the mobile default
- [ ] 1.3 Verify phase labels (Active, Interviewing, Closed) remain visible at all viewport sizes
- [ ] 1.4 Add `min-h-[44px] min-w-[44px]` to interactive stage column headers for touch target compliance

## 2. Sidebar — Mobile Drawer

- [ ] 2.1 Add `isSidebarOpen` state to `App.tsx` (or the `usePipelineControls` store) and pass open/close handlers down
- [ ] 2.2 Add a hamburger toggle button in a top bar rendered only on mobile (`md:hidden`)
- [ ] 2.3 Update `Sidebar` component to accept an `isOpen` prop and render as a fixed full-height overlay on mobile (`fixed inset-y-0 left-0 z-50`) when open
- [ ] 2.4 Add a semi-transparent backdrop overlay behind the open drawer; clicking it closes the sidebar
- [ ] 2.5 Add a close button inside the drawer with `min-h-[44px] min-w-[44px]`
- [ ] 2.6 Hide the sidebar entirely on mobile when closed (`hidden md:flex`); keep the desktop layout unchanged

## 3. SlideOver — Full-Screen on Mobile

- [ ] 3.1 Update `SlideOver` panel container to use `inset-0` on mobile and the existing fixed-width right-anchored position on `md:` and above
- [ ] 3.2 Ensure the close button is positioned at the top of the panel and meets the 44×44px touch target minimum
- [ ] 3.3 Verify existing focus trap, Escape key handling, and focus restoration still work correctly at full-screen size

## 4. Verification

- [ ] 4.1 Visually test the board, sidebar, and slide-over at 320px, 768px, and 1280px viewport widths
- [ ] 4.2 Confirm desktop layout is unchanged at 1280px
- [ ] 4.3 Run the existing test suite (`npm test --workspace apps/web`) and confirm no regressions
