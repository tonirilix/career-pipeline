## ADDED Requirements

### Requirement: Meaningful text tokens meet WCAG AA contrast
The design system SHALL define text color tokens so meaningful rendered text meets WCAG AA contrast for normal text against every dark surface where the token is used.

#### Scenario: Muted foreground passes on app surfaces
- **WHEN** text rendered with the `muted-foreground` token appears on the `background`, `card`, or `muted` surface token
- **THEN** the contrast ratio SHALL be at least 4.5:1

#### Scenario: Role title passes contrast
- **WHEN** an `ApplicationCard` displays a role title using the muted foreground visual treatment
- **THEN** the rendered role title SHALL have a contrast ratio of at least 4.5:1 against the card background

### Requirement: Form controls expose stable browser form metadata
The system SHALL provide stable `id` or `name` attributes for visible form controls and appropriate `autocomplete` attributes for user-input fields where a standard autocomplete purpose exists.

#### Scenario: Pipeline controls expose field metadata
- **WHEN** the pipeline filter, search, and sort controls are rendered
- **THEN** each visible form control SHALL have a stable `id` or `name` attribute in addition to its accessible label

#### Scenario: Opportunity form supports browser autofill metadata
- **WHEN** the opportunity form is rendered
- **THEN** user-input fields with standard browser autocomplete purposes SHALL declare appropriate `autocomplete` attributes

### Requirement: ARIA attributes are only used on supported elements
The system SHALL avoid ARIA attributes on elements where the attribute is unsupported or not well supported by the element's implicit role.

#### Scenario: Stage count text avoids unsupported aria-label
- **WHEN** a pipeline stage count is rendered as plain text
- **THEN** it SHALL NOT use `aria-label` on a non-semantic `span` without a valid role

#### Scenario: Automated accessibility scan has no prohibited ARIA failures
- **WHEN** the accessibility guardrail runs against the rendered pipeline board
- **THEN** it SHALL report no `aria-prohibited-attr` violations for stage count text
