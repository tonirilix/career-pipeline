## 1. Router Setup

- [x] 1.1 Add `@tanstack/react-router` to the web app dependencies.
- [x] 1.2 Create a code-based route configuration for `/`, `/pipeline`, `/memory`, `/roles`, and unsupported routes.
- [x] 1.3 Wrap the React app with TanStack Router while preserving the existing `QueryClientProvider` and gateway injection.

## 2. Workspace Route Rendering

- [x] 2.1 Refactor the persistent app shell so route content controls which workspace body renders.
- [x] 2.2 Render the pipeline workspace at `/pipeline` and when entering from `/`.
- [x] 2.3 Render the candidate memory workspace at `/memory`.
- [x] 2.4 Render the role discovery workspace at `/roles`.
- [x] 2.5 Render a safe not-found state or redirect for unsupported client routes without marking a workspace navigation item active.

## 3. Sidebar Navigation

- [x] 3.1 Replace local `activeWorkspace` state with route-derived active state.
- [x] 3.2 Update Pipeline, Memory, and Roles navigation actions to navigate through TanStack Router.
- [x] 3.3 Preserve the existing sidebar layout, mobile drawer behavior, stats, pipeline controls, follow-up panels, and add-opportunity slide-over.

## 4. Tests and Verification

- [x] 4.1 Add or update frontend tests for direct `/pipeline`, `/memory`, and `/roles` rendering.
- [x] 4.2 Add or update tests for sidebar navigation changing the browser location and active item.
- [x] 4.3 Add or update tests for root route behavior and unsupported-route handling.
- [x] 4.4 Run `npm test --workspace apps/web` or the repo-equivalent frontend test command.
- [x] 4.5 Run the web build/typecheck command and confirm routed paths still build for production.
