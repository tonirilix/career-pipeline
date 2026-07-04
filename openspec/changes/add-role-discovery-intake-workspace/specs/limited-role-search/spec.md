## ADDED Requirements

### Requirement: Role search runs from a saved search topic
The system SHALL allow the user to trigger a role search from a saved search topic. The search run SHALL use the topic criteria, optional run parameters, and a backend role search provider boundary to return role candidates.

#### Scenario: User triggers role search
- **WHEN** the user runs search from a saved search topic
- **THEN** the backend SHALL call the configured role search provider with the topic criteria and return a search result summary

#### Scenario: Search topic is missing
- **WHEN** the user runs search for a search topic that does not exist
- **THEN** the backend SHALL return a search-topic-not-found error without calling the provider

### Requirement: Search results are imported as role records
The system SHALL convert role search provider results into role records in the role inbox, preserving provider source, search topic id, normalized metadata, raw source text when available, freshness metadata, and timestamps.

#### Scenario: Search returns new roles
- **WHEN** the role search provider returns new role candidates
- **THEN** the backend SHALL persist those candidates as role records associated with the source search topic

#### Scenario: Search returns duplicate URLs
- **WHEN** a provider result has a posting URL that already belongs to an active role record
- **THEN** the backend SHALL skip or report the duplicate without creating another active role record

#### Scenario: Search result lacks freshness proof
- **WHEN** a provider result does not include validated freshness data
- **THEN** the imported role SHALL use freshness status unknown

### Requirement: Role search provider is replaceable and testable
The backend SHALL define an application-layer role search provider port so concrete search providers, fake providers, and future scraping or API-backed providers remain outside domain logic.

#### Scenario: Use case uses provider port
- **WHEN** a role search use case needs possible roles
- **THEN** it SHALL call the role search provider port rather than a concrete scraping library or external API directly

#### Scenario: Tests use fake provider
- **WHEN** role search use case tests run
- **THEN** they SHALL be able to provide fake search results without network access

### Requirement: Role search remains user-triggered in this change
The system SHALL NOT run scheduled, autonomous, or background role searches in this change.

#### Scenario: Search topic is saved
- **WHEN** the user creates or updates a search topic
- **THEN** the system SHALL NOT automatically run a search

#### Scenario: App is opened
- **WHEN** the user opens the role discovery workspace
- **THEN** the system SHALL NOT start a role search until the user explicitly triggers one

### Requirement: Search run results are visible to the user
The frontend SHALL show loading, success, duplicate/skipped count, imported count, and error states for user-triggered role search runs.

#### Scenario: Search is running
- **WHEN** a role search request is in flight
- **THEN** the frontend SHALL show a loading state for that search topic

#### Scenario: Search completes
- **WHEN** a role search imports roles and skips duplicates
- **THEN** the frontend SHALL show how many roles were imported and how many were skipped or already existed

#### Scenario: Search provider fails
- **WHEN** the configured role search provider returns an error
- **THEN** the frontend SHALL show a visible error without deleting existing topic or role records
