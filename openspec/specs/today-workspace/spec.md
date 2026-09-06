# Today Workspace

## Purpose
Defines the application's entry point: a derived queue of what needs doing, computed at read time from job application data the domain already holds. Today stores nothing of its own, and its reasoning is arithmetic over stored fields rather than model output.

---

## Requirements

### Requirement: Today is derived from existing application data and stores nothing
The system SHALL compute the Today workspace at read time from job application data already held by the domain — stage, follow-up reminders, interviews, and timeline events. It SHALL NOT introduce a stored Today item, a persisted queue, or any write performed for the purpose of populating Today.

Derivation SHALL read the unfiltered application list. Today SHALL NOT be affected by Pipeline search, stage, source, sort, or saved-view controls.

#### Scenario: Today reflects current application data
- **WHEN** a follow-up reminder is completed from any workspace
- **THEN** the item derived from that reminder SHALL no longer appear in Today

#### Scenario: Pipeline filters do not affect Today
- **WHEN** the user applies a stage or search filter in Pipeline and then opens Today
- **THEN** Today SHALL show every derived item
- **AND** the set of items SHALL be identical to the set shown with no Pipeline filters applied

#### Scenario: Today performs no writes on load
- **WHEN** the Today workspace is rendered
- **THEN** no mutation SHALL be issued as a result of rendering it

---

### Requirement: Today groups work by urgency
The system SHALL group derived items into three sections: **Now** for items that are overdue or due within three days, **This week** for items due later within the coming week or awaiting the user's review, and **Waiting** for items with no available action until a reply arrives or a date passes.

Now and This week SHALL be expanded by default. Waiting SHALL be collapsed by default and SHALL be expandable.

Items within a group SHALL be ordered by due proximity, soonest first. Items with no target date SHALL be ordered after all dated items in the group.

#### Scenario: Overdue item appears in Now
- **WHEN** an item's due date is in the past
- **THEN** it SHALL appear in the Now group

#### Scenario: Item due within three days appears in Now
- **WHEN** an item is due today, tomorrow, or within three days
- **THEN** it SHALL appear in the Now group

#### Scenario: Waiting is collapsed by default
- **WHEN** the Today workspace is first rendered
- **THEN** the Waiting section SHALL be collapsed
- **AND** it SHALL display a count of the items it contains

#### Scenario: Waiting can be expanded
- **WHEN** the user activates the Waiting section header
- **THEN** the Waiting items SHALL become visible
- **AND** the control SHALL expose its expanded state to assistive technology

#### Scenario: Items are ordered by due proximity
- **WHEN** a group contains more than one item
- **THEN** the item with the nearest due date SHALL appear first

---

### Requirement: Today rows expose a type, an action, a rationale, a due indicator, and one primary action
The system SHALL render each derived item as a row carrying: a type chip drawn from Follow-up, Prep, Approval, Offer, and Triage; the action to take; the subject it applies to; the application's current stage; a rationale line; a due indicator where the item has a genuine target date; and exactly one primary action control.

A row SHALL offer one primary action, not a set of competing controls. Additional operations SHALL be reached by opening the item.

The due indicator SHALL be populated only from a date the item is actually working towards — a follow-up reminder's due date, or an interview's scheduled date. An item with no such date SHALL leave the due indicator empty rather than substituting elapsed time, age in stage, or any other derived quantity. Elapsed time MAY appear in the rationale line, where it reads as context rather than as a deadline.

Items with an empty due indicator SHALL sort after items with one, within their group.

#### Scenario: Row identifies its type
- **WHEN** a derived item is rendered
- **THEN** it SHALL display a type chip identifying which kind of work it represents

#### Scenario: Row names the subject and stage
- **WHEN** a derived item relates to a job application
- **THEN** the row SHALL display the company, the role title, and the application's current stage

#### Scenario: Row offers a single primary action
- **WHEN** a derived item is rendered
- **THEN** it SHALL present exactly one primary action control

#### Scenario: Overdue rows emphasise the due indicator
- **WHEN** an item's due date is in the past
- **THEN** the due indicator SHALL use the accent token
- **AND** an item that is not past due SHALL NOT use the accent token for its due indicator

#### Scenario: Dateless items leave the due indicator empty
- **WHEN** an item has no target date, such as an Approval, Triage, or Offer item
- **THEN** its due indicator SHALL be empty
- **AND** it SHALL NOT display elapsed time or age in stage in the due indicator

