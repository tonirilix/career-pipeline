## 1. Card Composition

- [x] 1.1 Refactor `ApplicationCard` spacing, typography, and metadata grouping for a compact information hierarchy.
- [x] 1.2 Replace repeated long visible card action text with concise labels while preserving full `aria-label` context.
- [x] 1.3 Convert stage movement controls into a compact row that keeps the select and update action available.
- [x] 1.4 Preserve closed-card visual state while keeping company, role, and details action visible.

## 2. Board And Phase Layout

- [x] 2.1 Tighten `PipelineBoard` phase spacing, stage column padding, and card-list gaps.
- [x] 2.2 Reduce empty stage column visual weight while preserving stage label, count, and discoverability.
- [x] 2.3 Ensure Closed phase collapsed and expanded states remain clear with compact spacing.
- [x] 2.4 Verify compact layout does not overlap sidebar, command errors, or slide-over panels.

## 3. Responsive And Accessibility Verification

- [x] 3.1 Ensure mobile card buttons and stage controls provide 44px minimum touch targets.
- [x] 3.2 Add or update presentation tests for compact action accessible names and board empty-state expectations.
- [x] 3.3 Run the web test suite and build to verify architecture boundaries and Tailwind compilation.
