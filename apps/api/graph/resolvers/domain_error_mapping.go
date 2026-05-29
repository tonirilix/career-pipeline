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
	default:
		return err
	}
}
