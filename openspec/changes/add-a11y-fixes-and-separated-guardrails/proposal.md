## Why

The rendered app currently fails WCAG AA contrast for muted text such as role titles and metadata, and the live accessibility audit exposed additional modal and ARIA issues that are not covered by automated guardrails. The project needs both direct accessibility fixes and separate repeatable checks: deterministic CI checks for regressions, plus an agent skill for richer rendered investigations.

## What Changes

- Raise muted foreground contrast so all meaningful `text-muted-foreground` usage meets WCAG AA against the app's dark surfaces.
- Fix slide-over hidden-state semantics so closed panels cannot expose focusable descendants to assistive technology or keyboard navigation.
- Replace unsupported ARIA patterns on non-semantic count text with supported accessible naming or visible/hidden text patterns.
- Add form-field hygiene for browser and assistive technology interoperability, including stable `id`/`name` attributes and appropriate `autocomplete` values where applicable.
- Add deterministic accessibility guardrails runnable from the web app package, covering axe WCAG checks and rendered contrast checks.
- Add a repo-local Codex skill that documents the broader manual/live accessibility validation workflow using Chrome DevTools MCP when available.

## Capabilities

### New Capabilities
- `accessibility-guardrails`: Defines repeatable accessibility validation guardrails, separating deterministic CI-enforceable checks from the richer agent-assisted live audit workflow.

### Modified Capabilities
- `design-system`: Design tokens and UI primitives must meet WCAG AA contrast and use supported form/ARIA semantics.
- `slide-over-panel`: Hidden slide-over panels must not expose focusable content or violate `aria-hidden` focus constraints.

## Impact

- Affected code: `apps/web/src/index.css`, presentation components using muted text, form primitives/usages, `PipelineBoard`, `SlideOver`, and accessibility-related tests.
- New or updated tooling: likely Playwright and `@axe-core/playwright` or an equivalent deterministic browser accessibility runner for `apps/web`.
- New repo-local agent resource: `.codex/skills/accessibility-audit/`.
- No backend API changes.
