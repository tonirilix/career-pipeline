# Responsive Slide Over

## Purpose
Defines the responsive behaviour of the SlideOver panel: full-screen on mobile viewports, with an accessible close button, while preserving existing focus trap and keyboard behaviour at all sizes.

---

## Requirements

### Requirement: SlideOver panel is full-screen on mobile
The system SHALL render the SlideOver panel occupying the full viewport on viewports narrower than 768px instead of the fixed-width right-anchored overlay.

#### Scenario: Slide-over fills the viewport on mobile
- **WHEN** a SlideOver is opened on a viewport narrower than 768px
- **THEN** the panel SHALL cover the full viewport width and height (inset-0)

#### Scenario: Slide-over retains fixed-width overlay on desktop
- **WHEN** a SlideOver is opened on a viewport 768px or wider
- **THEN** the panel SHALL render as a fixed-width right-anchored overlay, unchanged from current behavior

---

### Requirement: SlideOver close button is accessible on mobile
The system SHALL position the close button at the top of the panel on mobile so it is reachable without scrolling, and SHALL meet the 44×44px minimum touch target size.

#### Scenario: Close button is at the top of the panel on mobile
- **WHEN** a SlideOver is open on mobile
- **THEN** the close button SHALL be visible near the top of the panel without scrolling

#### Scenario: Close button meets touch target size
- **WHEN** a SlideOver is open on mobile
- **THEN** the close button SHALL have a minimum height and width of 44px

---

### Requirement: Existing focus trap and keyboard behavior are preserved at all sizes
The system SHALL retain the existing focus trap, Escape key handling, and focus restoration behavior of SlideOver at all viewport sizes.

#### Scenario: Escape key closes slide-over on mobile
- **WHEN** a SlideOver is open on mobile and the user presses Escape
- **THEN** the panel SHALL close

#### Scenario: Focus is trapped inside the panel on mobile
- **WHEN** a SlideOver is open on mobile
- **THEN** Tab navigation SHALL cycle only through focusable elements inside the panel
