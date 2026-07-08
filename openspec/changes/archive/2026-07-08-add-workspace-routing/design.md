## Context

The web app is a React/Vite SPA. `App.tsx` owns the application shell and currently tracks the selected top-level workspace with local React state. The sidebar buttons switch among pipeline, candidate memory, and role discovery, but the browser URL does not change, so reloads and shared links cannot preserve a specific workspace.

The production web image already serves the Vite bundle through nginx with an SPA fallback to `index.html`, so direct browser requests to client routes are supported at the hosting layer.

## Goals / Non-Goals

**Goals:**
- Make the three existing top-level workspaces URL-addressable.
- Use route state as the source of truth for the active workspace.
- Preserve the current shell, sidebar controls, lazy-loaded workspace components, and slide-over workflows.
- Keep the first routing pass small enough to validate with focused component/integration tests.

**Non-Goals:**
- Do not redesign the sidebar or workspace layouts.
- Do not introduce route-backed application detail, role detail, or modal URLs yet.
- Do not move data fetching into route loaders in this change.
- Do not change backend APIs, GraphQL schema, or persistence.

## Decisions

### D1 - Use TanStack Router for client routing

Add `@tanstack/react-router` and wrap the app in a router provider. Define routes for `/`, `/pipeline`, `/memory`, and `/roles`.

Why: TanStack Router gives type-safe navigation and search-parameter handling, which fits the existing TypeScript and TanStack Query stack. It also leaves room for route context and validated search state when filters or detail views become URL-addressable later.

Alternative considered: React Router. It is mature and would solve the immediate reload problem, but it does not align as closely with the existing TanStack ecosystem or the future typed route/search-state direction.

Alternative considered: `localStorage` persistence. It would preserve the last selected workspace on refresh, but would not provide shareable URLs, browser history behavior, or direct navigation.

### D2 - Start with code-based routes

Define the initial route tree in code rather than introducing file-based routing and generated route-tree files immediately.

Why: The app only needs four routes for this change, and the workspace components already live under `src/presentation`. Code-based routing avoids generated-file workflow decisions and keeps the migration easier to review.

Alternative considered: TanStack Router file-based routing via `@tanstack/router-plugin`. This is attractive once the route tree grows, but it adds Vite plugin configuration and generated route output before the app needs that structure.

### D3 - Keep data fetching in existing hooks

Do not move TanStack Query calls into route loaders during this change. Routes choose which workspace component to render; existing hooks continue owning query behavior.

Why: This change is about durable navigation state. Moving data loading at the same time would increase blast radius and obscure whether routing itself works.

Alternative considered: Route loaders prefetch workspace data. That may be useful later for detail routes or explicit pending states, but it is unnecessary for top-level workspace persistence.

### D4 - Keep `/` as the pipeline entry point

The root path SHALL land on the pipeline workspace, either by redirecting to `/pipeline` or by rendering the same route content while canonical navigation points to `/pipeline`.

Why: The pipeline remains the primary workspace and the current default screen. Existing users and smoke tests that open the app root should continue to land on a useful screen.

Alternative considered: Make `/` a standalone dashboard. That is a product decision outside this change.

## Risks / Trade-offs

- [Risk] Adding a router can make existing App tests more cumbersome. -> Mitigation: provide a test render helper that creates a memory/history router at a requested initial route.
- [Risk] Lazy-loaded workspace components may render with empty Suspense fallbacks during route changes. -> Mitigation: preserve current lazy loading first, then only improve pending UI if tests or UX expose a gap.
- [Risk] Introducing route state may conflict with mobile drawer behavior. -> Mitigation: keep drawer open/close as local UI state and verify workspace navigation still works from the sidebar.
- [Risk] Future route-backed details could be harder if shell and route content remain tightly coupled. -> Mitigation: separate the persistent shell from route body selection during this migration.

## Migration Plan

1. Add TanStack Router dependency and route configuration.
2. Wrap the app with the router provider while preserving the existing QueryClientProvider.
3. Replace workspace buttons with route navigation links/buttons that reflect the active route.
4. Move workspace body selection from local state to route content.
5. Add tests for direct `/pipeline`, `/memory`, and `/roles` entry and navigation among them.
6. Run frontend tests and build checks.

Rollback is straightforward: remove the router provider/configuration and restore the local `activeWorkspace` state and button handlers.

## Open Questions

- Should `/` redirect to `/pipeline` or render pipeline content without changing the URL? The implementation can choose, but `/pipeline` should be the canonical shareable route.
- Should pipeline filters eventually move into URL search params? This change leaves them in the existing Zustand controls store.
