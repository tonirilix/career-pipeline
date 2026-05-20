## 1. SlideOver component

- [x] 1.1 Create `src/presentation/components/ui/slide-over.tsx` with `role="dialog"`, `aria-modal="true"`, backdrop div, and Tailwind `translate-x-full`/`translate-x-0` transition
- [x] 1.2 Implement Escape key handler via `useEffect` that calls `onClose` when panel is open
- [x] 1.3 Implement focus trap: on open move focus into panel; Tab/Shift-Tab cycle within focusable children; restore focus to trigger element on close
- [x] 1.4 Add a close button inside the panel header that calls `onClose`
- [x] 1.5 Write tests: panel hidden when `isOpen={false}`, visible when `isOpen={true}`, `onClose` called on backdrop click, `onClose` called on Escape, ARIA attributes present

## 2. Sidebar component

- [x] 2.1 Create `src/presentation/components/ui/sidebar.tsx` — fixed 220px left panel with `border-r border-border`, overflow-y scroll, full viewport height
- [x] 2.2 Export `Sidebar` from the ui index (or directly import where used)

## 3. StatsBar component

- [x] 3.1 Create `src/presentation/components/StatsBar.tsx` with props: `activeCount`, `overdueCount`, `upcomingCount`
- [x] 3.2 Render three stat items: active applications (accent color when > 0), overdue follow-ups (accent when > 0), upcoming follow-ups (muted)
- [x] 3.3 Write tests: correct counts displayed, accent class applied when count > 0

## 4. Pipeline phases refactor

- [x] 4.1 Define phase groupings in `PipelineBoard.tsx`: Active = [Saved, Applied], Interviewing = [Screening, Technical interview, Onsite], Closed = [Offer, Rejected, Withdrawn]
- [x] 4.2 Render each phase as a `<section aria-label="<Phase> phase">` containing its stage columns
- [x] 4.3 Add `isClosedCollapsed` local state (default `true` when all closed-stage application counts are zero)
- [x] 4.4 Auto-expand Closed phase when any closed-stage application count > 0
- [x] 4.5 Render Closed phase header as a clickable toggle button to manually expand/collapse
- [x] 4.6 Update tests: query by phase region labels; verify Closed phase collapses when empty and expands when populated

## 5. App layout — sidebar integration

- [x] 5.1 Refactor `App.tsx` to a two-column layout: `<nav>` sidebar + `<main>` content area using `flex h-screen`
- [x] 5.2 Move `PipelineControls` into the sidebar
- [x] 5.3 Move `FollowUpWork` into the sidebar below pipeline controls (stacked, scrollable)
- [x] 5.4 Move `StatsBar` into the sidebar above pipeline controls
- [x] 5.5 Move the "Add opportunity" button into the sidebar header area
- [x] 5.6 Keep `PipelineBoard` as the sole content in `<main>`

## 6. App layout — slide-over integration

- [x] 6.1 Replace the `isFormOpen` inline conditional with a `SlideOver` wrapping `OpportunityForm`; pass `isOpen={isFormOpen}` and `onClose` that cancels/resets the form
- [x] 6.2 Add `selectedApplicationId` state trigger to open a `SlideOver` wrapping `ApplicationDetails`; close on `onClose`
- [x] 6.3 Remove the standalone `selectedApplication` block appended below the board
- [x] 6.4 Pass the trigger button ref to `SlideOver` so focus returns to "Add opportunity" or the card's view-details button on close

## 7. Test updates

- [x] 7.1 Update `App.test.tsx` helpers that rely on layout landmarks changed by the sidebar refactor (e.g. pipeline controls now inside `nav`)
- [x] 7.2 Verify slide-over open/close flows in integration tests: form opens on button click, closes on cancel/submit; details open on card click, close on overlay click
- [x] 7.3 Run full test suite — confirm all 52+ tests pass

## 8. Visual QA

- [x] 8.1 Run `npm run dev` and verify sidebar renders with controls, stats, and follow-up panels
- [x] 8.2 Verify "Add opportunity" opens slide-over with form; submit adds card to board; cancel closes without adding
- [x] 8.3 Verify clicking a card's "View details" opens slide-over with application details
- [x] 8.4 Verify pipeline phases render with correct labels; Closed phase collapses when empty and expands when an application is moved to a closed stage
- [x] 8.5 Run `npm run build` — confirm production build succeeds
