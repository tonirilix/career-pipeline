package usecases

import (
	"fmt"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type AdvanceStageCommand struct {
	ApplicationID string
	ToStage       domain.ApplicationStage
}

type AdvanceStage struct {
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewAdvanceStage(
	tx ports.Transactor,
	clock ports.Clock,
	ids ports.IDGenerator,
) *AdvanceStage {
	return &AdvanceStage{tx: tx, clock: clock, ids: ids}
}

func (uc *AdvanceStage) Execute(cmd AdvanceStageCommand) (*domain.JobApplication, error) {
	var result *domain.JobApplication
	err := uc.tx.WithTransaction(func(repos ports.Repositories) error {
		app, err := repos.Applications.FindByID(cmd.ApplicationID)
		if err != nil {
			return err
		}

		if err := domain.ValidateStageTransition(app.Stage, cmd.ToStage); err != nil {
			return err
		}

		if err := repos.Applications.UpdateStage(app.ID, cmd.ToStage); err != nil {
			return err
		}

		now := uc.clock.Now()
		event := &domain.TimelineEvent{
			ID:          uc.ids.New(),
			OccurredAt:  now,
			Description: fmt.Sprintf("Moved from %s to %s", app.Stage, cmd.ToStage),
		}
		if err := repos.Timeline.Save(app.ID, event); err != nil {
			return err
		}

		if domain.IsClosedStage(cmd.ToStage) {
			if err := repos.FollowUps.DeactivateByApplication(app.ID, now); err != nil {
				return err
			}
		}

		app.Stage = cmd.ToStage
		loaded, err := NewFullApplicationAssembler(repos.FollowUps, repos.Timeline, repos.Interviews, repos.Notes).Load(app)
		if err != nil {
			return err
		}
		result = loaded
		return nil
	})
	return result, err
}