#### Scenario: Dateless items sort last within their group
- **WHEN** a group contains both dated and dateless items
- **THEN** every dated item SHALL appear before every dateless item

---

### Requirement: The rationale line is deterministic and is not presented as AI output
The system SHALL derive each row's rationale line by computation over existing application data — for example elapsed days since a timeline event, the interval to a scheduled interview, or the absence of a logged reply.

The rationale line SHALL NOT be labelled, badged, or otherwise presented as generated by a model. The system SHALL NOT display an AI indicator on any Today row while the rationale is computed deterministically.

#### Scenario: Rationale states a computed fact
- **WHEN** an application has an overdue follow-up
- **THEN** its rationale line SHALL state facts derived from stored data, such as the elapsed time since the application was submitted

#### Scenario: No AI indicator on rows
- **WHEN** any Today row is rendered
- **THEN** it SHALL NOT display an AI badge or equivalent generated-content marker

---

### Requirement: The Today header summarises the day and links stage counts to Pipeline
The system SHALL render a header containing the current date, a computed summary of outstanding work, and a strip of active-stage counts covering Saved, Applied, Screening, Technical interview, Onsite, and Offer.

Each stage cell SHALL be an interactive control that navigates to Pipeline filtered to that stage.

#### Scenario: Header summarises outstanding work
- **WHEN** the Today workspace is rendered with derived items
- **THEN** the header SHALL state the count of Now items and the count of This week items

#### Scenario: Stage cell navigates to filtered Pipeline
- **WHEN** the user activates the Screening cell in the stage strip
- **THEN** the browser location SHALL be the Pipeline route
- **AND** the Pipeline stage filter SHALL be set to Screening

#### Scenario: Stage cells are reachable by keyboard
- **WHEN** the user moves focus through the header
- **THEN** each stage cell SHALL be focusable and activatable by keyboard

---

### Requirement: The Today list supports roving keyboard selection
The system SHALL allow the user to move a selection through Today's actionable rows with `j` and `k`, and to open the selected row with `Enter`.

Selection SHALL move across the Now and This week groups as a single sequence. Rows in the collapsed Waiting section SHALL NOT participate in the sequence while it is collapsed.

These keys SHALL NOT act while focus is inside a text input, textarea, or select.

#### Scenario: j moves selection to the next row
- **WHEN** the Today list has a selected row and the user presses `j`
- **THEN** the selection SHALL move to the next actionable row

#### Scenario: k moves selection to the previous row
- **WHEN** the Today list has a selected row and the user presses `k`
- **THEN** the selection SHALL move to the previous actionable row

#### Scenario: Selection crosses group boundaries
- **WHEN** the selected row is the last row of the Now group and the user presses `j`
- **THEN** the selection SHALL move to the first row of the This week group

#### Scenario: Enter opens the selected row
- **WHEN** a row is selected and the user presses `Enter`
- **THEN** that item SHALL open in the inspector panel

#### Scenario: Keys are inert while typing
- **WHEN** focus is inside a text input and the user types `j`
- **THEN** the character SHALL be entered into the field
- **AND** the Today selection SHALL NOT move

#### Scenario: Selected row is visually identifiable
- **WHEN** a row is selected
- **THEN** it SHALL be distinguishable from unselected rows by background and by an accent marker

---

### Requirement: Today distinguishes loading, empty, and populated states
The system SHALL render a distinct loading state while application data is in flight, and a distinct empty state when derivation yields no Now or This week items.

The empty state SHALL confirm that nothing needs attention and SHALL offer onward navigation rather than presenting a bare blank region.

#### Scenario: Loading state is announced
- **WHEN** application data is loading
- **THEN** the Today workspace SHALL render a busy indicator exposed to assistive technology

#### Scenario: Empty state confirms nothing is outstanding
- **WHEN** derivation yields no Now and no This week items
- **THEN** the workspace SHALL render a message confirming nothing needs attention
- **AND** it SHALL offer navigation to another workspace

#### Scenario: Waiting items alone do not suppress the empty state
- **WHEN** derivation yields Waiting items but no Now or This week items
- **THEN** the empty state SHALL be rendered
- **AND** the Waiting section SHALL remain available
