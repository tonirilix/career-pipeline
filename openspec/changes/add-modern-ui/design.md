## Context

The web app (`apps/web`) is a React 19 + Vite + TypeScript workspace following hexagonal architecture. All UI lives in `src/presentation/`, with a single monolithic `App.tsx` (~1 100 lines) and a hand-rolled `App.css` (~575 lines). There are no shared primitive components; every element is styled via CSS class names.

The domain, application, and infrastructure layers are completely decoupled from the presentation layer through ports (`JobApplicationGateway`, `UsePipelineControls`). This means we can rewrite the entire presentation layer without touching business logic.

Existing tests: `App.test.tsx` exercises the full component via `@testing-library/react` and uses aria-labels for queries; `architecture.test.ts` enforces layer boundaries.

## Goals / Non-Goals

**Goals:**
- Integrate Tailwind CSS v4 as the sole styling mechanism for the presentation layer
- Install shadcn/ui primitives (Button, Input, Select, Textarea, Badge, Card) to replace raw HTML form elements
- Decompose `App.tsx` into six focused presentational components (see proposal)
- Preserve all existing behaviour and accessibility landmarks (aria-labels, roles)
- All existing tests pass after the migration

**Non-Goals:**
- Changing any domain, application, infrastructure, or port code
- Adding new user-facing features (new capabilities beyond `design-system`)
- Dark mode (can follow in a separate change)
- Animations or transitions beyond what shadcn/ui ships by default
- Server-side rendering or streaming

## Decisions

### D1 — Tailwind CSS v4 via `@tailwindcss/vite`

Tailwind v4 uses a Vite plugin (`@tailwindcss/vite`) rather than a PostCSS config. This is the recommended path for new Vite projects and avoids PostCSS config overhead.

**Alternatives considered:**
- Tailwind v3 + PostCSS — stable but requires more config boilerplate and won't benefit from v4's CSS-native features
- CSS Modules — no shared design tokens; harder to co-locate styles with JSX

### D2 — shadcn/ui (Radix UI + CVA) rather than a packaged component library

shadcn/ui copies component source into the project (`src/presentation/components/ui/`). Components are owned by the project, which means no runtime dependency version lock-in and full control over styling. Radix UI primitives handle accessibility (focus management, keyboard nav, ARIA) for free.

**Alternatives considered:**
- Headless UI — fewer components, no CLI scaffolding
- MUI / Chakra — opinionated styling that conflicts with Tailwind utility-first model and adds significant bundle weight

### D3 — Component decomposition strategy

`App.tsx` mixes orchestration logic (event handlers, derived state) with rendering. The decomposition keeps all state and handlers in `App.tsx` and extracts purely presentational sub-components into `src/presentation/components/`. Each component receives data and callbacks via props — no new global state.

Components to extract:
| Component | Props summary |
|---|---|
| `OpportunityForm` | `form`, `fieldErrors`, `commandError`, `onSubmit`, `onCancel` |
| `PipelineControls` | filter/sort values + setters from `usePipelineControls` |
| `FollowUpWork` | `overdueItems`, `upcomingItems`, `onCompleteFollowUp` |
| `PipelineBoard` | `applications`, `onStageChange`, `onViewDetails` |
| `ApplicationCard` | `application`, `onStageChange`, `onViewDetails` |
| `ApplicationDetails` | `application`, `onAddNote`, `onCreateFollowUp`, `onScheduleInterview` |

### D4 — Replace `App.css` entirely

All styles migrate to Tailwind utility classes inline in JSX. `App.css` is deleted; only the Tailwind `@import "tailwindcss"` directive remains in a new `src/index.css` (or inlined in `main.tsx`).

### D5 — Design token definition via CSS variables in `tailwind.config`

Brand colors (green `#24735f`, slate greys, error reds) are mapped to Tailwind theme tokens (`primary`, `muted`, `destructive`) using `tailwind.config.ts` `extend.colors`. shadcn/ui's default CSS variable approach aligns with this.

## Risks / Trade-offs

- **Test selector breakage** → `App.test.tsx` queries by aria-label and role, which should survive component decomposition as long as aria-labels are preserved. Verify each test file after migration. If selectors break, update queries (not the aria-labels).
- **Bundle size increase** → Radix UI primitives and Lucide icons add ~30–50 kB gzip. Acceptable for a developer-tool app; tree-shaking handles unused icons.
- **Tailwind v4 API churn** → v4 is stable as of 2025; `@tailwindcss/vite` is the official integration. Pin to a minor version in `package.json`.
- **shadcn/ui component ownership** → Copied components must be manually updated when upstream patches accessibility bugs. Low frequency concern for a small project.
- **Large single-commit diff** → The migration touches nearly every file in `src/presentation/`. Use feature-branch PR and review component by component.

## Migration Plan

1. Install `tailwindcss`, `@tailwindcss/vite` — update `vite.config.ts`
2. Run `npx shadcn@latest init` — sets up `components.json`, CSS variables, `tailwind.config.ts`
3. Add required shadcn/ui primitives: `button`, `input`, `select`, `textarea`, `badge`, `card`
4. Extract each presentational component one at a time, replacing CSS classes with Tailwind utilities as each component is moved
5. Delete `App.css` once all classes have been migrated
6. Run full test suite; fix any broken selectors

**Rollback:** The entire change is confined to the `presentation/` layer and package.json. Revert the branch; no data migrations.

## Open Questions

- Should `ApplicationDetails` be rendered as a drawer/modal overlay using Radix `Sheet`/`Dialog` instead of an inline `<aside>`? The current layout appends it below the board, which can be confusing on wide screens. Leaving as-is for now; can be addressed in a follow-up.
- Tailwind v4 drops `tailwind.config.js` in favour of CSS `@theme` blocks — confirm whether `shadcn init` supports this or falls back to `tailwind.config.ts`.
