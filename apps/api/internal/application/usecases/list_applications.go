package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type ListApplications struct {
	apps       ports.JobApplicationRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	interviews ports.InterviewRepository
	notes      ports.NoteRepository
}

func NewListApplications(
	apps ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
) *ListApplications {
	return &ListApplications{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
	}
}

func (uc *ListApplications) Execute(filter ports.ListApplicationsFilter) ([]*domain.JobApplication, error) {
	list, err := uc.apps.List(filter)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.JobApplication, 0, len(list))
	for _, app := range list {
		full, err := loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
		if err != nil {
			return nil, err
		}
		result = append(result, full)
	}
	return result, nil
}
