# Workspace Routing

## Purpose
Defines route-backed navigation for the top-level frontend workspaces so users can refresh, share, and directly open specific screens.

---

## Requirements

### Requirement: Top-level workspaces are URL-addressable
The system SHALL expose stable client routes for the existing top-level workspaces: `/pipeline`, `/memory`, and `/roles`.

#### Scenario: Direct pipeline route renders pipeline workspace
- **WHEN** a user opens `/pipeline`
- **THEN** the main content SHALL render the pipeline workspace

#### Scenario: Direct memory route renders candidate memory workspace
- **WHEN** a user opens `/memory`
- **THEN** the main content SHALL render the candidate memory workspace

#### Scenario: Direct roles route renders role discovery workspace
- **WHEN** a user opens `/roles`
- **THEN** the main content SHALL render the role discovery workspace

### Requirement: Root route enters the pipeline workspace
The system SHALL treat `/` as an entry point to the pipeline workspace.

#### Scenario: Root route lands on pipeline
- **WHEN** a user opens `/`
- **THEN** the main content SHALL render the pipeline workspace

#### Scenario: Pipeline has a canonical route
- **WHEN** the user navigates from another workspace to the pipeline workspace
- **THEN** the browser location SHALL be `/pipeline`

### Requirement: Workspace navigation uses browser history
The system SHALL update browser history when users navigate among top-level workspaces.

#### Scenario: Navigating to memory updates location
- **WHEN** the user activates the Memory workspace navigation item
- **THEN** the browser location SHALL be `/memory`

#### Scenario: Navigating to roles updates location
- **WHEN** the user activates the Roles workspace navigation item
- **THEN** the browser location SHALL be `/roles`

#### Scenario: Back returns to previous workspace
- **WHEN** the user navigates from `/pipeline` to `/memory` and then uses browser Back
- **THEN** the main content SHALL render the pipeline workspace

### Requirement: Unknown workspace routes fail safely
The system SHALL handle unknown client routes without rendering an incorrect workspace as active.

#### Scenario: Unknown route shows not-found state
- **WHEN** a user opens an unsupported route such as `/unknown`
- **THEN** the app SHALL render a not-found state or redirect to a supported workspace
- **AND** no unsupported workspace navigation item SHALL be shown as active
