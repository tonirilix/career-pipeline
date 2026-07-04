## ADDED Requirements

### Requirement: AI artifacts persist generated outputs as durable domain objects
The system SHALL persist AI artifacts with stable ids, artifact type, owner type, owner id, title, source inputs, generated content, user-edited content, status, sensitivity flag, timestamps, and provenance metadata.

#### Scenario: AI artifact is created
- **WHEN** an AI workflow or user action creates an AI artifact
- **THEN** the backend SHALL persist the artifact with generated content, owner relationship, artifact type, and provenance metadata

#### Scenario: AI artifact is retrieved by owner
- **WHEN** the frontend requests AI artifacts for a specific owner type and owner id
- **THEN** the backend SHALL return artifacts attached to that owner without returning artifacts for unrelated owners

### Requirement: User-edited artifact content is preserved separately
The system SHALL preserve generated content separately from user-edited content so future workflows can distinguish model output from user-approved or user-modified text.

#### Scenario: User edits generated artifact
- **WHEN** the user edits an AI artifact
- **THEN** the backend SHALL store the edited content without overwriting the original generated content

#### Scenario: Artifact display prefers edited content
- **WHEN** an AI artifact has user-edited content
- **THEN** the frontend SHALL display the edited content as the artifact's current content while keeping generated content available in the artifact data

### Requirement: Artifact approval and supersession are explicit
The system SHALL track whether an AI artifact is draft, approved, rejected, or superseded, and SHALL allow a superseded artifact to reference its replacement.

#### Scenario: Artifact is approved
- **WHEN** the user approves an AI artifact
- **THEN** the backend SHALL persist the artifact status as approved

#### Scenario: Artifact is superseded
- **WHEN** a newer artifact replaces an existing artifact
- **THEN** the backend SHALL mark the original artifact as superseded and store a reference to the replacement artifact

### Requirement: Artifact provenance is available for audit and future indexing
The system SHALL store artifact provenance, including source input references, provider name, model name, prompt or template identifier when available, and usage metadata when available.

#### Scenario: Artifact includes provider provenance
- **WHEN** an artifact is created from an AI provider response
- **THEN** the artifact SHALL store provider and model metadata when those values are available

#### Scenario: Artifact records source inputs
- **WHEN** an artifact is generated from candidate memory, role details, application notes, or other domain records
- **THEN** the artifact SHALL store source input references sufficient for later audit and vector indexing

### Requirement: Artifacts are safe for future vector indexing
The system SHALL store artifact type, owner relationship, approval state, sensitivity flag, supersession state, and timestamps so a later vector retrieval change can index only eligible artifacts and return domain objects by id.

#### Scenario: Sensitive artifact remains identifiable
- **WHEN** an artifact is marked sensitive
- **THEN** future retrieval and indexing workflows SHALL be able to identify that sensitivity from artifact metadata

#### Scenario: Superseded artifact remains traceable
- **WHEN** an artifact is superseded
- **THEN** the system SHALL preserve the superseded artifact for audit while making its supersession state available to future retrieval workflows
