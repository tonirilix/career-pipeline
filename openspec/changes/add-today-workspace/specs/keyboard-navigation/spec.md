## ADDED Requirements

### Requirement: Global workspace chords navigate between top-level workspaces
The system SHALL support two-key chords beginning with `g` that navigate to a top-level workspace: `g` then `t` for Today, `g` then `r` for Roles, and `g` then `p` for Pipeline.

Chord navigation SHALL use browser history, so that Back returns to the previous workspace.

#### Scenario: g then t navigates to Today
- **WHEN** the user presses `g` and then `t`
- **THEN** the browser location SHALL be the Today route
- **AND** the Today workspace SHALL render

#### Scenario: g then p navigates to Pipeline
- **WHEN** the user presses `g` and then `p`
- **THEN** the browser location SHALL be `/pipeline`

#### Scenario: Chord navigation is reversible
- **WHEN** the user navigates by chord and then uses browser Back
- **THEN** the previous workspace SHALL render

---

### Requirement: Chords expire and unrecognised sequences are inert
The system SHALL treat the `g` prefix as expiring after a short interval. A second key pressed after the interval SHALL NOT complete a chord. A second key that maps to no workspace SHALL do nothing and SHALL NOT leave the chord pending.

#### Scenario: Expired prefix does not navigate
- **WHEN** the user presses `g`, waits beyond the chord interval, and then presses `t`
- **THEN** no navigation SHALL occur

#### Scenario: Unrecognised second key is inert
- **WHEN** the user presses `g` and then a key that maps to no workspace
- **THEN** no navigation SHALL occur
- **AND** the pending prefix SHALL be discarded

---

### Requirement: Keyboard shortcuts are inert while the user is typing
The system SHALL NOT act on single-key shortcuts or chord prefixes while focus is inside a text input, textarea, or select element.

#### Scenario: Typing g in a field does not start a chord
- **WHEN** focus is inside a text input and the user types `g`
- **THEN** the character SHALL be entered into the field
- **AND** no chord SHALL become pending

#### Scenario: Shortcuts resume after leaving the field
- **WHEN** the user moves focus out of a text input and presses `g` then `t`
- **THEN** navigation to Today SHALL occur

---

### Requirement: Escape closes the topmost transient surface
The system SHALL close only the topmost open transient surface when `Escape` is pressed, in the order: command palette, then modal drawer, then inspector. Pressing `Escape` with no transient surface open SHALL do nothing.

#### Scenario: Escape closes the palette before the inspector
- **WHEN** both the inspector and the command palette are open and the user presses `Escape`
- **THEN** the command palette SHALL close
- **AND** the inspector SHALL remain open

#### Scenario: Escape then closes the inspector
- **WHEN** only the inspector is open and the user presses `Escape`
- **THEN** the inspector SHALL close

#### Scenario: Escape with nothing open is inert
- **WHEN** no transient surface is open and the user presses `Escape`
- **THEN** the workspace state SHALL be unchanged
