## Why

The Claude Design prototype ("Direction A · Dark") that drives the upcoming navigation work is a sans-serif interface that uses monospace only for small uppercase labels, and it relies on three distinct border tiers, three text tiers, and four surface tiers to build hierarchy. The current theme is monospace for *everything*, with a single border token and only two text tones. Any component built to the prototype's markup will therefore render wrong on this theme regardless of how faithfully it is written — wider, flatter, and without the emphasis levels the layout depends on.

Retuning the tokens first means the design work that follows can be judged on its own merits, and this change — which touches every existing screen — can be reviewed and reverted on its own.

## What Changes

- **BREAKING (visual)**: `body` font becomes a sans stack (`system-ui, -apple-system, "Segoe UI", sans-serif`). Monospace becomes a deliberate, restricted role rather than the default.
- Introduce a monospace *label* role for small uppercase metadata only: type chips, stage names, counts, due dates, group headers, and keyboard hints.
- Replace the single `--color-border: #272727` token with a three-step border scale: `#3a3a3a` (chips, outer frames), `#2a2a2a` (structural dividers), `#1f1f1f` (row rules).
- Replace the two-tone text scale with three tiers: `#e8e8e3` ink, `#a8a8a0` secondary, `#7c7c74` muted. The current `--color-muted-foreground: #525252` is materially darker than the prototype's muted tone and leaves no room for a secondary tier.
- Introduce surface tiers: `#050505` page, `#0c0c0c` shell, `#101010` raised panel, `#171717` selected row. Today's theme has only `background` and `card`.
- Set `--radius` to `0` (currently `0.125rem`).
- Keep the accent at `#c8f135` but define its permitted uses: focus ring, active-navigation marker, selected-row marker, overdue emphasis, and status/toast framing. It is not a general-purpose highlight.

Non-goals: no new components, no layout changes, no new screens, and no changes to component structure or behaviour. Existing components are re-pointed at the new tokens only where they currently reference a token whose meaning has split.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `design-system`: the "Brand color tokens are defined in the theme" requirement gains a defined scale rather than a flat token list, and new requirements are added for the typography role split (sans body / monospace label), the border and text tiers, the surface tiers, and accent rationing.

## Impact

- `apps/web/src/index.css` — the `@theme` block and the `base` layer body rule.
- Any presentation component that currently relies on the body font being monospace for alignment, or that uses `text-muted-foreground` where the new secondary tier is the correct tone. Expected to touch `ApplicationCard`, `StatsBar`, `FollowUpWork`, `WorkspaceShell`, `AppSidebar`, and the `ui/` primitives.
- Visual-only: no domain, application, or infrastructure code. Existing tests assert roles, labels, and behaviour rather than computed styles, so they should continue to pass unchanged; any that break indicate a styling assumption worth removing.
- Unblocks `add-today-workspace`, which is written against these tokens.
