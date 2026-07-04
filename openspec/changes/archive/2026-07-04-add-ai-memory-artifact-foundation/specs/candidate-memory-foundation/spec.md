## ADDED Requirements

### Requirement: Candidate profile stores authoritative AI grounding context
The system SHALL provide a single active candidate profile containing structured fields needed to ground future AI workflows, including target roles, preferred stack, compensation expectations, location and work constraints, company preferences, writing tone, and positioning summary.

#### Scenario: Candidate profile is retrieved
- **WHEN** the frontend requests the candidate profile
- **THEN** the backend SHALL return the active candidate profile with all structured grounding fields

#### Scenario: Candidate profile is updated
- **WHEN** the user updates candidate profile fields
- **THEN** the backend SHALL persist the changes and return the updated candidate profile

### Requirement: Structured memory records capture granular candidate facts
The system SHALL allow candidate memory records to be created, listed, updated, and archived. Each memory record SHALL include an id, memory type, title, body, source, approval state, sensitivity flag, current/superseded state, timestamps, and optional metadata for future indexing.

#### Scenario: Approved memory record is created
- **WHEN** the user creates a memory record marked as approved
- **THEN** the backend SHALL persist the record with its type, content, approval state, sensitivity flag, and source metadata

#### Scenario: Memory records are listed
- **WHEN** the frontend requests candidate memory records
- **THEN** the backend SHALL return the records ordered consistently with current records visible before archived or superseded records

#### Scenario: Memory record is superseded
- **WHEN** the user marks a memory record as superseded by another memory record
- **THEN** the backend SHALL preserve the original record and link it to the replacement record

### Requirement: AI grounding context uses current approved memory
The system SHALL expose an application-layer operation that assembles candidate grounding context from the active candidate profile and memory records that are approved and current.

#### Scenario: Grounding context excludes unapproved memory
- **WHEN** candidate grounding context is assembled
- **THEN** unapproved memory records SHALL be excluded from the default grounding context

#### Scenario: Grounding context excludes superseded memory
- **WHEN** candidate grounding context is assembled
- **THEN** superseded memory records SHALL be excluded from the default grounding context

#### Scenario: Sensitive memory remains identifiable
- **WHEN** sensitive memory records are included by an explicit future workflow
- **THEN** the grounding context SHALL preserve sensitivity metadata so the workflow can decide whether use is appropriate

### Requirement: Candidate memory is independent from job applications
The system SHALL model candidate profile and memory records independently from job applications so future role discovery, fit analysis, and application workflows can reuse the same candidate context.

#### Scenario: Candidate profile exists without applications
- **WHEN** the database has no job applications
- **THEN** the system SHALL still allow the active candidate profile and memory records to be created and retrieved

#### Scenario: Application data does not own candidate memory
- **WHEN** a job application is deleted or archived by a future workflow
- **THEN** candidate profile and memory records SHALL remain available unless explicitly changed through candidate memory operations
