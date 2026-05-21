# Responsive Pipeline Board

## Purpose
Defines responsive behaviour of the pipeline board at mobile viewport widths (<768px), including single-column layout, phase header visibility, Tailwind-compatible class-based column counts, and minimum touch target sizes for interactive elements.

---

## Requirements

### Requirement: Pipeline board renders as single-column layout on mobile
The system SHALL render the pipeline board as a single-column layout on viewports narrower than 768px, stacking stage columns vertically within each phase instead of placing them side by side.

#### Scenario: Stage columns stack on mobile
- **WHEN** the viewport is narrower than 768px
- **THEN** each stage column SHALL stack vertically within its phase, occupying full available width

#### Scenario: Grid layout is restored on desktop
- **WHEN** the viewport is 768px or wider
- **THEN** each phase SHALL display its stage columns in a horizontal grid as before

---

### Requirement: Phase headers remain visible at all viewport sizes
The system SHALL always render phase labels (Active, Interviewing, Closed) regardless of viewport width so users can orient themselves on mobile.

#### Scenario: Phase labels present on mobile
- **WHEN** the pipeline board is rendered on a viewport narrower than 768px
- **THEN** the "Active", "Interviewing", and "Closed" phase labels SHALL be visible

---

### Requirement: Dynamic column count uses class-based lookup instead of inline styles
The system SHALL determine the CSS grid column count using a static Tailwind class lookup (e.g., `{ 2: 'grid-cols-2', 3: 'grid-cols-3' }`) rather than an inline `gridTemplateColumns` style, so that Tailwind can statically detect the classes.

#### Scenario: Grid classes are present in source
- **WHEN** the component source is scanned by the Tailwind compiler
- **THEN** `grid-cols-2` and `grid-cols-3` SHALL be present as literal strings in the source file

---

### Requirement: All interactive elements meet minimum touch target size
Interactive elements on the pipeline board (stage column headers, overflow buttons) SHALL meet a minimum touch target size of 44×44px on mobile.

#### Scenario: Column header touch target is large enough
- **WHEN** the pipeline board is rendered on mobile
- **THEN** each interactive column header SHALL have a minimum height and width of 44px
