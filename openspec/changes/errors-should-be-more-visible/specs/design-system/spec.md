## ADDED Requirements

### Requirement: Error alerts use the destructive visual token
The system SHALL style user-facing validation, load, and command error messages with the `destructive` design token and a visible bordered alert treatment.

#### Scenario: Command error uses destructive token
- **WHEN** a command error is displayed in the main content area or a slide-over
- **THEN** the error text SHALL use the `destructive` token

#### Scenario: Validation error list uses destructive token
- **WHEN** validation errors are displayed in a form
- **THEN** the validation message text SHALL use the `destructive` token

### Requirement: Error messages expose alert semantics
The system SHALL expose user-facing command and validation error containers with alert semantics so assistive technologies announce failures.

#### Scenario: Command error has alert role
- **WHEN** a command error is displayed
- **THEN** the error container SHALL have `role="alert"`

#### Scenario: Validation error list has alert role
- **WHEN** validation errors are displayed
- **THEN** the validation error container SHALL have `role="alert"`
