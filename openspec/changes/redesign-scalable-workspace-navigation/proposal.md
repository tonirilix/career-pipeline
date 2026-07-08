## Why

The current sidebar mixes global workspace navigation with pipeline-specific actions, stats, filters, and follow-up work. That makes Memory and Roles feel cramped and semantically wrong, and it will not scale as more workspaces are added.

This change separates global navigation from workspace-local tools so each section can own its actions and layout without competing with pipeline controls.

## What Changes

- Replace the current full sidebar-as-tool-panel pattern with a scalable app navigation shell.
- Use shadcn sidebar primitives as the intended implementation base for global navigation, including collapsible desktop behavior and mobile/off-canvas behavior.
- Keep global navigation focused on app identity and workspace routes: Pipeline, Memory, Roles, and future sections.
- Move pipeline-specific controls out of the global sidebar and into the Pipeline workspace.
- Introduce a reusable workspace header/tool area where each route can present its own title, primary action, filters, stats, and secondary controls.
- Preserve route-backed navigation for `/pipeline`, `/memory`, and `/roles`.
- Preserve existing pipeline workflows: add opportunity, stats, filters, follow-up work, funnel chart, board, and details slide-over.
- Preserve existing Memory and Roles workflows while giving them more horizontal space.
- Update responsive behavior so mobile users can reach global navigation without carrying pipeline-only controls on every route.

## Capabilities

### New Capabilities
- `workspace-shell`: Defines shared workspace-level page structure, including section headers, local actions, and route-specific controls.

### Modified Capabilities
- `pipeline-layout`: Global navigation and pipeline-specific tools SHALL be separated; pipeline controls SHALL live inside the Pipeline workspace.
- `responsive-sidebar`: Sidebar behavior SHALL support scalable global navigation rather than a pipeline-only control drawer.
- `workspace-routing`: Route-backed workspace navigation SHALL remain stable while moving navigation into the redesigned shell.

## Impact

- Affected frontend files: app shell/layout components, current `App.tsx`, sidebar UI primitives, route/workspace rendering, and tests covering layout/navigation.
- Possible dependency impact: add shadcn sidebar support and its required primitives if not already present.
- Existing custom `ui/sidebar.tsx` may be replaced or substantially refactored to align with shadcn sidebar primitives.
- No backend API changes, GraphQL schema changes, or database changes.
