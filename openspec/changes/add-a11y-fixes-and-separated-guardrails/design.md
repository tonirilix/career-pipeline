## Context

The app uses a dark Tailwind v4 token system with presentation components built from local shadcn-style primitives. A live WCAG-oriented audit found that `--color-muted-foreground: #525252` only reaches about `2.4:1` to `2.5:1` on the app's dark surfaces, so meaningful muted text fails WCAG AA for normal text. The same audit found closed slide-over panels still expose focusable descendants under `aria-hidden`, unsupported `aria-label` usage on plain count spans, and browser form-field hygiene issues.

The requested guardrails have two different jobs: deterministic regression checks that can run in CI, and an agent-assisted live validation workflow that can inspect rendered state, seed data, use Chrome DevTools MCP, and produce human-readable findings.

## Goals / Non-Goals

**Goals:**
- Make the current UI pass WCAG AA contrast for meaningful text on the dark theme.
- Fix the modal and ARIA issues identified by the rendered audit.
- Add an `npm`-runnable accessibility guardrail that can fail on serious WCAG regressions.
- Add a repo-local Codex skill for the broader live accessibility audit workflow.
- Keep accessibility guardrails separated by responsibility: CI for deterministic enforcement, skill for exploratory validation.

**Non-Goals:**
- Redesign the visual language or replace the current dark monochrome/accent theme.
- Add backend accessibility checks.
- Guarantee full manual WCAG conformance beyond the automated and scripted scope.
- Require the Codex skill to be used by CI.

## Decisions

### D1 - Fix contrast at the design-token level

Raise `--color-muted-foreground` rather than replacing each `text-muted-foreground` usage individually. This keeps the visual hierarchy consistent and prevents future muted text from inheriting a failing token. The chosen value should pass at least `4.5:1` against `--color-background`, `--color-card`, and `--color-muted`; a value around `#858585` or brighter meets that floor while preserving a muted appearance.

Alternative considered: promote selected role-title and metadata text to `text-foreground`. That would fix specific failures but leave labels, empty states, placeholders, and future muted usages at risk.

### D2 - Use deterministic browser checks for CI

Add an `apps/web` accessibility command that starts or connects to the built app with a real browser, runs axe WCAG tags, and performs a rendered contrast sweep for visible meaningful text. Playwright with `@axe-core/playwright` is the preferred implementation because it is maintained, scriptable, and avoids relying on a globally installed ChromeDriver.

Alternative considered: use `@axe-core/cli`. The prior validation hit a ChromeDriver/browser mismatch, which makes it less reliable for local and CI use unless pinned driver management is added.

### D3 - Keep the Codex skill as an agent workflow, not a gate

Create `.codex/skills/accessibility-audit/SKILL.md` to document the manual/live audit procedure: install dependencies if needed, start the app, use Chrome DevTools MCP when available, seed representative data, run/inject axe, measure computed contrast, inspect console issues, check responsive target sizing, and stop servers. This skill should report findings and evidence; it should not be the CI enforcement mechanism.

Alternative considered: encode all live-audit behavior only in a script. Scripts are better for pass/fail checks, but they cannot reliably capture the judgment and browser-state exploration needed for richer accessibility investigations.

### D4 - Make hidden slide-over content unavailable

Closed `SlideOver` content must not remain focusable inside an `aria-hidden` subtree. The implementation can render panels only while open, apply `inert` to closed panels, or otherwise remove closed descendants from the tab order and accessibility tree. The chosen approach should preserve existing open/close animation if practical, but semantics take precedence.

Alternative considered: leave closed panels mounted with `aria-hidden` only. This is the current failure mode and violates axe's `aria-hidden-focus` rule.

### D5 - Replace unsupported ARIA on plain spans

Count labels should avoid `aria-label` on non-interactive spans without a role. Use visible context, `aria-hidden` plus screen-reader-only text, or a semantic role only when the role is meaningful. This keeps the accessibility tree valid without adding unnecessary verbosity.

## Risks / Trade-offs

- Brighter muted text may reduce visual subtlety → Choose the lowest token value that passes all intended dark surfaces, then verify the rendered UI.
- Automated contrast sweeps can report false positives for hidden, decorative, disabled, or graphical text → Scope the script to visible meaningful text and allow narrowly documented exclusions when necessary.
- Browser-based CI adds dependency and runtime cost → Keep the a11y script targeted to representative routes/states rather than a full end-to-end suite.
- `inert` support and TypeScript JSX typings may vary → Prefer a React-compatible implementation with tests, and fall back to conditional rendering if needed.
