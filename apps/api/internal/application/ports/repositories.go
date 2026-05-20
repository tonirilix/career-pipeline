package ports

import (
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type ListApplicationsFilter struct {
	Stage      *domain.ApplicationStage
	Source     *domain.JobSource
	SearchTerm string
	SortBy     string
}

type JobApplicationRepository interface {
	Save(app *domain.JobApplication) error
	FindByID(id string) (*domain.JobApplication, error)
	List(filter ListApplicationsFilter) ([]*domain.JobApplication, error)
	UpdateStage(id string, stage domain.ApplicationStage) error
}

type InterviewRepository interface {
	Save(applicationID string, interview *domain.Interview) error
	FindByID(id string) (*domain.Interview, error)
	UpdateOutcome(id string, outcome domain.InterviewOutcome) error
	ListByApplication(applicationID string) ([]*domain.Interview, error)
}

type FollowUpRepository interface {
	Save(followUp *domain.FollowUpReminder) error
	FindByID(id string) (*domain.FollowUpReminder, error)
	UpdateCompleted(id string, completedAt time.Time) error
	ListByApplication(applicationID string) ([]*domain.FollowUpReminder, error)
	ListUpcoming(now time.Time) ([]*domain.FollowUpReminder, error)
	ListOverdue(now time.Time) ([]*domain.FollowUpReminder, error)
	DeactivateByApplication(applicationID string, completedAt time.Time) error
}

type NoteRepository interface {
	Save(applicationID string, note *domain.ApplicationNote) error
	ListByApplication(applicationID string) ([]*domain.ApplicationNote, error)
}

type TimelineRepository interface {
	Save(applicationID string, event *domain.TimelineEvent) error
	ListByApplication(applicationID string) ([]*domain.TimelineEvent, error)
}
