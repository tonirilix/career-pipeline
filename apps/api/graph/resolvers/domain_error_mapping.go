package resolvers

import (
	"errors"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func mapDomainError(err error) error {
	switch {
	case errors.Is(err, domain.ErrApplicationNotFound):
		return errors.New("application could not be found")
	case errors.Is(err, domain.ErrInvalidStageTransition):
		return errors.New("invalid stage transition")
	case errors.Is(err, domain.ErrCannotSchedule):
		return errors.New("interviews can only be scheduled for active applications before the offer stage")
	case errors.Is(err, domain.ErrCannotCreateWork):
		return errors.New("active work can only be created for active applications")
	case errors.Is(err, domain.ErrInvalidOutcome):
		return errors.New("interview outcome must be a final result")
	case errors.Is(err, domain.ErrNoteBodyEmpty):
		return errors.New("note body must not be empty")
	case errors.Is(err, domain.ErrCompanyRequired):
		return errors.New("company is required")
	case errors.Is(err, domain.ErrRoleTitleRequired):
		return errors.New("role title is required")
	case errors.Is(err, domain.ErrDueDateInPast):
		return errors.New("follow-up due date must be after the latest interaction")
	case errors.Is(err, domain.ErrCandidateProfileNotFound):
		return errors.New("candidate profile could not be found")
	case errors.Is(err, domain.ErrMemoryRecordNotFound):
		return errors.New("candidate memory record could not be found")
	case errors.Is(err, domain.ErrAIArtifactNotFound):
		return errors.New("AI artifact could not be found")
	case errors.Is(err, domain.ErrInvalidArtifactStatus):
		return errors.New("AI artifact status is invalid")
	case errors.Is(err, domain.ErrInvalidMemoryType):
		return errors.New("candidate memory type is invalid")
	case errors.Is(err, domain.ErrInvalidArtifactType):
		return errors.New("AI artifact type is invalid")
	case errors.Is(err, domain.ErrArtifactSupersedeRequired):
		return errors.New("use supersede to mark an AI artifact as superseded")
	case errors.Is(err, domain.ErrMemoryRecordNotCurrent):
		return errors.New("archived or superseded memory records cannot be edited")
	default:
		return err
	}
}
