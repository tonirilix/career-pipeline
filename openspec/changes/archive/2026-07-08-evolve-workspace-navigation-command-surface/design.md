## Context

The app now has stable workspace routes and a shared workspace shell. Global navigation is route-focused, while Pipeline tools live inside the Pipeline workspace. This fixed the semantic problem, but the UI still feels like a dense dashboard: stats, filters, follow-up work, funnel, board, and route controls all compete for first-screen attention.

The target interaction model is closer to modern productivity tools:
- a compact global icon rail for top-level destinations
- a route-local secondary panel for context and saved views
- a command palette for navigation and quick actions
- progressive disclosure for filters and view options

The shadcn sidebar and command patterns are a good local fit because the project already uses shadcn-style primitives. The official sidebar docs support collapsible/icon sidebars and inset layouts, while the command component is intended for search and quick actions.

## Goals / Non-Goals

**Goals:**
- Make global navigation more compact by moving it to an icon-first rail.
- Add route-local secondary navigation that can expose Pipeline views without consuming main workspace width permanently.
- Reduce always-visible Pipeline controls by hiding raw filters/sort behind View options.
- Add deterministic command palette actions for navigation, creation, view switching, and filter/sort changes.
- Preserve route-backed navigation and existing workflows.
- Keep the implementation compatible with the current workspace shell and TanStack Router setup.

**Non-Goals:**
- Do not add AI natural-language interpretation in this change.
- Do not change backend APIs, GraphQL schema, persistence, or domain models.
- Do not introduce new top-level workspaces.
- Do not redesign the detailed Memory or Roles content beyond adding secondary navigation affordances where useful.
- Do not remove direct clickable UI for important actions such as Add opportunity.

## Decisions

### D1 - Use an icon-first global rail

Global navigation SHALL become a narrow rail containing icons for Pipeline, Memory, Roles, and command/search. Labels may appear in tooltips, mobile drawer state, or expanded state, but desktop default should prioritize space.

Why: The current expanded sidebar still consumes width for only three top-level routes. An icon rail scales better as more sections appear and matches the shadcn sidebar-09 pattern the user referenced.

Alternative considered: Keep the current expanded shadcn-style sidebar. This is simpler, but it does not address the “UI takes too much space” problem deeply enough.

### D2 - Add route-local secondary navigation

Each workspace MAY provide a secondary sidebar/panel. Pipeline SHALL use it for saved views and contextual counters. The secondary panel SHALL be collapsible and route-local; hiding it SHALL leave the main workspace usable.

Why: Workspace-specific navigation is useful, but it should not live in global navigation. A second panel gives Pipeline room for “Needs attention” and other views without forcing filters above the board.

Alternative considered: Put Pipeline views as horizontal tabs in the main header. This is compact, but it becomes crowded when view options, counters, command entry, and primary actions are all present.

### D3 - Treat Pipeline filters as view options

Raw filters and sort controls SHALL move behind a View options control. The main workspace SHALL show active filter/sort chips only when non-default filters are applied.

Why: Filters are configuration, not primary content. Users usually work from saved views or command actions; raw controls should be available without occupying first-screen space.

Alternative considered: Keep the compact filter toolbar. It is better than the original sidebar, but it still asks users to parse controls before seeing work.

### D4 - Add deterministic command palette first

The command palette SHALL initially support deterministic commands:
- navigate to Pipeline, Memory, Roles
- create an opportunity
- switch Pipeline saved views
- apply known filters/sorts
- clear Pipeline filters

Why: This creates an AI-ish interaction surface without introducing unreliable natural-language parsing. It also gives keyboard-driven users a fast path.

Alternative considered: Start with natural-language AI commands. That is attractive but requires a separate semantic interpretation layer, error handling, and likely backend/provider decisions.

### D5 - Make Pipeline saved views the primary entry point

Pipeline SHALL expose saved views for Needs attention, Active, Interviewing, Offers, Closed, and All. A view selection SHALL update visible applications and contextual follow-up visibility. Raw filter controls SHALL be secondary.

Why: Users think in workflows, not filters. “Needs attention” and “Interviewing” are more meaningful than choosing stage/source/sort from scratch.

Alternative considered: Keep stage filters as the primary model. This is technically simple, but it feels like a database control surface rather than a career workflow.

## Risks / Trade-offs

- [Risk] Icon-only navigation may reduce discoverability. -> Mitigation: include accessible labels, active state, tooltips or expanded drawer labels, and route titles in the main shell.
- [Risk] Secondary sidebar can recreate the original space problem. -> Mitigation: make it collapsible, route-local, and focused on saved views rather than raw controls.
- [Risk] Command palette can become a dumping ground. -> Mitigation: keep first release grouped and deterministic: Navigation, Create, Pipeline views, Pipeline filters.
- [Risk] Tests may become brittle if command items duplicate button names. -> Mitigation: scope tests by dialog/region and preserve accessible names intentionally.
- [Risk] Saved views may conflict with existing filter store semantics. -> Mitigation: define views as presets over the existing filter/sort state first, not as a new persistence model.

## Migration Plan

1. Extend local sidebar primitives to support icon rail and route-local secondary panel composition.
2. Replace the current expanded global sidebar presentation with the icon rail while preserving existing route navigation.
3. Add a secondary workspace panel slot to the shell.
4. Implement Pipeline saved views using existing application projections and filter/sort state.
5. Move raw Pipeline controls behind View options and render active chips in the workspace header.
6. Add command palette primitives and command data/actions.
7. Update tests for icon rail navigation, secondary panel collapse, saved views, hidden filters, command actions, and route history.
8. Smoke-test Pipeline, Memory, Roles, mobile navigation, and command palette keyboard behavior.

Rollback is possible by restoring the expanded sidebar and compact toolbar from the archived `redesign-scalable-workspace-navigation` change.

## Open Questions

- Should the secondary panel default open on desktop for Pipeline, or default collapsed after the first release?
- Should secondary panel collapsed/open state persist across reloads?
- Should Pipeline saved views eventually become user-configurable and persisted?
