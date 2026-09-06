## Context

`apps/web/src/presentation/router.tsx` declares four routes (`/`, `/pipeline`, `/memory`, `/roles`) but gives none of them a component. All four render `<App/>`, which re-derives the active workspace from `pathname` via `workspaceFromPathname` and then selects content through a four-branch ternary. `App.tsx` is 307 lines and additionally owns the sidebar provider, the secondary sidebar, two `SlideOver` instances, the command palette, and the ⌘K key handler.

Global navigation is `AppSidebar`, mounted inside `<SidebarProvider defaultCollapsed>` — an icon-first rail with three hardcoded items and no counts. On mobile it hides behind a trigger and opens as a drawer overlay.

Detail views go through `SlideOver`, whose capability contract explicitly requires overlaying main content and trapping focus. Both properties are correct for its current uses and wrong for the panel this change needs.

Data already available: `projectJobApplications` computes `overdueFollowUpItems` and `upcomingFollowUpItems` from the unfiltered application list, alongside `visibleApplications` (which *is* filtered). `JobApplication` carries `stage`, `timeline`, `interviews` (with `scheduledAt` and `outcome`), `followUps` (with `dueAt`, `note`, `completedAt`), and `notes`.

Data not available, and deliberately not added here: an `appliedAt` field, an offer deadline, fit scores, generated artifacts, and any notion of snoozing or dismissing.

## Goals / Non-Goals

**Goals:**
- Make the entry point a derived action queue rather than a data view.
- Make every navigation destination labelled, counted, and continuously visible on both desktop and mobile.
- Introduce a detail surface that supports triage — moving quickly through a list without losing it.
- Leave Pipeline, Memory, and Roles functionally untouched so the migration can continue gradually.
- Build only what existing domain data supports, and be honest in the UI about what is computed.

**Non-Goals:**
- Not building the reference design's separate full "record" screen. Pipeline's `SlideOver` stands in.
- Not restyling Pipeline, Memory, or Roles.
- Not implementing the AI layer: fit scores, drafts with approval lifecycles, confidence, evidence chips.
- Not adding snooze or dismiss. Both need persistence this change does not introduce.
- Not adding a Profile workspace. The reference design has one; Memory stays as it is for now.

## Decisions

### Decompose routes into components before adding Today

Each route gets its own component, and `App` becomes the shell. Adding Today to the current structure would mean a fifth ternary branch in a component that is already doing too much, and the Today workspace needs its own data derivation, its own keyboard handling, and its own panel — none of which belong in a shared shell.

This is sequenced first because every later task is cheaper afterwards, and because it is mechanically verifiable: the same screens render at the same routes, with no visual change.

*Alternative considered:* adding Today as a fifth branch and decomposing later. Rejected — "later" would arrive with more coupling, not less.

### The inspector is a new primitive, not a `SlideOver` variant

`slide-over-panel` requires overlaying main content and trapping focus. The inspector requires the negation of both: it displaces content, and it must leave focus free so list keys keep working while it is open. Adding a `modal={false}` escape hatch to `SlideOver` would leave one component with two contradictory accessibility contracts, and the modal one is correct for its existing users.

Two primitives with clear separate contracts is the cheaper outcome. `SlideOver` keeps its focus trap and scroll lock for the opportunity form and Pipeline details; `InspectorPanel` has neither.

*Alternative considered:* a `variant` prop on `SlideOver`. Rejected — the variants differ in their accessibility contract, not their appearance.

### Today does not use `WorkspaceShell`

This was the drafting question, and the answer is no. `WorkspaceShell` renders a "Workspace" eyebrow, a title, a description, and optional actions, summary, and tools slots, wrapped in `space-y-5` with a bottom border. Today's header is a different composition: date-stamped summary line, no eyebrow, no description, and a strip of interactive stage counts that navigate elsewhere.

Forcing Today through `WorkspaceShell` would mean passing the stage strip as `summary` and suppressing the eyebrow — configuring a component into not being itself. Today renders its own header.

`WorkspaceShell` remains correct and unchanged for Pipeline, Memory, and Roles.

*Alternative considered:* extending `WorkspaceShell` with an `eyebrow={false}` and a header variant. Rejected — same objection as the `SlideOver` variant.

### Keyboard work splits by ownership, not by mechanism

Global chords (`g t` / `g r` / `g p`) and the Escape ordering go into a new `keyboard-navigation` capability. Roving selection (`j` / `k` / `Enter`) stays in `today-workspace`, because it is a property of that list rather than a global binding.

`command-surface` was the other candidate for the chords, but its stated purpose is a *single* keyboard- and UI-accessible surface — the palette. Chords are a second surface. Stretching that capability to cover them would make its purpose statement untrue. `command-surface` changes only to gain a Today navigation command.

*Alternative considered:* putting everything in `command-surface`. Rejected for the reason above.

### Derivation lives beside the existing projections and reads unfiltered data

The Today derivation is a pure function over the application list, placed alongside `jobApplicationProjections.ts`. It reads the raw list, never `visibleApplications` — Pipeline's filters must not silently empty the user's day.

Grouping is by due proximity: overdue or within three days is Now; the rest of the week, plus anything awaiting the user's review, is This week; anything with no available action until a reply or date arrives is Waiting.

### Row types map onto what the domain can actually express

| Type | Derived from |
|---|---|
| Follow-up | An incomplete `FollowUpReminder` with a `dueAt` |
| Prep | An `Interview` with a future `scheduledAt` |
| Approval | An application in `Saved` stage awaiting submission |
| Offer | An application in `Offer` stage |
| Triage | Role records with no decision recorded |

