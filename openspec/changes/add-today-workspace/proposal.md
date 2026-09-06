## Why

The application's entry point is a data view. `/` renders Pipeline: every application, with filters, sorting, and saved views, leaving the user to work out what actually needs doing. Navigation compounds this — the global rail is icon-only and collapsed by default, so the three destinations are unlabelled glyphs carrying no indication of whether anything inside them needs attention, and a second navigation level exists on exactly one screen.

The reference design ("Direction A · Dark") answers this by making the entry point a derived action queue and by making every destination a labelled, counted target. That is the change worth making: not a restyle, but moving the first question the app answers from "here is your data" to "here is what needs you today".

Crucially, this is affordable now. Roughly the whole of the Today screen is deterministic derivation over data the domain already holds — follow-up due dates, interview schedules, stage, and timeline. `projectJobApplications` already computes overdue and upcoming follow-up items from the *unfiltered* application list, which is precisely what a Today view needs.

## What Changes

- Add a Today workspace at the application index: a derived action queue grouped into **Now** (overdue or due within three days), **This week**, and a collapsed **Waiting** section for items with nothing to do until a reply or a date arrives.
- Today rows carry a type chip (Follow-up, Prep, Approval, Offer, Triage), the action and its subject, a computed rationale line, a due indicator where the item has a genuine target date, and a single primary action.
- Add an inspector panel: an inline detail pane that **displaces** the list rather than overlaying it, so the list stays readable and keyboard navigable while it is open. This is deliberately not the existing `SlideOver`.
- **BREAKING (route)**: `/` moves from Pipeline to Today. `/pipeline` remains the canonical Pipeline route and is unchanged.
- Replace the icon-first collapsed rail with a fixed labelled rail carrying live counts per destination and a marker on the active item. On mobile, replace the trigger-and-drawer pattern with a bottom tab bar.
- Add global workspace keyboard chords and roving keyboard selection within the Today list.
- Add a Today navigation command to the command palette.

Explicitly out of scope, to keep the migration gradual: Pipeline keeps its board, filters, saved-views sidebar, and `SlideOver` details panel untouched. Memory and Roles are untouched. The reference design's full "record" screen is not built — Pipeline's existing slide-over stands in for it.

Also out of scope because the domain has no basis for it: fit scores, AI-generated drafts with an approval lifecycle, confidence indicators, evidence source chips, and snooze/dismiss. The rationale line on each row is arithmetic over existing data and SHALL NOT be presented as AI-generated.

Only Follow-up and Prep rows carry a due indicator, from a reminder's due date and an interview's scheduled date. Approval and Triage have no target date — the reference design gives them none either — and Offer joins them, because the domain has no offer deadline field. No item substitutes elapsed time for a deadline.

## Capabilities

### New Capabilities

- `today-workspace`: the derived action queue — grouping rules, row anatomy, the stage summary strip, roving keyboard selection, and loading/empty states.
- `inspector-panel`: an inline, non-modal detail pane that displaces main content, holds no focus trap, and does not lock body scroll.
- `keyboard-navigation`: global workspace chords and the escape contract for transient surfaces.

### Modified Capabilities

- `workspace-routing`: `/today` is added and the root route enters Today rather than Pipeline.
- `responsive-sidebar`: the desktop rail becomes labelled and count-bearing rather than icon-first and collapsible; mobile navigation becomes a persistent bottom tab bar rather than a trigger-controlled drawer overlay.
- `command-surface`: the palette's workspace navigation commands include Today.

## Impact

- `apps/web/src/presentation/router.tsx` — new `/today` route; root route target changes; each route gains its own component.
- `apps/web/src/presentation/App.tsx` — currently a 307-line component that re-derives the active workspace from `pathname` through a four-branch ternary. Decomposed into per-route components as an enabling step before Today is added.
- `apps/web/src/presentation/components/AppSidebar.tsx` and `ui/sidebar.tsx` — labelled rail, counts, active marker, mobile bottom tabs.
- New: a Today derivation module alongside `jobApplicationProjections.ts`, a `TodayWorkspace` component, and an `InspectorPanel` UI primitive.
- Navigation counts require application data at shell level. `usePipelineWorkspace` is already called unconditionally in `App`, so the data is present; the derivation must read the unfiltered application list rather than `visibleApplications`.
- The rail's Roles count requires roles data at shell level, which does not exist today — `useRoleDiscovery` is called only inside the `lazy()`-imported `RoleDiscoveryWorkspace`. One narrow count query is added to the shell, shared by the rail count and the Today Triage row.
- Depends on `retune-design-system-scale` for the token scales it is specified against.
- No domain, application-port, or infrastructure changes. Today is derived at read time and stores nothing.
