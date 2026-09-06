## Context

`apps/web/src/index.css` currently defines a flat `@theme` block: one background, one card surface, one border, one muted foreground, and `--radius: 0.125rem`. The `base` layer sets `body { font-family: ui-monospace, ... }`, so every element in the application inherits monospace.

The reference design ("Direction A · Dark", Claude Design project `61dcf100`) is built the other way around: a sans body with monospace applied deliberately to short uppercase metadata, and hierarchy carried by ordered tiers of border, text, and surface rather than by shadow, radius, or weight alone.

Because the shell and every workspace share these tokens, this cannot be introduced screen by screen. It lands once, for the whole application, or not at all. That is the reason it is a separate change from the navigation work that depends on it.

The design tokens live in a Tailwind v4 `@theme` block. Tokens prefixed `--color-*` become utility classes automatically, so the shape of the token names *is* the shape of the API that components consume.

## Goals / Non-Goals

**Goals:**
- Make the theme able to express the reference design's hierarchy: three border steps, three text steps, four surface steps.
- Establish sans as the default and monospace as an explicit, named role.
- Give components a vocabulary precise enough that a future screen can be built from the design without inventing raw hex values.
- Keep the change reviewable and revertible on its own.

**Non-Goals:**
- No new components, no layout changes, no new screens.
- No behavioural change of any kind. Roles, labels, and interactions stay exactly as they are.
- Not attempting to make the existing screens *match* the reference design. Existing screens will look better and more consistent, but Pipeline is still Pipeline; restyling it is future work.
- No dark/light theming. The application remains dark-only.

## Decisions

### Name tokens by structural role, not by appearance

Steps are named for what they mark (`border-strong` / `border` / `border-subtle`, `foreground` / `foreground-secondary` / `foreground-muted`), not by lightness (`border-1`, `gray-400`). A numeric scale invites components to pick a step by eye, which is how a three-step scale quietly becomes a nine-step one. Naming by role makes the wrong choice legible in review.

*Alternative considered:* mirroring Tailwind's numeric palette convention. Rejected — it optimises for a large general palette, and this is a small deliberate one.

### Keep `--color-border` as the middle step

The existing token keeps its name and takes the structural (middle) value. Every current `border-border` usage therefore stays valid and shifts tone slightly rather than breaking. Only components that specifically want a chip frame or a row rule need editing. This keeps the diff proportional to the design intent instead of touching every bordered element.

*Alternative considered:* renaming to `--color-border-structural` for symmetry with the other two. Rejected — it would churn every bordered component for no behavioural gain.

### Introduce monospace as a utility class, not as a component

The label role is applied via a single reusable class rather than a `<Label>` component. It is a typographic role, not a behavioural one, and it needs to compose with chips, `<time>`, `<span>`, and table cells. A component would force a wrapper element into markup that is otherwise already correct.

*Alternative considered:* a `<MonoLabel>` primitive. Rejected — it adds a node to satisfy a font declaration.

### Fix the muted tone rather than adding a fourth step

`--color-muted-foreground: #525252` is the current de-emphasised tone and is darker than the reference design's muted step. Rather than keep it and add a lighter tier above it, the muted step moves up to the reference value and a *new* secondary step is added above that. Text currently marked muted becomes more readable, which is the intended outcome; nothing becomes less readable.

Note that `--color-muted: #1c1c1c` (a *surface*, despite the name) and `--color-muted-foreground` are unrelated despite the shared prefix. The surface scale supersedes `--color-muted`; it should be folded into the new scale rather than left as a fourth spelling of "a dark grey".

### Treat contrast as a spec requirement, not a review opinion

The muted step carries a 4.5:1 minimum in the spec. It is the tone most likely to drift darker under future "make it quieter" pressure, and it is the one carrying timestamps and counts.

## Risks / Trade-offs

- **Every screen changes appearance in one commit.** → This is the point, and it is why the change is isolated. Review it visually per workspace: Pipeline, Memory, Roles, and the details slide-over. Revert is a single-file revert plus whatever component edits accompanied it.
- **Monospace is load-bearing for alignment somewhere we have not noticed.** → Tabular figures are the likely case (`StatsBar` counts, due dates). Where alignment matters, the fix is `font-variant-numeric: tabular-nums` on the sans stack, not a return to monospace body text. Worth checking `StatsBar`, `FunnelChart`, and `ApplicationCard` explicitly.
- **Sans text renders narrower, so existing fixed widths and truncation points shift.** → Expect some `truncate` and `max-w-*` values to become unnecessary or wrongly placed. Treat these as findings during the visual pass rather than pre-emptively editing them.
- **Existing tests could assert on styling.** → They mostly assert roles, labels, and behaviour. Any test that breaks on a token change is asserting the wrong thing and should be corrected rather than accommodated.
- **`--color-muted` is a surface named like a foreground.** → Folding it into the surface scale is a rename with a real blast radius (`hover:bg-muted` appears throughout). If that proves noisy, it is legitimate to keep `--color-muted` as an alias of the appropriate surface step and clean it up separately.

## Migration Plan

1. Rewrite the `@theme` block with the three scales, the surface scale, and `--radius: 0`.
2. Change the `body` rule to the sans stack; add the monospace label utility.
3. Sweep the presentation layer for elements that should carry the label role — chips, stage names, counts, due dates, group headers, the ⌘K hint.
4. Re-point components where the secondary tier is now the correct tone (descriptions and summary lines currently using muted).
5. Visual pass per workspace at both mobile and desktop widths.
6. Run the existing test suite; correct any test asserting on computed style.

Rollback is a revert of this change's commits; nothing persists outside the stylesheet and component class names.

## Open Questions

- Should `--color-muted` be folded into the surface scale now, or aliased and cleaned up in a follow-up? There are 28 `bg-muted*` usages, which is small enough to fold in directly; the fallback of aliasing it remains available if the sweep turns noisy.
- Does the reference design's `#050505` page tone have a home here? The application shell fills the viewport, so the page step may be unused until a screen renders a visibly inset shell. It is specified for completeness; leaving it defined but unused is acceptable.
