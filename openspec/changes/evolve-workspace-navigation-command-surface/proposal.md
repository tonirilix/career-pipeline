## Why

The workspace shell now separates global navigation from route-local tools, but the Pipeline still behaves like a dense dashboard where too many controls are visible at once. The next step is to make the app feel more focused and AI-native by exposing navigation, views, and actions progressively instead of permanently rendering every control.

## What Changes

- Replace the expanded global navigation sidebar with an icon-first global rail that can collapse/expand while preserving access to Pipeline, Memory, Roles, and command/search entry points.
- Introduce a route-local secondary sidebar/panel pattern for contextual navigation and saved views.
- Add Pipeline saved views such as Needs attention, Active, Interviewing, Offers, Closed, and All.
- Move raw Pipeline search/filter/sort controls behind a View options surface and show only active filter/sort chips in the main workspace.
- Add a command palette for quick navigation, creation actions, Pipeline view switching, and deterministic filter/sort actions.
- Preserve existing route URLs, workspace shell semantics, opportunity form workflow, application details workflow, Memory workflow, and Roles workflow.
- Keep AI/natural-language interpretation out of the first implementation, but design the command surface so an AI-assisted mode can be added later.

## Capabilities

### New Capabilities
- `command-surface`: Defines the command palette behavior for navigation, creation actions, workspace view switching, and deterministic filter/sort commands.
- `workspace-secondary-navigation`: Defines route-local secondary sidebar/panel behavior for contextual views and tools.
- `pipeline-saved-views`: Defines Pipeline saved views and how view selection affects visible applications and follow-up context.

### Modified Capabilities
- `responsive-sidebar`: Global navigation evolves from a label-heavy sidebar into an icon-first rail that can expose secondary route context.
- `workspace-shell`: Workspaces gain support for route-local secondary navigation and hidden view options without shrinking unrelated routes.
- `pipeline-layout`: Pipeline filters and follow-up context become progressively disclosed instead of always-visible workspace sections.
- `workspace-routing`: Route-backed navigation remains stable while command palette and icon rail navigation can also change workspace routes.

## Impact

- Affected frontend files: app shell/sidebar primitives, `AppSidebar`, `WorkspaceShell`, Pipeline controls, follow-up work presentation, tests around route navigation and Pipeline filters, and new command palette components.
- Possible dependency impact: add shadcn command support and its required dependencies if not already present.
- No backend API, GraphQL schema, database, or domain model changes are expected.
