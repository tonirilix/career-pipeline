## 1. Install and configure Tailwind CSS v4

- [x] 1.1 Add `tailwindcss` and `@tailwindcss/vite` to `apps/web` devDependencies
- [x] 1.2 Register `@tailwindcss/vite` plugin in `apps/web/vite.config.ts`
- [x] 1.3 Create `apps/web/src/index.css` with `@import "tailwindcss"` directive
- [x] 1.4 Update `apps/web/src/main.tsx` to import `./index.css` instead of any existing global CSS
- [x] 1.5 Verify `npm run build` succeeds and the output bundle includes Tailwind utility classes

## 2. Install and initialise shadcn/ui

- [x] 2.1 Run `npx shadcn@latest init` in `apps/web` — configure CSS variables, TypeScript paths, and `components.json`
- [x] 2.2 Add `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-react` to dependencies
- [x] 2.3 Add required Radix UI peer packages (auto-installed by shadcn init)
- [x] 2.4 Confirm `src/presentation/components/ui/` directory is created with base utilities (`cn` helper)

## 3. Add shadcn/ui primitive components

- [x] 3.1 Add `Button` primitive (`npx shadcn@latest add button`)
- [x] 3.2 Add `Input` primitive (`npx shadcn@latest add input`)
- [x] 3.3 Add `Select` primitive (`npx shadcn@latest add select`)
- [x] 3.4 Add `Textarea` primitive (`npx shadcn@latest add textarea`)
- [x] 3.5 Add `Badge` primitive for status pills (`npx shadcn@latest add badge`)
- [x] 3.6 Add `Card` primitive for stage columns and panels (`npx shadcn@latest add card`)

## 4. Define brand design tokens

- [x] 4.1 Map brand colors to Tailwind/shadcn CSS variable names in `tailwind.config.ts` or `index.css` `@layer base`: `primary` (#24735f), `primary-foreground` (#ffffff), `muted` (#f4f6f8), `muted-foreground` (#5d6673), `destructive` (#b42318), `border` (#d7dde4)
- [x] 4.2 Verify the primary button background renders as #24735f in the browser

## 5. Extract OpportunityForm component

- [x] 5.1 Create `src/presentation/components/OpportunityForm.tsx`
- [x] 5.2 Move the `<section aria-label="New saved opportunity">` JSX from `App.tsx` into the new component
- [x] 5.3 Replace bare `<input>`, `<select>`, `<button>` elements with `Input`, `Select`, `Button` shadcn/ui primitives
- [x] 5.4 Apply Tailwind utility classes for layout and spacing (replacing `.entry-panel`, `.form-grid`, `.form-actions` class names)
- [x] 5.5 Wire props: `form`, `fieldErrors`, `commandError`, `onSubmit`, `onCancel`, `onChange`

## 6. Extract PipelineControls component

- [x] 6.1 Create `src/presentation/components/PipelineControls.tsx`
- [x] 6.2 Move the `<section aria-label="Pipeline controls">` JSX from `App.tsx`
- [x] 6.3 Replace bare selects and input with `Select` and `Input` shadcn/ui primitives
- [x] 6.4 Apply Tailwind utility classes (replacing `.pipeline-controls` styles)
- [x] 6.5 Wire props from `usePipelineControls()` output

## 7. Extract FollowUpWork component

- [x] 7.1 Create `src/presentation/components/FollowUpWork.tsx`
- [x] 7.2 Move `FollowUpWork` and `FollowUpWorkList` from `App.tsx`
- [x] 7.3 Replace bare buttons with `Button` variant="outline"
- [x] 7.4 Apply Tailwind utility classes (replacing `.follow-up-work`, `.follow-up-work-list` styles)

## 8. Extract ApplicationCard component

- [x] 8.1 Create `src/presentation/components/ApplicationCard.tsx`
- [x] 8.2 Move `ApplicationCard` from `App.tsx`
- [x] 8.3 Wrap card in shadcn/ui `Card` / `CardContent`
- [x] 8.4 Replace `<span className="status-pill">` with `Badge` variant="destructive"
- [x] 8.5 Replace bare buttons with `Button` primitives
- [x] 8.6 Apply Tailwind utility classes (replacing `.opportunity-card`, `.card-action`, `.stage-update` styles)

## 9. Extract PipelineBoard component

- [x] 9.1 Create `src/presentation/components/PipelineBoard.tsx`
- [x] 9.2 Move the `<section aria-label="Application pipeline">` JSX and stage-column rendering from `App.tsx`
- [x] 9.3 Use shadcn/ui `Card` for each stage column
- [x] 9.4 Apply Tailwind utility classes (replacing `.pipeline-board`, `.stage-column`, `.opportunity-list` styles)

## 10. Extract ApplicationDetails component

- [x] 10.1 Create `src/presentation/components/ApplicationDetails.tsx`
- [x] 10.2 Move the `<aside aria-label="Application details">` JSX and all sub-forms from `App.tsx`
- [x] 10.3 Replace bare inputs, selects, textareas, and buttons with shadcn/ui primitives throughout
- [x] 10.4 Apply Tailwind utility classes (replacing `.detail-panel`, `.detail-grid`, `.note-form`, `.follow-up-form`, `.interview-form`, `.timeline-list` styles)

## 11. Clean up App.tsx and remove App.css

- [x] 11.1 Update `App.tsx` to import and use all six extracted components
- [x] 11.2 Remove all remaining inline CSS class name references from `App.tsx`
- [x] 11.3 Delete `apps/web/src/presentation/App.css`
- [x] 11.4 Ensure `App.tsx` no longer imports `./App.css`

## 12. Verify tests and build

- [x] 12.1 Run `npm run test` — confirm all tests in `App.test.tsx` pass (update any broken selectors, do not change aria-labels)
- [x] 12.2 Run `npm run test` — confirm `architecture.test.ts` passes with no boundary violations
- [x] 12.3 Run `npm run build` — confirm production build completes without TypeScript or Tailwind errors
- [x] 12.4 Run `npm run dev` and visually verify the pipeline board, detail panel, and forms render correctly
