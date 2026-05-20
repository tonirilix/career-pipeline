package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type GetApplication struct {
	apps       ports.JobApplicationRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	interviews ports.InterviewRepository
	notes      ports.NoteRepository
}

func NewGetApplication(
	apps ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
) *GetApplication {
	return &GetApplication{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
	}
}

func (uc *GetApplication) Execute(id string) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(id)
	if err != nil {
		return nil, err
	}
	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
