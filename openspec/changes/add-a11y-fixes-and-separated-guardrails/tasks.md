## 1. Fix Rendered Accessibility Issues

- [x] 1.1 Raise `--color-muted-foreground` in `apps/web/src/index.css` to a value that passes 4.5:1 against `background`, `card`, and `muted` surfaces.
- [x] 1.2 Verify application card role titles, metadata, labels, empty states, and funnel labels still use the intended visual hierarchy after the token change.
- [x] 1.3 Fix `SlideOver` closed-state semantics so closed panels do not expose focusable descendants inside `aria-hidden` content.
- [x] 1.4 Replace unsupported `aria-label` usage on plain stage count spans with a supported accessible text pattern.
- [x] 1.5 Add stable `id` or `name` attributes to visible form controls that currently lack browser form metadata.
- [x] 1.6 Add appropriate `autocomplete` attributes to opportunity form fields with standard browser autocomplete purposes.

## 2. Add Deterministic Accessibility Guardrails

- [x] 2.1 Add browser accessibility test dependencies and an `apps/web` npm script for running accessibility checks.
- [x] 2.2 Implement an axe-based WCAG A/AA check against the rendered app with representative application-card state.
- [x] 2.3 Implement a rendered contrast check that reports text sample, foreground color, background color, measured ratio, and required ratio for failures.
- [x] 2.4 Ensure the accessibility command exits non-zero for serious WCAG violations or contrast failures.
- [x] 2.5 Document or wire the accessibility command so it can be run locally and by CI independently of Codex.

## 3. Add Agent Audit Skill

- [x] 3.1 Create `.codex/skills/accessibility-audit/SKILL.md` with metadata that triggers for live WCAG/accessibility audit requests.
- [x] 3.2 Document the live audit workflow: install dependencies if needed, start the app, inspect with Chrome DevTools MCP when available, seed representative data, run or inject axe-core, measure computed contrast, inspect browser issues, test responsive viewports, and stop started servers.
- [x] 3.3 Keep the skill focused on agent-assisted investigation and explicitly separate it from CI enforcement.

## 4. Verification

- [x] 4.1 Run existing web tests.
- [x] 4.2 Run the new accessibility guardrail command and confirm it passes.
- [x] 4.3 Run a live browser check for the `Senior Engineer` role-title case and confirm the measured contrast is at least 4.5:1.
- [x] 4.4 Run `openspec validate add-a11y-fixes-and-separated-guardrails --strict` and fix any spec issues.
