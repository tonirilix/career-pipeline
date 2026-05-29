## MODIFIED Requirements

### Requirement: Architecture tests protect deepened seams
The test suite SHALL include architecture or module-level tests that prevent the deepened modules from collapsing back into callers.

#### Scenario: Backend use cases avoid direct child repository loading
- **WHEN** backend architecture tests run
- **THEN** use cases that return full Job Applications SHALL NOT directly call every child repository for rehydration

#### Scenario: MSW does not own mock backend state
- **WHEN** frontend architecture tests run
- **THEN** MSW handler modules SHALL NOT own mutable Job Application mock state

#### Scenario: Application details workspace remains decomposed
- **WHEN** frontend architecture tests run
- **THEN** Application Details section rendering and workflow state SHALL remain in focused details workspace modules instead of returning to one monolithic `ApplicationDetails` implementation
