## ADDED Requirements

### Requirement: Role records store pre-application opportunities
The system SHALL store role records independently from job applications. Each role record SHALL include id, company, title, posting URL, source, source kind, optional search topic id, description, raw source text, location, remote eligibility, employment type, seniority, compensation, stack, company type, freshness status, decision status, rejection reason, promoted application id, timestamps, and metadata for future indexing.

#### Scenario: Role record exists without application
- **WHEN** the user creates a role record
- **THEN** the backend SHALL persist the role without requiring a tracked job application

#### Scenario: Role record preserves source and normalized fields
- **WHEN** a role record is saved from intake
- **THEN** the system SHALL preserve both raw source text and editable normalized role metadata

### Requirement: Search result intake creates role records
The system SHALL create role records from limited role search provider results and SHALL preserve provider source, search topic id, normalized role metadata, raw source text when available, and freshness metadata when available.

#### Scenario: Provider result is imported
- **WHEN** a limited role search provider returns a role candidate
- **THEN** the backend SHALL create a role record in the role inbox using the provider result metadata

#### Scenario: Provider result remains editable
- **WHEN** a role is imported from a search result
- **THEN** the frontend SHALL allow the user to edit normalized role metadata after import

### Requirement: Manual URL intake creates role records
The system SHALL allow the user to create a role record from a manually entered job URL and editable metadata fields without requiring the backend to fetch or scrape the URL.

#### Scenario: URL-only role is created
- **WHEN** the user submits a posting URL with company and role title
- **THEN** the backend SHALL create a role record with that URL, source metadata, and a default freshness status of unknown unless explicitly provided

#### Scenario: URL intake does not scrape external pages
- **WHEN** a URL role intake command is handled
- **THEN** the system SHALL NOT depend on fetching or parsing the external job page to create the role record

### Requirement: Pasted description intake creates role records
The system SHALL allow the user to paste a job description and create a role record with raw source text plus editable normalized metadata.

#### Scenario: Pasted role is created
- **WHEN** the user submits a pasted job description with company and role title
- **THEN** the backend SHALL create a role record that stores the pasted description as raw source text and description content

#### Scenario: Pasted role has editable metadata
- **WHEN** the frontend displays the pasted role before or after saving
- **THEN** the user SHALL be able to edit normalized fields such as stack, location, employment type, seniority, compensation, and remote eligibility

### Requirement: Role intake detects obvious duplicate URLs
The system SHALL prevent creating duplicate active role records for the same non-empty posting URL unless the existing role is rejected or archived by a future workflow.

#### Scenario: Duplicate URL is submitted
- **WHEN** the user submits a role with a posting URL that already belongs to an active role record
- **THEN** the backend SHALL return the existing role or a domain error that allows the frontend to explain the duplicate

### Requirement: Role records preserve freshness metadata
The system SHALL store freshness status and last checked timestamp fields so future role freshness checks can update them without changing the role record shape.

#### Scenario: Freshness status is unknown at intake
- **WHEN** the user creates a role without validating whether the posting is still open
- **THEN** the role record SHALL retain freshness status as unknown and leave last checked timestamp empty

#### Scenario: Freshness metadata can be updated manually
- **WHEN** the user marks a role as live, closed, or unknown
- **THEN** the backend SHALL persist the freshness status and update the freshness checked timestamp when provided
