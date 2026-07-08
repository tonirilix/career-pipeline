## Context

The app now has route-backed top-level workspaces: Pipeline, Memory, and Roles. The existing app shell still uses a fixed left sidebar originally designed for the pipeline-only experience. That sidebar contains app identity, route navigation, Add opportunity, stats, pipeline filters, and follow-up work.

This creates two problems:
- Non-pipeline routes inherit pipeline-only controls, reducing available content space and confusing the page purpose.
- The three route buttons are squeezed into a dense row inside a narrow sidebar, which will not scale to more sections.

The app already uses shadcn-style local UI primitives and Tailwind CSS. shadcn's sidebar component provides a composable app navigation foundation with provider-managed open/collapsed state, grouped menus, active menu buttons, mobile behavior, and an inset layout.

## Goals / Non-Goals

**Goals:**
- Separate global workspace navigation from workspace-specific controls.
- Use a scalable navigation pattern that can add more top-level sections without crowding.
- Give Memory and Roles more usable content width.
- Move pipeline-specific actions, stats, filters, and follow-up work into the Pipeline workspace.
- Use shadcn sidebar primitives as the structural base for global navigation.
- Preserve existing route URLs and core workflows.

**Non-Goals:**
- Do not redesign the detailed contents of Candidate Memory or Role Discovery beyond fitting them into the new workspace shell.
- Do not introduce new top-level workspaces.
- Do not route application details or role details in this change.
- Do not change backend APIs or data models.
- Do not add command palette/search unless it is needed as a small shell affordance for the new layout.

## Decisions

### D1 - Adopt shadcn sidebar primitives for global navigation

Replace the current custom `Sidebar` usage with a shell based on shadcn sidebar primitives: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarMenu`, `SidebarMenuButton`, `SidebarRail`, `SidebarTrigger`, and `SidebarInset`.

Why: The needed behavior is app-shell behavior, not domain-specific UI. shadcn's sidebar gives a maintained, accessible, composable foundation while still keeping source code in the project for customization.

Alternative considered: Keep the current custom sidebar and manually add collapse/mobile/menu primitives. This would keep the dependency surface small but would recreate a complex component that shadcn already models well.

Alternative considered: Use a top navigation bar only. This maximizes width, but top nav can become crowded as sections grow and provides less room for future grouped navigation.

### D2 - Keep global navigation minimal

The global sidebar SHALL contain app identity and route navigation only, with optional low-frequency app-level items such as settings later. It SHALL NOT contain pipeline filters, pipeline stats, follow-up work, or route-local primary actions.

Why: A global shell must remain valid on every route. Controls that only make sense for Pipeline make Memory and Roles feel secondary.

Alternative considered: Make the sidebar content conditional per route. That keeps the left column familiar, but it turns global navigation into a changing tool panel and still consumes route content space.

### D3 - Introduce a reusable workspace shell

Each route SHALL render inside a workspace shell with:
- title and optional description
- primary action area
- local summary/status area
- local filters/tools area
- main content region

Why: Pipeline, Memory, and Roles each need different controls. A shared page structure keeps the app coherent while letting each workspace own its tools.

Alternative considered: Inline ad hoc headers in each route. This is simpler initially but risks three inconsistent page layouts.

### D4 - Move pipeline work into the Pipeline workspace

Pipeline-specific elements move from the global sidebar into the Pipeline workspace:
- Add opportunity
- compact stats chips
- a compact search/filter/sort toolbar
- secondary follow-up work

The funnel chart and board remain main Pipeline content. Pipeline filters SHALL NOT become a large vertical block that competes with the board; they should fit in a dense toolbar near the Pipeline header on desktop and wrap compactly on smaller screens. Follow-up work SHALL be reachable from the Pipeline workspace without becoming a permanent sidebar or a dominant above-board panel.

Why: These controls are meaningful only when managing applications. Moving them out of the app shell gives other routes more space and makes the Pipeline route self-contained.

Alternative considered: Keep Add opportunity global because it is important. That action creates a pipeline opportunity, so it should be prominent on Pipeline and absent elsewhere unless a future global create menu intentionally supports multiple creation types.

### D5 - Preserve route-backed navigation

The redesigned navigation SHALL continue using `/pipeline`, `/memory`, and `/roles` routes and browser history behavior.

Why: The routing change solved refresh/share/direct-entry behavior and should remain stable through layout changes.

## Risks / Trade-offs

- [Risk] shadcn sidebar introduces many primitives and a larger local component file. -> Mitigation: treat it as app-shell infrastructure and avoid over-customizing during first adoption.
- [Risk] Moving pipeline controls can make existing tests fail broadly. -> Mitigation: update tests around user-visible behavior and add focused shell/navigation tests.
- [Risk] Pipeline workspace may become too dense after receiving stats, filters, and follow-up work. -> Mitigation: keep stats as compact chips, render filters as a single responsive toolbar, and keep follow-up work as a secondary compact strip rather than a permanent tool column.
- [Risk] Mobile behavior can regress when replacing the custom drawer. -> Mitigation: verify mobile trigger, off-canvas navigation, and route changes in tests or browser smoke checks.
- [Risk] A collapsible icon sidebar may hide labels too aggressively for early users. -> Mitigation: default to expanded desktop sidebar, with icon collapse available but not forced.

## Migration Plan

1. Add or generate shadcn sidebar primitives into the local UI component set.
2. Create an app shell that wraps route content with `SidebarProvider` and `SidebarInset`.
3. Replace current global sidebar content with app identity and workspace route navigation.
4. Create a reusable workspace shell/header component.
5. Move Add opportunity, compact stats, a compact filter toolbar, and secondary follow-up work into the Pipeline workspace.
6. Keep Candidate Memory and Role Discovery route content functionally unchanged inside the new workspace shell.
7. Update tests for global navigation, route active state, pipeline-local controls, and mobile access.

Rollback is possible by restoring the prior `App.tsx` shell and custom `Sidebar` usage, but the intended migration should be reviewable in small component-level steps.

## Open Questions

- Should desktop sidebar collapse be user-toggleable immediately, or should the first pass default to expanded with the rail available?
- Should mobile use shadcn's off-canvas sidebar trigger or a bottom navigation pattern? The shadcn trigger is the lower-risk first pass.
- Should Follow-up Work eventually become a drawer/sheet if the compact strip still feels too tall with real data?
