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
		return errors.New("interviews can only be scheduled after an opportunity has been applied to")
	case errors.Is(err, domain.ErrNoteBodyEmpty):
		return errors.New("note body must not be empty")
	case errors.Is(err, domain.ErrDueDateInPast):
		return errors.New("follow-up due date must be after the latest interaction")
	default:
		return err
	}
}
