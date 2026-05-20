## Why

The current UI is built with hand-rolled CSS classes in a single large `App.css` file, which makes it hard to iterate on visual quality and maintain consistency across the growing component surface. Adopting a utility-first CSS framework (Tailwind CSS) and a headless component library (shadcn/ui) will give the app a polished, production-ready look while enforcing a design system that scales as features are added.

## What Changes

- Install and configure **Tailwind CSS v4** in the Vite-based `apps/web` workspace
- Install **shadcn/ui** and its peer dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`)
- Replace `App.css` custom styles with Tailwind utility classes applied directly in JSX
- Decompose the monolithic `App.tsx` into focused presentational components under `src/presentation/components/`:
  - `PipelineBoard` – Kanban-style stage columns
  - `ApplicationCard` – individual opportunity card with stage controls
  - `ApplicationDetails` – side-panel with notes, follow-ups, interviews, timeline
  - `FollowUpWork` – overdue/upcoming follow-up sections
  - `OpportunityForm` – "Add opportunity" entry panel
  - `PipelineControls` – filter, sort, and search controls
- Replace raw `<button>`, `<input>`, `<select>`, and `<textarea>` elements with shadcn/ui `Button`, `Input`, `Select`, and `Textarea` primitives
- Keep all application logic, domain models, ports, and adapters completely untouched

## Capabilities

### New Capabilities
- `design-system`: Tailwind CSS + shadcn/ui token layer — global theme (colors, spacing, radii, typography) defined once and consumed by all components

### Modified Capabilities
- none

## Impact

- **Files changed**: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, `apps/web/src/presentation/App.tsx`, `apps/web/src/presentation/App.css` (replaced), new component files under `src/presentation/components/`
- **New dependencies**: `tailwindcss`, `@tailwindcss/vite`, `shadcn/ui` CLI, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/*` primitives
- **No breaking changes** to domain, application layer, ports, or adapters
- Existing architecture tests in `architecture.test.ts` must continue to pass
- Existing component tests in `App.test.tsx` may need selector updates if aria-labels or element structure changes
