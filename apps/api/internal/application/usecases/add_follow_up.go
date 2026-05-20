package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type CreateFollowUpCommand struct {
	ApplicationID string
	DueAt         string
	Note          string
}

type AddFollowUp struct {
	apps      ports.JobApplicationRepository
	followUps ports.FollowUpRepository
	timeline  ports.TimelineRepository
	interviews ports.InterviewRepository
	notes     ports.NoteRepository
	clock     ports.Clock
	ids       ports.IDGenerator
}

func NewAddFollowUp(
	apps ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *AddFollowUp {
	return &AddFollowUp{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
		clock:      clock,
		ids:        ids,
	}
}

func (uc *AddFollowUp) Execute(cmd CreateFollowUpCommand) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(cmd.ApplicationID)
	if err != nil {
		return nil, err
	}

	dueAt, err := parseTime(cmd.DueAt)
	if err != nil {
		return nil, err
	}

	// Validate: dueAt must be after the latest timeline interaction
	events, err := uc.timeline.ListByApplication(app.ID)
	if err != nil {
		return nil, err
	}
	if latest := latestEventTime(events); latest != nil && !dueAt.After(*latest) {
		return nil, domain.ErrDueDateInPast
	}

	followUp := &domain.FollowUpReminder{
		ID:            uc.ids.New(),
		ApplicationID: app.ID,
		DueAt:         dueAt,
		Note:          cmd.Note,
	}
	if err := uc.followUps.Save(followUp); err != nil {
		return nil, err
	}

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  uc.clock.Now(),
		Description: "Created follow-up reminder",
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}

	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
