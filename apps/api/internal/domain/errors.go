package domain

import "errors"

var (
	ErrApplicationNotFound       = errors.New("application not found")
	ErrInterviewNotFound         = errors.New("interview not found")
	ErrFollowUpNotFound          = errors.New("follow-up not found")
	ErrNoteBodyEmpty             = errors.New("note body must not be empty")
	ErrCompanyRequired           = errors.New("company is required")
	ErrRoleTitleRequired         = errors.New("role title is required")
	ErrDueDateInPast             = errors.New("follow-up due date must be after the latest interaction")
	ErrScheduledAtEmpty          = errors.New("interview scheduled date is required")
	ErrCannotSchedule            = errors.New("interviews can only be scheduled for active applications before the offer stage")
	ErrCannotCreateWork          = errors.New("active work can only be created for active applications")
	ErrInvalidOutcome            = errors.New("interview outcome must be a final result")
	ErrCandidateProfileNotFound  = errors.New("candidate profile not found")
	ErrMemoryRecordNotFound      = errors.New("candidate memory record not found")
	ErrAIArtifactNotFound        = errors.New("ai artifact not found")
	ErrInvalidArtifactStatus     = errors.New("invalid ai artifact status")
	ErrInvalidMemoryType         = errors.New("invalid candidate memory type")
	ErrInvalidArtifactType       = errors.New("invalid ai artifact type")
	ErrArtifactSupersedeRequired = errors.New("use supersede to mark an ai artifact as superseded")
	ErrMemoryRecordNotCurrent    = errors.New("archived or superseded memory records cannot be edited")
)
