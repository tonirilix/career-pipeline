## 1. Shell And Sidebar Foundation

- [x] 1.1 Extend local sidebar primitives to support an icon-first global rail and route-local secondary panel composition.
- [x] 1.2 Update global navigation to render Pipeline, Memory, Roles, and command/search as icon-first controls with accessible labels.
- [x] 1.3 Preserve active route state and browser navigation from the icon rail.
- [x] 1.4 Add collapse/expand behavior for desktop global navigation and ensure mobile drawer behavior still works.

## 2. Workspace Secondary Navigation

- [x] 2.1 Extend `WorkspaceShell` to accept optional route-local secondary navigation content.
- [x] 2.2 Render secondary navigation separately from the main content region and allow it to collapse.
- [x] 2.3 Ensure Memory and Roles are not constrained by Pipeline secondary navigation.
- [x] 2.4 Verify mobile view hides or overlays secondary navigation instead of rendering a permanent column.

## 3. Pipeline Saved Views

- [x] 3.1 Define Pipeline saved view model for Needs attention, Active, Interviewing, Offers, Closed, and All.
- [x] 3.2 Map saved views to existing application projections and filter/sort state without adding backend persistence.
- [x] 3.3 Render Pipeline saved view controls in the Pipeline secondary navigation.
- [x] 3.4 Show selected saved view active state and selected view context in the Pipeline workspace.
- [x] 3.5 Preserve existing board, funnel, details, and follow-up completion workflows under saved views.

## 4. Pipeline View Options

- [x] 4.1 Move raw search, stage, source, and sort controls behind a Pipeline View options surface.
- [x] 4.2 Render compact active filter/sort chips only when non-default filters or sorts are applied.
- [x] 4.3 Add clear-filter behavior from active chips or View options.
- [x] 4.4 Ensure raw controls no longer occupy always-visible first-screen space by default.

## 5. Command Palette

- [x] 5.1 Add shadcn-style command primitives and required dependencies.
- [x] 5.2 Add a command palette dialog opened from the global rail and keyboard shortcut.
- [x] 5.3 Add Navigation commands for Pipeline, Memory, and Roles.
- [x] 5.4 Add Create commands, including Add opportunity.
- [x] 5.5 Add Pipeline saved view commands.
- [x] 5.6 Add deterministic Pipeline filter/sort and clear-filter commands.
- [x] 5.7 Ensure command execution closes the palette and preserves browser history behavior.

## 6. Tests And Verification

- [x] 6.1 Update shell/navigation tests for icon rail active states, accessible labels, collapse, and mobile drawer behavior.
- [x] 6.2 Add workspace secondary navigation tests for collapse/expand and route-local rendering.
- [x] 6.3 Add Pipeline saved view tests for each saved view's visible application behavior.
- [x] 6.4 Update Pipeline filter tests for View options and active filter chips.
- [x] 6.5 Add command palette tests for opening, navigation, Add opportunity, saved views, and clearing filters.
- [x] 6.6 Run `npm test --workspace apps/web`.
- [x] 6.7 Run `npm run build --workspace apps/web`.
- [x] 6.8 Smoke-test `/pipeline`, `/memory`, `/roles`, secondary navigation collapse, View options, and command palette in the browser.
