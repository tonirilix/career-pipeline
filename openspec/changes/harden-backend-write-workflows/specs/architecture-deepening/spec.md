## MODIFIED Requirements

### Requirement: Backend multi-step workflows are atomic
Backend Job Application workflows that write more than one persisted record SHALL execute those writes atomically.

#### Scenario: Application creation rolls back on timeline failure
- **WHEN** creating a Job Application succeeds at saving the application but fails while writing the initial timeline event
- **THEN** the entire workflow SHALL be rolled back with no partial persistence

#### Scenario: Stage advance rolls back on later failure
- **WHEN** advancing a Job Application stage succeeds at updating the stage but fails while writing a timeline event or deactivating follow-up reminders
- **THEN** the entire workflow SHALL be rolled back with no partial persistence

#### Scenario: Detail workflow rolls back on timeline failure
- **WHEN** scheduling an interview, creating a follow-up reminder, completing a follow-up reminder, or adding a note fails while writing the timeline event
- **THEN** the detail record change SHALL be rolled back
