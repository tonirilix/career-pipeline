## ADDED Requirements

### Requirement: Search topics capture reusable role discovery intent
The system SHALL allow the user to create and update saved search topics that describe role discovery targets, including name, target titles, preferred stack, location, remote preference, employment type, company type, compensation expectation, seniority, and notes.

#### Scenario: Search topic is created
- **WHEN** the user creates a search topic with target role criteria
- **THEN** the backend SHALL persist the topic and return it with all structured criteria and timestamps

#### Scenario: Search topic is updated
- **WHEN** the user edits an existing search topic
- **THEN** the backend SHALL persist the updated criteria without changing role records already created from the prior topic state

### Requirement: Search topics are listable for role intake workflows
The system SHALL expose saved search topics through the backend API and frontend data access layer so role intake can associate a role with the topic that found or inspired it.

#### Scenario: Search topics are listed
- **WHEN** the role discovery workspace loads
- **THEN** the system SHALL return saved search topics ordered consistently with recently updated topics first

#### Scenario: Role intake can reference a search topic
- **WHEN** the user creates a role record from a saved search topic
- **THEN** the role record SHALL store the search topic identifier as optional source context

### Requirement: Search topics support user-triggered search but not autonomous scans
The system SHALL treat search topics as saved configuration that can be used by explicit user-triggered role search runs, and SHALL NOT run scheduled scans, crawlers, or autonomous job board searches from them.

#### Scenario: Topic is saved without running a scan
- **WHEN** the user creates or updates a search topic
- **THEN** the system SHALL persist the topic without starting a background job or external scraping workflow

#### Scenario: Topic is used for explicit search
- **WHEN** the user triggers search from a saved topic
- **THEN** the system SHALL use the topic criteria as input to the limited role search workflow
