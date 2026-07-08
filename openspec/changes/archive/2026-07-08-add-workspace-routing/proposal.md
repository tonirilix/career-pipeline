## Why

The app has three top-level workspaces, but the active workspace is stored only in React state. Refreshing the page, sharing a URL, or opening a workspace directly always falls back to the default pipeline screen.

Adding routing now gives each workspace a durable URL while the navigation surface is still small, and creates a foundation for future deep links such as application details or role records.

## What Changes

- Add client-side routing for the existing top-level workspaces.
- Map `/pipeline`, `/memory`, and `/roles` to the pipeline board, candidate memory, and role discovery screens.
- Treat `/` as an entry route that lands on the pipeline workspace.
- Replace local workspace-selection state with route-derived state and route navigation.
- Preserve the current application shell, sidebar navigation, mobile drawer behavior, lazy-loaded workspace bodies, and slide-over workflows.
- Add tests that cover direct route rendering, navigation between workspaces, and refresh-safe route state.

## Capabilities

### New Capabilities
- `workspace-routing`: Defines URL-addressable top-level workspaces and route-backed navigation behavior.

### Modified Capabilities
- `pipeline-layout`: Sidebar workspace navigation SHALL reflect and change the active route instead of local-only UI state.

## Impact

- Affected frontend files: `apps/web/src/main.tsx`, `apps/web/src/presentation/App.tsx`, route configuration/components under `apps/web/src`, and frontend tests.
- New dependency: TanStack Router for React, with optional TanStack Router Vite plugin if file-based routing is selected during implementation.
- Existing nginx SPA fallback already supports direct browser requests to routed paths.
- No backend API changes and no database changes.
