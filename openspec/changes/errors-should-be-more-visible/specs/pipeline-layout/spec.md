## ADDED Requirements

### Requirement: Slide-over workflow errors render inside the active panel
The system SHALL render errors produced by slide-over workflows inside the active `SlideOver` panel that contains the failed workflow.

#### Scenario: Opportunity form error stays inside add-opportunity panel
- **WHEN** saving an opportunity from the add-opportunity `SlideOver` fails
- **THEN** the visible error SHALL be rendered inside that `SlideOver`

#### Scenario: Application details error stays inside details panel
- **WHEN** a note, follow-up, or interview command from the application details `SlideOver` fails
- **THEN** the visible error SHALL be rendered inside that `SlideOver`

#### Scenario: Main board does not receive details workflow errors
- **WHEN** a command from the application details `SlideOver` fails
- **THEN** the main board alert region SHALL NOT be the only visible location for that error
