package domain

import "errors"

var (
	ErrApplicationNotFound = errors.New("application not found")
	ErrInterviewNotFound   = errors.New("interview not found")
	ErrFollowUpNotFound    = errors.New("follow-up not found")
	ErrNoteBodyEmpty       = errors.New("note body must not be empty")
	ErrDueDateInPast       = errors.New("follow-up due date must be after the latest interaction")
	ErrScheduledAtEmpty    = errors.New("interview scheduled date is required")
	ErrCannotSchedule      = errors.New("interviews can only be scheduled for active applications before the offer stage")
	ErrCannotCreateWork    = errors.New("active work can only be created for active applications")
	ErrInvalidOutcome      = errors.New("interview outcome must be a final result")
)
