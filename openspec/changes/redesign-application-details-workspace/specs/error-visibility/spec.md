## ADDED Requirements

### Requirement: Details date and time validation is user-facing
The system SHALL validate missing detail-workflow date and time inputs before or during command execution and SHALL display user-facing messages instead of raw parsing errors.

#### Scenario: Missing follow-up date or time shows clear error
- **WHEN** the user submits a follow-up without a date or time
- **THEN** the details workspace SHALL display a message explaining that the follow-up date and time are required

#### Scenario: Missing interview date or time shows clear error
- **WHEN** the user submits an interview without a date or time
- **THEN** the details workspace SHALL display a message explaining that the interview date and time are required

#### Scenario: Raw parse errors are not shown
- **WHEN** a date/time value cannot be parsed for a details workflow
- **THEN** the user-facing alert SHALL not display raw implementation text such as parser internals

## MODIFIED Requirements

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
- **WHEN** adding a note, creating a follow-up, scheduling an interview, or recording an interview outcome fails from the application details workspace
- **THEN** the active details section SHALL display an alert containing the failure message near the failed action

### Requirement: Failed detail forms preserve user input
The system SHALL preserve local detail-panel form input when a note, follow-up, interview scheduling, or interview outcome command fails.

#### Scenario: Note text remains after failure
- **WHEN** adding an application note fails
- **THEN** the note text entered by the user SHALL remain in the note field

#### Scenario: Follow-up fields remain after failure
- **WHEN** creating a follow-up reminder fails
- **THEN** the due date, time, and note entered by the user SHALL remain in the follow-up fields

#### Scenario: Interview scheduling fields remain after failure
- **WHEN** scheduling an interview fails
- **THEN** the interview type, date, time, and notes entered by the user SHALL remain in the interview fields

#### Scenario: Interview outcome fields remain after failure
- **WHEN** recording an interview outcome fails
- **THEN** the selected outcome and notes entered by the user SHALL remain in the outcome form
