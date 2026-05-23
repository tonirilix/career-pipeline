---
name: accessibility-audit
description: Run a live WCAG accessibility audit for the web app using the rendered application, Chrome DevTools MCP when available, axe-core, computed contrast checks, responsive viewport checks, and source-code references. Use when the user asks to audit accessibility, verify WCAG AA, inspect contrast, or reproduce the manual live validation workflow.
---

# Accessibility Audit

Use this skill for agent-assisted accessibility investigations. This workflow complements deterministic guardrails such as `npm run a11y`; it does not replace CI.

## Workflow

1. Inspect the app structure and relevant styling tokens.
   - Prefer `rg` for `text-muted-foreground`, color tokens, form controls, ARIA usage, and the user-mentioned text.
   - Read the component files that own the rendered issue.

2. Start the app if a running URL is not already provided.
   - Install locked dependencies if required.
   - Run the relevant dev command, usually `npm run dev --workspace apps/web`.
   - Capture the local URL and stop the server before finishing.

3. Inspect the live rendered app.
   - Use Chrome DevTools MCP when available.
   - Take an accessibility snapshot.
   - Seed representative UI state when empty data would hide the target issue, such as creating a sample `Stripe / Senior Engineer` opportunity through the UI.
   - Check browser console issues and DevTools-reported accessibility/form issues.

4. Run WCAG checks against the live page.
   - Prefer the repo guardrail command when it exists: `npm run a11y`.
   - If the guardrail is not enough for the question, inject or run `axe-core` in the active browser page with WCAG A/AA tags.
   - Report rule IDs, impact, affected targets, and the relevant source files.

5. Measure rendered contrast.
   - Use computed styles from the browser, not only source tokens.
   - For each relevant text sample, report foreground color, effective background color, font size/weight, measured contrast ratio, and required WCAG AA ratio.
   - Check the specific user-reported text, plus nearby repeated uses of the same token or component.

6. Check responsive and keyboard basics.
   - Verify visible controls have accessible names.
   - Check target sizes on desktop and mobile viewports.
   - Inspect focus visibility and modal/focus-trap behavior when relevant.

7. Summarize findings.
   - Lead with pass/fail status for the user-reported concern.
   - Separate direct WCAG failures from lower-severity browser hygiene issues.
   - Include file references and commands run.
   - State any checks that could not be run.

## Guardrail Boundary

- Use `npm run a11y` for deterministic pass/fail regression checks.
- Use this skill for exploratory evidence gathering, richer browser-state inspection, screenshots/snapshots when helpful, and actionable recommendations.
- Do not require this skill for CI.
