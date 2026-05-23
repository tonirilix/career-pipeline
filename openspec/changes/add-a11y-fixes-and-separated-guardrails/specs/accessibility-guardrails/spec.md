## ADDED Requirements

### Requirement: Deterministic accessibility checks are runnable from the web package
The system SHALL provide a deterministic web accessibility check command that can be run from `apps/web` and by CI without relying on Codex agent behavior.

#### Scenario: Accessibility command runs WCAG checks
- **WHEN** a developer runs the web accessibility check command
- **THEN** the command SHALL run browser-based WCAG A and AA checks against the rendered application

#### Scenario: Accessibility command fails on serious violations
- **WHEN** the rendered application has a serious WCAG A or AA violation detected by the accessibility runner
- **THEN** the command SHALL exit with a non-zero status and report the failing rule and affected target

### Requirement: Rendered contrast checks cover meaningful visible text
The system SHALL include a rendered contrast check for visible meaningful text in the web accessibility guardrail.

#### Scenario: Muted role title contrast is checked
- **WHEN** the accessibility guardrail renders an application card with a role title using the muted foreground token
- **THEN** the guardrail SHALL verify that the role title has a contrast ratio of at least 4.5:1 against its rendered background

#### Scenario: Contrast failures include computed colors
- **WHEN** the rendered contrast check finds text below the WCAG AA contrast threshold
- **THEN** the report SHALL include the text sample, foreground color, background color, measured ratio, and required ratio

### Requirement: Agent accessibility audit workflow is documented as a separate skill
The repository SHALL provide a repo-local Codex skill for live accessibility audits that is separate from deterministic CI guardrails.

#### Scenario: Skill describes live audit workflow
- **WHEN** an agent uses the accessibility audit skill
- **THEN** the skill SHALL instruct the agent to inspect the running application, use Chrome DevTools MCP when available, run or inject axe-core, measure computed contrast, inspect browser issues, check responsive viewports, and stop any started dev server

#### Scenario: Skill does not replace CI guardrails
- **WHEN** the repository accessibility guardrails are evaluated in CI
- **THEN** CI SHALL use deterministic commands rather than requiring the Codex skill to execute
