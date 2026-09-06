## 1. Route Decomposition (enabling refactor, no visual change)

- [x] 1.1 Give `/pipeline`, `/memory`, and `/roles` their own route components in `apps/web/src/presentation/router.tsx`, each rendering the workspace it owns.
- [x] 1.2 Reduce `App.tsx` to the shell: sidebar provider, global navigation, command palette, and the outlet. Move the pipeline workspace body, its `SlideOver` instances, and its state into the pipeline route component.
- [x] 1.3 Remove `workspaceFromPathname` and the four-branch ternary; the router now determines the workspace.
- [x] 1.4 Keep the not-found behaviour intact for unsupported routes.
- [x] 1.5 Verify every existing route renders identically to before, at mobile and desktop widths, and that `npm run test` passes with no test changes.

## 2. Today Derivation (pure function, tested before any UI)

- [x] 2.1 Add a Today derivation module beside `jobApplicationProjections.ts` that takes the unfiltered application list and returns Now, This week, and Waiting groups.
- [x] 2.2 Implement grouping: overdue or due within three days is Now; the remainder of the week and items awaiting review are This week; items with no available action are Waiting.
- [x] 2.3 Implement the five item types — Follow-up from incomplete reminders, Prep from future interviews, Approval from `Saved` applications, Offer from `Offer` applications, Triage from undecided roles.
- [x] 2.4 Populate the due indicator only for Follow-up and Prep, which have genuine target dates. Leave it empty for Approval, Triage, and Offer; do not substitute age in stage. Elapsed time belongs in the rationale line.
- [x] 2.5 Implement deterministic rationale strings from stored data only. Add no AI badge and no field the domain does not have.
- [x] 2.6 Order items within each group by due proximity, soonest first, with dateless items after all dated items.
- [x] 2.7 Unit-test grouping boundaries (overdue, today, three days, seven days), ordering, each item type, the dated-before-dateless ordering, and the empty case.
- [x] 2.8 Test explicitly that derivation is unaffected by pipeline search, stage, source, sort, and saved-view controls.

## 3. Inspector Panel Primitive

- [x] 3.1 Add `InspectorPanel` in `components/ui/`, rendering as a flex sibling of main content with `flex: none` and a clamped width. Do not extend `SlideOver`.
- [x] 3.2 Give the main content region `flex: 1; min-width: 0` so it narrows rather than overflowing. Without `min-width: 0` the list will push off-screen.
- [x] 3.3 Implement close on `Escape` and on the close control. Add no focus trap and no body scroll lock.
- [x] 3.4 Render content as a single scrolling column with a fixed header; add no tabs.
- [x] 3.5 Implement the mobile presentation: full-width, back-style close affordance with an accessible name, 44px minimum touch target.
- [x] 3.6 Test that focus leaves the panel on Tab, that body overflow is untouched, and that main content stays interactive while open.

## 4. Today Workspace

- [x] 4.1 Build the Today route component with its own header — date-stamped summary line, no `WorkspaceShell`.
- [x] 4.2 Build the stage summary strip over the six active stages, each cell navigating to Pipeline filtered to that stage, each keyboard reachable.
- [x] 4.3 Build the row: type chip, action, subject, stage, rationale line, due indicator, one primary action. Accent the due indicator only when past due.
- [x] 4.4 Build the Now and This week groups with labels, counts, and hint text.
- [x] 4.5 Build the collapsed Waiting section with its count and expand control, exposing expanded state to assistive technology.
- [x] 4.6 Build the loading state with a busy indicator, and the empty state confirming nothing needs attention with onward navigation.
- [x] 4.7 Ensure Waiting items alone still produce the empty state.
- [x] 4.8 Wire row activation to open the item in the inspector, and mark the originating row while it is open.

## 5. Global Navigation

- [x] 5.1 Replace the icon-first rail with a fixed labelled rail; remove `defaultCollapsed` and the icon-collapse path.
- [x] 5.2 Add live counts per destination. Today, Pipeline, and their derived counts come from the same function that builds Today so the rail and the screen cannot disagree.
- [x] 5.3 Add one narrow shell-level roles count query for the Roles count. Keep it to a count, share its query key with the Triage row so a single request serves both, and leave `RoleDiscoveryWorkspace` lazy-loading its own fuller data.
- [x] 5.4 Add the accent marker for the active workspace, not relying on text weight alone.
- [x] 5.5 Add Today to the navigation items.
- [x] 5.6 Replace the mobile trigger-and-drawer with a persistent bottom tab bar: labelled, counted, 44px minimum targets, active marker.
- [x] 5.7 Ensure the tab bar does not obscure the end of scrolled content.
- [x] 5.8 Remove the now-unused mobile trigger and drawer code paths.

## 6. Keyboard Navigation

- [x] 6.1 Add `g t` / `g r` / `g p` chords navigating via browser history.
- [x] 6.2 Implement chord expiry and discard unrecognised second keys.
- [x] 6.3 Make all single-key shortcuts and chord prefixes inert while focus is in an input, textarea, or select.
- [x] 6.4 Add `j` / `k` / `Enter` roving selection across Now and This week, excluding collapsed Waiting rows.
- [x] 6.5 Keep the selection marker visually distinct from the focus ring, and make `Enter` act on the selection rather than on incidental focus.
- [x] 6.6 Implement the Escape ordering: palette, then modal drawer, then inspector; inert when nothing is open.

## 7. Route Cutover

- [x] 7.1 Add the `/today` route.
- [x] 7.2 Move the root route to Today; confirm `/pipeline` still resolves to Pipeline directly.
- [x] 7.3 Add the Today navigation command to the command palette.
- [x] 7.4 Confirm browser Back returns to the previous workspace after chord, rail, and palette navigation.

## 8. Verification

- [x] 8.1 Confirm Pipeline, Memory, and Roles are functionally and visually unchanged by this work.
- [x] 8.2 Verify the inspector at the 768–1024px band, where a fixed rail plus an open inspector leaves the list its least room.
- [x] 8.3 Verify Today, the rail, and the inspector on mobile.
- [x] 8.4 Run `npm run test` and `npm run build` in `apps/web`.
- [x] 8.5 Confirm `architecture.test.ts` still passes — the derivation is presentation-layer and must not import infrastructure.
- [x] 8.6 Confirm no mutation is issued by rendering Today.
