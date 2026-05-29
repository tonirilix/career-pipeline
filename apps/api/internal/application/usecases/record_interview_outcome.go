package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type RecordInterviewOutcomeCommand struct {
	ApplicationID string
	InterviewID   string
	Outcome       domain.InterviewOutcome
}

type RecordInterviewOutcome struct {
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewRecordInterviewOutcome(tx ports.Transactor, clock ports.Clock, ids ports.IDGenerator) *RecordInterviewOutcome {
	return &RecordInterviewOutcome{tx: tx, clock: clock, ids: ids}
}

func (uc *RecordInterviewOutcome) Execute(ctx context.Context, cmd RecordInterviewOutcomeCommand) (*domain.JobApplication, error) {
	if cmd.Outcome == domain.OutcomeScheduled {
		return nil, domain.ErrInvalidOutcome
	}

	var result *domain.JobApplication
	err := uc.tx.WithTransaction(ctx, func(ctx context.Context, repos ports.Repositories) error {
		app, err := repos.Applications.FindByID(ctx, cmd.ApplicationID)
		if err != nil {
			return err
		}

		if err := repos.Interviews.UpdateOutcome(ctx, cmd.InterviewID, cmd.Outcome); err != nil {
			return err
		}

		event := &domain.TimelineEvent{
			ID:          uc.ids.New(),
			OccurredAt:  uc.clock.Now(),
			Description: "Recorded interview outcome: " + string(cmd.Outcome),
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
