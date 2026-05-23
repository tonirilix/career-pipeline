# mutation-loading-states Specification

## Purpose
TBD - created by syncing change expose-mutation-loading-states. Update Purpose after review.

## Requirements

### Requirement: Pipeline workspace exposes per-mutation status transitions
The Pipeline workspace module SHALL return a `CommandStatus` value (`'idle' | 'pending' | 'error' | 'success'`) for each of its 6 mutations so that UI controls can react to all state transitions, not just the pending state.

#### Scenario: Status values are idle when no mutation is running
- **WHEN** no command is in progress
- **THEN** `submitOpportunityStatus`, `changeStageStatus`, `scheduleInterviewStatus`, `createFollowUpStatus`, `completeFollowUpStatus`, and `addNoteStatus` SHALL all be `'idle'`

#### Scenario: Status is pending while its mutation is in-flight
- **WHEN** a command mutation is pending (network request in-flight)
- **THEN** only the corresponding status value SHALL be `'pending'`; all other status values SHALL remain `'idle'`

#### Scenario: Status reflects success after mutation resolves successfully
- **WHEN** a command mutation resolves with a successful result
- **THEN** the corresponding status value SHALL transition to `'success'`

#### Scenario: Status reflects error after mutation resolves with failure
- **WHEN** a command mutation resolves with an error result
- **THEN** the corresponding status value SHALL transition to `'error'`

#### Scenario: Status resets to idle on next invocation
- **WHEN** a command is invoked again after a previous `'success'` or `'error'`
- **THEN** the corresponding status SHALL transition back to `'pending'` for the new invocation

### Requirement: UI controls are disabled while their mutation is pending
Each command control in the Pipeline board and details panel SHALL be disabled when the corresponding `CommandStatus` is `'pending'` to prevent double-submits.

#### Scenario: Submit opportunity button is disabled while pending
- **WHEN** `submitOpportunityStatus` is `'pending'`
- **THEN** the submit opportunity button SHALL be disabled

#### Scenario: Stage drag is disabled while stage change is pending
- **WHEN** `changeStageStatus` is `'pending'`
- **THEN** the stage drag source for that application SHALL not trigger a new stage change

#### Scenario: Interview form submit is disabled while pending
- **WHEN** `scheduleInterviewStatus` is `'pending'`
- **THEN** the schedule interview submit control SHALL be disabled

#### Scenario: Follow-up form submit is disabled while pending
- **WHEN** `createFollowUpStatus` is `'pending'`
- **THEN** the create follow-up submit control SHALL be disabled

#### Scenario: Complete follow-up action is disabled while pending
- **WHEN** `completeFollowUpStatus` is `'pending'`
- **THEN** the complete follow-up control SHALL be disabled

#### Scenario: Add note submit is disabled while pending
- **WHEN** `addNoteStatus` is `'pending'`
- **THEN** the add note submit control SHALL be disabled