Of these, only Follow-up and Prep have a genuine target date — a reminder's `dueAt` and an interview's `scheduledAt`. Approval and Triage have none, and the reference prototype gives them none either: it pushes both with an empty due value, so they sit in This week until the user gets to them. We match that exactly.

Offer is the sole divergence. The prototype has an `offerDeadline`; the domain does not.

### Offer rows carry no due indicator rather than a substitute one

The obvious substitute is age in stage — how long the application has sat in Offer. That is worse than showing nothing. The prototype sorts by `dueD` with dateless items falling to the end, so the due column means one thing: proximity to a date you are working towards. An age value occupies that column while meaning the opposite, and it sorts as though it were urgency: an offer entered twelve days ago outranks one entered six days ago, even when the second expires tomorrow and the first expires in three weeks.

So Offer rows leave the due indicator empty and sort after dated items in their group, exactly as Approval and Triage do. Elapsed time still appears in the rationale line, where it reads as context rather than as a deadline.

The cost is real and worth stating: an offer with a genuine deadline cannot be promoted to Now, and cannot show an overdue state. Until an `offerDeadline` exists, a user who wants a countdown on an offer can create a follow-up reminder for the decision date, which derives as a Follow-up row with full urgency behaviour. Adding the field properly is a full-stack domain change and belongs in its own proposal.

*Alternative considered:* deriving the due indicator from stage entry. Rejected for the mis-sorting above — it makes the due column mean two different things.

### The rationale line is computed, and carries no AI badge

The reference prototype badges every row's rationale as AI. In the prototype those strings are themselves deterministic — elapsed days, scheduled dates, window arithmetic. Copying the badge would label arithmetic as model output. The badge is omitted, and the specification forbids it while the rationale stays computed. If a genuine model-generated rationale arrives later, the badge arrives with it.

### Navigation counts come from the shell, using data already fetched

`usePipelineWorkspace` is already called unconditionally in `App`, on every route. The rail's counts reuse that, so no new fetching is introduced. The Today count is the size of Now plus This week, which means the rail and the Today screen derive from one function rather than two that can disagree.

### The Roles count needs one new shell-level query, and the Triage row rides on it

Application data is already at shell level, but roles data is not. `useRoleDiscovery` is called only inside `RoleDiscoveryWorkspace`, which is `lazy()`-imported, so roles load exclusively on `/roles`.

The rail's `Roles` count therefore requires roles data on every route — this is a dependency of the rail redesign itself, not of the Triage row. Since the dependency exists regardless, the Triage row costs nothing additional and stays in scope.

The shell adds one narrow count query. TanStack Query deduplicates on the query key, so the rail count and the Triage row issue a single request between them, and `RoleDiscoveryWorkspace` continues to lazy-load its own fuller data.

*Alternative considered:* dropping the `Roles` count from the rail to avoid the fetch, and deferring the Triage row. Rejected — counts are the reason the rail is being redesigned, and a rail where one of four destinations is uncounted undercuts the change.

## Risks / Trade-offs

- **`min-width: 0` on the main region.** Without it, a flex child refuses to shrink below its content width and the inspector pushes the list off-screen instead of narrowing it. This is the single most likely way to produce a result that looks like the design was implemented incorrectly. It belongs in the layout task and in review.
- **Moving `/` is user-visible and is the point.** → `/pipeline` is unchanged, so existing links and bookmarks keep working; only the default landing changes. If Today proves wrong as a landing page, reverting is a one-line route change.
- **Two detail surfaces coexist — inspector on Today, `SlideOver` on Pipeline.** → This matches the reference design, which opens Pipeline rows into a record screen and Today rows into the inspector. It reads as inconsistent only until the record screen exists. Worth stating in review so it is not "fixed" by unifying them.
- **Removing icon collapse reduces horizontal space on narrow desktops.** → The rail is fixed and modest; the inspector already adapts via `clamp`. Watch the 768–1024px band, where a fixed rail plus an open inspector leaves the least room for the list.
- **Roving selection plus native focus can disagree.** → Selection is list state, not DOM focus, so a selected row and a focused element can diverge. Keep selection visually distinct from the focus ring, and ensure `Enter` acts on the selection while focus is in the list rather than on whatever happens to be focused.
- **The shell gains a roles query on every route.** → One narrow count query, deduplicated by query key and shared with the Triage row. Keep it to a count; if it grows toward the full roles payload, that is a signal the rail is asking for too much.
- **Derivation runs on every render of the shell.** → It is a pure function over an in-memory list of tens of items; memoise on the application list and move on. Revisit only if profiling says otherwise.
- **Offer rows cannot express urgency.** → They carry no due indicator and sort with the other dateless items, so nothing on screen misrepresents them. The interim path for a real deadline is a follow-up reminder on the decision date, which derives as a fully-behaved Follow-up row. Adding `offerDeadline` is a full-stack domain change and belongs in its own proposal.

## Migration Plan

1. Give each route its own component; `App` becomes the shell. No visual change — verify by rendering each existing route.
2. Add the Today derivation as a pure function with unit tests, before any UI consumes it.
3. Add `InspectorPanel` as a primitive with its own tests, distinct from `SlideOver`.
4. Build the Today workspace against the derivation and the panel.
5. Replace the rail with the labelled, counted version; add mobile bottom tabs.
6. Add chords, roving selection, and the Escape ordering.
7. Move the root route to Today and add the palette's Today command.

Steps 1–4 are additive and invisible until step 7. Rollback of the landing-page decision alone is step 7 reverted; rollback of the whole change is a branch revert.

## Open Questions

- Should Waiting persist its expanded state across navigation within a session? The reference prototype keeps it collapsed each time. Leaving it collapsed is specified; revisit if it proves annoying in use.
