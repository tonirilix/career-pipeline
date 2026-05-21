## Why

The current pipeline board leaves too much vertical and horizontal space inside each opportunity card, making it harder to scan many applications at once. A more compact card layout will improve comparison across stages without changing the underlying application workflow.

## What Changes

- Reduce opportunity card visual weight and whitespace while preserving accessible names, controls, and readable content.
- Rework card content hierarchy so company, role, stage metadata, dates, and next actions are easier to scan in a dense board.
- Tighten pipeline column spacing and empty states so the board uses the available viewport more effectively.
- Preserve existing slide-over interactions for details and opportunity creation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `design-system`: Add compact card and dense board presentation requirements that constrain spacing, hierarchy, and action affordances.
- `pipeline-layout`: Update board layout requirements so columns and cards support higher-density scanning within the main content area.
- `pipeline-phases`: Update phase layout requirements so phase groups remain legible and space-efficient with compact cards.

## Impact

- Affected code: `apps/web/src/presentation/components/` card, board, phase, and layout components; related presentation tests.
- APIs: No application, GraphQL, or backend API changes.
- Dependencies: No new runtime dependencies expected.
- Systems: Frontend presentation only; architecture boundaries remain unchanged.
