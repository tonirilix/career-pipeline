package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type CompleteFollowUpCommand struct {
	ApplicationID string
	ReminderID    string
}

type CompleteFollowUp struct {
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewCompleteFollowUp(tx ports.Transactor, clock ports.Clock, ids ports.IDGenerator) *CompleteFollowUp {
	return &CompleteFollowUp{tx: tx, clock: clock, ids: ids}
}

func (uc *CompleteFollowUp) Execute(ctx context.Context, cmd CompleteFollowUpCommand) (*domain.JobApplication, error) {
	var result *domain.JobApplication
	err := uc.tx.WithTransaction(ctx, func(ctx context.Context, repos ports.Repositories) error {
		app, err := repos.Applications.FindByID(ctx, cmd.ApplicationID)
		if err != nil {
			return err
		}

		now := uc.clock.Now()
		if err := repos.FollowUps.UpdateCompleted(ctx, cmd.ReminderID, now); err != nil {
			return err
		}

		event := &domain.TimelineEvent{
			ID:          uc.ids.New(),
			OccurredAt:  now,
			Description: "Completed follow-up reminder",
		}
		if err := repos.Timeline.Save(ctx, app.ID, event); err != nil {
			return err
		}

		loaded, err := NewFullApplicationAssembler(repos.FollowUps, repos.Timeline, repos.Interviews, repos.Notes).Load(ctx, app)
		if err != nil {
			return err
		}
		result = loaded
		return nil
	})
	return result, err
}
