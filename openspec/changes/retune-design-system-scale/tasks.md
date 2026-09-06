## 1. Theme Tokens

- [x] 1.1 Rewrite the `@theme` block in `apps/web/src/index.css` with the three-step border scale (strong / structural / subtle), keeping `--color-border` as the structural middle step so existing `border-border` usages stay valid.
- [x] 1.2 Add the three-step foreground scale: ink, secondary, muted. Raise `--color-muted-foreground` from `#525252` to the reference muted tone and add the new secondary step above it.
- [x] 1.3 Add the surface scale (page / shell / raised panel / selected row) and decide the fate of `--color-muted` — fold it into the scale (28 `bg-muted*` usages) or alias it to the correct step.
- [x] 1.4 Set `--radius` to `0`.
- [x] 1.5 Verify the accent token is unchanged at `#c8f135` and add a comment recording its permitted uses.
- [x] 1.6 Confirm muted-on-shell contrast is at least 4.5:1 before proceeding.

## 2. Typography Roles

- [x] 2.1 Change the `body` rule in the `base` layer to the sans stack (`system-ui, -apple-system, "Segoe UI", sans-serif`).
- [x] 2.2 Add a single reusable monospace label utility for short uppercase metadata; do not introduce a component wrapper for it.
- [x] 2.3 Apply the label role across the presentation layer. The 33 existing `uppercase tracking-widest` sites are the primary candidate list: status and stage chips, counts, due dates, group headers, workspace eyebrows, and the ⌘K hint.
- [x] 2.4 Confirm headings, button labels, and form controls resolve to the sans stack and do not inherit monospace.

## 3. Component Re-pointing

- [x] 3.1 Sweep the 107 `text-muted-foreground` usages and move descriptions, summary lines, and supporting sentences to the new secondary step; leave counts, timestamps, and hints on muted.
- [x] 3.2 Move repeated list-row rules to the subtle border step (`FollowUpWork` list, `ApplicationDetails` sections, `PipelineBoard` rows).
- [x] 3.3 Move chip and outer-frame borders to the strong step (`ApplicationCard` stage badge, `StatsBar` items, saved-view chips).
- [x] 3.4 Point raised panels at the raised-panel surface step (`SlideOver` panel, `SecondarySidebar`).
- [x] 3.5 Remove any now-redundant `rounded-none` overrides made unnecessary by `--radius: 0`.

## 4. Alignment and Layout Fallout

- [x] 4.1 Add `font-variant-numeric: tabular-nums` where monospace was previously doing the aligning — check `StatsBar`, `FunnelChart` counts, `ApplicationCard`, and follow-up due dates.
- [x] 4.2 Review fixed widths, `max-w-*`, and `truncate` points that were tuned against monospace metrics; correct only where the sans stack visibly breaks the layout.

## 5. Verification

- [x] 5.1 Visual pass on Pipeline at mobile and desktop widths, including the details slide-over and the opportunity form.
- [x] 5.2 Visual pass on Memory and Roles at both widths.
- [x] 5.3 Run `npm run test` in `apps/web`; correct any test asserting on computed style rather than accommodating it.
- [x] 5.4 Run `npm run build` in `apps/web` and confirm the CSS bundle emits the new tokens.
- [x] 5.5 Confirm no behavioural change: no `aria-label`, `role`, or interaction was altered by this change.
