package usecases

import (
	"strings"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type ScheduleInterviewCommand struct {
	ApplicationID string
	Type          domain.InterviewType
	ScheduledAt   string
	Notes         string
}

type ScheduleInterview struct {
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewScheduleInterview(tx ports.Transactor, clock ports.Clock, ids ports.IDGenerator) *ScheduleInterview {
	return &ScheduleInterview{tx: tx, clock: clock, ids: ids}
}

func (uc *ScheduleInterview) Execute(cmd ScheduleInterviewCommand) (*domain.JobApplication, error) {
	if strings.TrimSpace(cmd.ScheduledAt) == "" {
		return nil, domain.ErrScheduledAtEmpty
	}

	scheduledAt, err := parseTime(cmd.ScheduledAt)
	if err != nil {
		return nil, err
	}

	var result *domain.JobApplication
	err = uc.tx.WithTransaction(func(repos ports.Repositories) error {
		app, err := repos.Applications.FindByID(cmd.ApplicationID)
		if err != nil {
			return err
		}

		if !isInterviewableStage(app.Stage) {
			return domain.ErrCannotSchedule
		}

		interview := &domain.Interview{
			ID:          uc.ids.New(),
			Type:        cmd.Type,
			ScheduledAt: scheduledAt,
			Notes:       cmd.Notes,
			Outcome:     domain.OutcomeScheduled,
		}
		if err := repos.Interviews.Save(app.ID, interview); err != nil {
			return err
		}

		event := &domain.TimelineEvent{
			ID:          uc.ids.New(),
			OccurredAt:  uc.clock.Now(),
			Description: "Scheduled " + string(cmd.Type) + " interview",
		}
		if err := repos.Timeline.Save(app.ID, event); err != nil {
			return err
		}

		loaded, err := NewFullApplicationAssembler(repos.FollowUps, repos.Timeline, repos.Interviews, repos.Notes).Load(app)
		if err != nil {
			return err
		}
		result = loaded
		return nil
	})
	return result, err
}

func isInterviewableStage(stage domain.ApplicationStage) bool {
	return stage == domain.StageApplied ||
		stage == domain.StageScreening ||
		stage == domain.StageTechnicalInterview ||
		stage == domain.StageOnsite
}
