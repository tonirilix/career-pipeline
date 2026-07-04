## ADDED Requirements

### Requirement: Backend defines an AI provider port
The backend SHALL define an application-layer AI provider port for text generation requests. Domain packages and GraphQL resolvers SHALL NOT depend directly on external AI provider SDKs.

#### Scenario: Use case calls AI through port
- **WHEN** a future AI use case needs generated text
- **THEN** it SHALL call the application-layer AI provider port rather than a provider SDK directly

#### Scenario: Domain remains provider agnostic
- **WHEN** the domain package is compiled
- **THEN** it SHALL contain no imports from OpenAI, Anthropic, Gemini, local model SDKs, or AI infrastructure packages

### Requirement: AI provider request includes explicit context and parameters
The AI provider port SHALL accept a request containing operation name, system instructions, user instructions, structured context references, model selection or model class, and generation parameters needed by future workflows.

#### Scenario: Provider receives structured generation request
- **WHEN** a use case calls the AI provider port
- **THEN** the provider SHALL receive explicit instructions, context, and generation parameters rather than relying on hidden global state

#### Scenario: Provider request can reference source records
- **WHEN** a generation request uses candidate memory or artifacts as context
- **THEN** the request SHALL be able to include source record references for provenance

### Requirement: AI provider response captures output and usage metadata
The AI provider port SHALL return generated content with provider name, model name, finish reason when available, usage metadata when available, and raw provider identifiers when available.

#### Scenario: Provider returns generated content
- **WHEN** an AI provider successfully generates text
- **THEN** the response SHALL include generated content and provider/model metadata

#### Scenario: Provider returns usage metadata
- **WHEN** the AI provider reports token or cost-related usage metadata
- **THEN** the response SHALL make that metadata available to callers for artifact provenance

### Requirement: AI provider is replaceable in tests and future deployments
The system SHALL support fake provider implementations for tests and SHALL keep concrete provider adapters behind composition/configuration boundaries.

#### Scenario: Use case test uses fake provider
- **WHEN** an AI use case test runs
- **THEN** it SHALL be able to provide a fake AI provider without network access

#### Scenario: Provider configuration is isolated
- **WHEN** provider credentials or model configuration are loaded
- **THEN** configuration concerns SHALL remain in infrastructure or composition code rather than domain code
