package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type CreateFollowUpCommand struct {
	ApplicationID string
	DueAt         string
	Note          string
}

type AddFollowUp struct {
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewAddFollowUp(tx ports.Transactor, clock ports.Clock, ids ports.IDGenerator) *AddFollowUp {
	return &AddFollowUp{tx: tx, clock: clock, ids: ids}
}

func (uc *AddFollowUp) Execute(ctx context.Context, cmd CreateFollowUpCommand) (*domain.JobApplication, error) {
	dueAt, err := parseTime(cmd.DueAt)
	if err != nil {
		return nil, err
	}

	var result *domain.JobApplication
	err = uc.tx.WithTransaction(ctx, func(ctx context.Context, repos ports.Repositories) error {
		app, err := repos.Applications.FindByID(ctx, cmd.ApplicationID)
		if err != nil {
			return err
		}

		if domain.IsClosedStage(app.Stage) {
			return domain.ErrCannotCreateWork
		}

		events, err := repos.Timeline.ListByApplication(ctx, app.ID)
		if err != nil {
			return err
		}
		if latest := latestEventTime(events); latest != nil && !dueAt.After(*latest) {
			return domain.ErrDueDateInPast
		}

		followUp := &domain.FollowUpReminder{
			ID:            uc.ids.New(),
			ApplicationID: app.ID,
			DueAt:         dueAt,
			Note:          cmd.Note,
		}
		if err := repos.FollowUps.Save(ctx, followUp); err != nil {
			return err
		}

		event := &domain.TimelineEvent{
			ID:          uc.ids.New(),
			OccurredAt:  uc.clock.Now(),
			Description: "Created follow-up reminder",
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
