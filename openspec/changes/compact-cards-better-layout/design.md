## Context

The web app already uses a two-column shell, phase-grouped pipeline board, shadcn-style UI primitives, and slide-over panels for creation and details. `ApplicationCard` currently repeats full company names in several button labels, uses stacked full-width actions, and reserves a dedicated stage selector block in every card. This preserves accessibility but consumes board space quickly when several opportunities are visible.

This change is presentation-only. It must preserve architecture boundaries, existing application commands, accessible labels, slide-over behavior, and the responsive board behavior being introduced by `add-responsive-support`.

## Goals / Non-Goals

**Goals:**

- Make opportunity cards shorter and easier to scan across columns.
- Establish a clearer content hierarchy: company and role first, compact metadata second, actions last.
- Reduce repeated visible text while keeping accessible names explicit for screen readers.
- Tighten board and phase spacing so more applications fit in the viewport.
- Keep mobile touch targets usable for primary card actions.

**Non-Goals:**

- No changes to application stages, stage-transition rules, or backend data.
- No drag-and-drop, virtualized lists, or new board interaction model.
- No replacement of slide-over details with inline expansion.
- No new global state store or presentation dependency.

## Decisions

1. Use compact card composition instead of hiding data.

   The card will still show company, role, source, location when available, current stage context, and available actions. The density improvement will come from tighter spacing, grouped metadata, and shorter visible action labels, not from removing essential information. Alternative considered: show only company and role with everything else in details. That would improve density but weaken board-level scanning.

2. Keep primary and secondary actions visible, but shorten visible labels.

   Buttons can use concise visible labels such as `Details`, `Apply`, `Advance`, or `Update`, with `aria-label` preserving the full action context such as `View Acme details`. Alternative considered: icon-only controls. That would save space, but this app has workflow actions where text labels reduce ambiguity.

3. Collapse stage movement controls into a compact control row.

   The card should avoid a tall, separated "Move to stage" area. A compact select plus update button can provide the same capability while taking less vertical space. Alternative considered: remove the manual selector and keep only the primary next-stage action. That would make non-linear stage changes harder and would change existing workflow affordances.

4. Treat board density as a layout concern, not a data concern.

   Board changes should adjust gaps, padding, minimum column heights, and empty states. They should not filter, truncate, or reorder applications beyond existing controls. Alternative considered: limit visible cards per column. That would hide work and introduce a new interaction requirement.

## Risks / Trade-offs

- Compact controls may become harder to tap on mobile -> Preserve 44px minimum touch targets for interactive controls on narrow viewports while allowing denser desktop sizing.
- Shorter visible action labels may reduce clarity -> Use full `aria-label` values and keep labels conventional and specific enough for sighted users.
- Tighter spacing can make columns visually noisy -> Keep consistent separators, typography scale, and status metadata grouping.
- Pending responsive work may touch the same board files -> Implement with existing responsive classes and avoid conflicting behavioral assumptions.
