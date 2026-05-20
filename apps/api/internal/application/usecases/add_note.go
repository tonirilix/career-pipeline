package usecases

import (
	"strings"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type AddNoteCommand struct {
	ApplicationID string
	Body          string
}

type AddNote struct {
	apps       ports.JobApplicationRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	interviews ports.InterviewRepository
	notes      ports.NoteRepository
	clock      ports.Clock
	ids        ports.IDGenerator
}

func NewAddNote(
	apps ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *AddNote {
	return &AddNote{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
		clock:      clock,
		ids:        ids,
	}
}

func (uc *AddNote) Execute(cmd AddNoteCommand) (*domain.JobApplication, error) {
	if strings.TrimSpace(cmd.Body) == "" {
		return nil, domain.ErrNoteBodyEmpty
	}

	app, err := uc.apps.FindByID(cmd.ApplicationID)
	if err != nil {
		return nil, err
	}

	now := uc.clock.Now()
	note := &domain.ApplicationNote{
		ID:        uc.ids.New(),
		Body:      cmd.Body,
		CreatedAt: now,
	}
	if err := uc.notes.Save(app.ID, note); err != nil {
		return nil, err
	}

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  now,
		Description: "Added note",
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}

	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
