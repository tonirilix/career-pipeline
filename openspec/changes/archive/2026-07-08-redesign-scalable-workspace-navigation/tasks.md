## 1. Shell Primitives

- [x] 1.1 Add shadcn sidebar primitives and any required dependencies to the web app.
- [x] 1.2 Replace or refactor the existing custom `ui/sidebar.tsx` so app shell code can use shadcn-style sidebar primitives.
- [x] 1.3 Create a global app sidebar component with app identity and route-backed Pipeline, Memory, and Roles navigation.
- [x] 1.4 Create an app shell layout using the sidebar provider, global sidebar, sidebar inset, mobile navigation trigger, and main content outlet.

## 2. Workspace Shell

- [x] 2.1 Create a reusable workspace shell/header component for route title, primary action area, local tools, and main content.
- [x] 2.2 Render Pipeline, Memory, Roles, and not-found content through the workspace shell.
- [x] 2.3 Preserve route-backed active states and browser navigation for `/pipeline`, `/memory`, and `/roles`.

## 3. Pipeline Workspace Relocation

- [x] 3.1 Move Add opportunity from global navigation into the Pipeline workspace action area.
- [x] 3.2 Move application stats from global navigation into compact Pipeline workspace stats.
- [x] 3.3 Move pipeline search/filter/sort controls from global navigation into a compact Pipeline toolbar.
- [x] 3.4 Move follow-up work from global navigation into secondary Pipeline workspace content that does not permanently reduce board width.
- [x] 3.5 Preserve the opportunity form slide-over, application details slide-over, funnel chart, and pipeline board behavior.

## 4. Responsive Behavior

- [x] 4.1 Verify desktop global navigation remains available without consuming route-local tool space and Pipeline filters remain compact.
- [x] 4.2 Verify mobile global navigation opens from an accessible trigger and closes after route navigation.
- [x] 4.3 Verify Memory and Roles do not render pipeline-only controls or persistent pipeline tool columns.

## 5. Tests and Verification

- [x] 5.1 Update shell/navigation tests for shadcn sidebar structure and active route state.
- [x] 5.2 Update pipeline tests to assert Add opportunity, stats, controls, and follow-up work are local to `/pipeline`.
- [x] 5.3 Add or update Memory and Roles tests to assert pipeline-only controls are absent.
- [x] 5.4 Run `npm test --workspace apps/web`.
- [x] 5.5 Run `npm run build --workspace apps/web`.
- [x] 5.6 Smoke-test `/pipeline`, `/memory`, and `/roles` in the browser or via the running dev server.
