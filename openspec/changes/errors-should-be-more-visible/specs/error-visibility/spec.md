## ADDED Requirements

### Requirement: Workflow errors are visible near the failed action
The system SHALL render validation, load, and command failures in the active workflow where the failure happened.

#### Scenario: Main pipeline load failure is visible
- **WHEN** loading saved opportunities fails
- **THEN** the main content area SHALL display an alert describing that saved opportunities could not be loaded

#### Scenario: Stage transition failure is visible
- **WHEN** changing an application's stage fails
- **THEN** the main content area SHALL display an alert containing the failure message

#### Scenario: Add-opportunity validation failure is visible
- **WHEN** the user submits an invalid opportunity form
- **THEN** the add-opportunity slide-over SHALL display the validation messages inside the form

#### Scenario: Add-opportunity command failure is visible
- **WHEN** saving a valid opportunity fails
- **THEN** the add-opportunity slide-over SHALL display an alert containing the command failure message

#### Scenario: Details workflow failure is visible
- **WHEN** adding a note, creating a follow-up, or scheduling an interview fails from the application details slide-over
- **THEN** the application details slide-over SHALL display an alert containing the failure message

### Requirement: Failed detail forms preserve user input
The system SHALL preserve local detail-panel form input when a note, follow-up, or interview command fails.

#### Scenario: Note text remains after failure
- **WHEN** adding an application note fails
- **THEN** the note text entered by the user SHALL remain in the note field

#### Scenario: Follow-up fields remain after failure
- **WHEN** creating a follow-up reminder fails
- **THEN** the due date and note entered by the user SHALL remain in the follow-up fields

#### Scenario: Interview fields remain after failure
- **WHEN** scheduling an interview fails
- **THEN** the interview type, date, notes, and outcome entered by the user SHALL remain in the interview fields

### Requirement: Error alerts are persistent until resolved
The system SHALL keep a workflow error visible until the related workflow is retried, succeeds, or is closed.

#### Scenario: Details error remains visible
- **WHEN** a details workflow command fails
- **THEN** its error alert SHALL remain visible while the details slide-over stays open and before another details command attempt starts

#### Scenario: Details error clears after success
- **WHEN** a details workflow command succeeds after a previous details error
- **THEN** the details error alert SHALL be removed

#### Scenario: Form error clears on close
- **WHEN** the user closes the add-opportunity slide-over
- **THEN** any add-opportunity validation or command error SHALL be cleared before the form is opened again
