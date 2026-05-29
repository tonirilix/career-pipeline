## ADDED Requirements

### Requirement: Details panel provides section navigation
The application details slide-over SHALL present application details as a workspace with clear navigation between focused sections instead of rendering all sections as one long mixed form.

#### Scenario: User switches details sections
- **WHEN** the user opens application details and chooses Notes, Follow-ups, Interviews, or Timeline
- **THEN** the panel SHALL show the selected section while preserving the application summary context

#### Scenario: Section navigation exposes counts
- **WHEN** the details workspace renders section navigation
- **THEN** sections for notes, follow-ups, interviews, and timeline SHALL expose counts for their current entries

### Requirement: Details workspace keeps application summary visible
The details workspace SHALL keep the selected application's company, role, stage, and key metadata available without forcing the user to leave the current section.

#### Scenario: Application context remains visible while viewing a section
- **WHEN** the user is viewing a non-overview details section
- **THEN** the workspace SHALL still identify the selected company, role, and current application stage

### Requirement: Detail creation forms open only by explicit action
The details workspace SHALL show existing entries and empty states first, and SHALL render note, follow-up, and interview creation forms only after the user starts the corresponding action.

#### Scenario: Notes form is hidden initially
- **WHEN** the user opens the Notes section
- **THEN** the note creation form SHALL not be visible until the user chooses to add a note

#### Scenario: Follow-up form is hidden initially
- **WHEN** the user opens the Follow-ups section
- **THEN** the follow-up creation form SHALL not be visible until the user chooses to create a follow-up

#### Scenario: Interview form is hidden initially
- **WHEN** the user opens the Interviews section
- **THEN** the interview scheduling form SHALL not be visible until the user chooses to schedule an interview

#### Scenario: User cancels a detail action
- **WHEN** a detail creation form is open and the user cancels it
- **THEN** the workspace SHALL return to the section entry list without submitting the form

### Requirement: Closed applications restrict active work actions
The details workspace SHALL prevent users from scheduling interviews or creating active follow-ups on closed applications while still allowing historical notes.

#### Scenario: Rejected application hides active work actions
- **WHEN** the selected application is Rejected
- **THEN** the details workspace SHALL not offer actions to schedule an interview or create a follow-up

#### Scenario: Withdrawn application hides active work actions
- **WHEN** the selected application is Withdrawn
- **THEN** the details workspace SHALL not offer actions to schedule an interview or create a follow-up

#### Scenario: Closed application allows notes
- **WHEN** the selected application is Rejected or Withdrawn
- **THEN** the details workspace SHALL allow the user to add a note

### Requirement: Interviews separate scheduling from outcome recording
The details workspace SHALL schedule interviews as pending future or historical events and SHALL record interview outcomes through a separate action on an existing interview.

#### Scenario: Scheduling an interview has no outcome selector
- **WHEN** the user starts the schedule-interview action
- **THEN** the form SHALL collect interview type, date, time, and notes without asking for an outcome

#### Scenario: New interview appears as scheduled
- **WHEN** an interview is scheduled successfully
- **THEN** the interview SHALL appear in the interview list with outcome `Scheduled`

#### Scenario: User records an interview outcome
- **WHEN** the user records `Passed`, `Rejected`, or `No decision` for an existing interview
- **THEN** the interview list SHALL update that interview's outcome without creating a new interview

### Requirement: Timeline remains read-only history
The details workspace SHALL present timeline events as read-only audit history.

#### Scenario: Timeline section has no creation form
- **WHEN** the user opens the Timeline section
- **THEN** the workspace SHALL show timeline events without offering a timeline creation form
