package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type CompleteFollowUpCommand struct {
	ApplicationID string
	ReminderID    string
}

type CompleteFollowUp struct {
	apps       ports.JobApplicationRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	interviews ports.InterviewRepository
	notes      ports.NoteRepository
	clock      ports.Clock
	ids        ports.IDGenerator
}

func NewCompleteFollowUp(
	apps ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *CompleteFollowUp {
	return &CompleteFollowUp{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
		clock:      clock,
		ids:        ids,
	}
}

func (uc *CompleteFollowUp) Execute(cmd CompleteFollowUpCommand) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(cmd.ApplicationID)
	if err != nil {
		return nil, err
	}

	now := uc.clock.Now()
	if err := uc.followUps.UpdateCompleted(cmd.ReminderID, now); err != nil {
		return nil, err
	}

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  now,
		Description: "Completed follow-up reminder",
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}

	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
