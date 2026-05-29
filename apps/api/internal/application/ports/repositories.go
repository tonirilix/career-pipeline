package ports

import (
	"context"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type ListApplicationsFilter struct {
	Stage      *domain.ApplicationStage
	Source     *domain.JobSource
	SearchTerm string
	SortBy     string
}

type JobApplicationRepository interface {
	Save(ctx context.Context, app *domain.JobApplication) error
	FindByID(ctx context.Context, id string) (*domain.JobApplication, error)
	List(ctx context.Context, filter ListApplicationsFilter) ([]*domain.JobApplication, error)
	UpdateStage(ctx context.Context, id string, stage domain.ApplicationStage) error
}

type InterviewRepository interface {
	Save(ctx context.Context, applicationID string, interview *domain.Interview) error
	FindByID(ctx context.Context, id string) (*domain.Interview, error)
	UpdateOutcome(ctx context.Context, id string, outcome domain.InterviewOutcome) error
	ListByApplication(ctx context.Context, applicationID string) ([]*domain.Interview, error)
}

type FollowUpRepository interface {
	Save(ctx context.Context, followUp *domain.FollowUpReminder) error
	FindByID(ctx context.Context, id string) (*domain.FollowUpReminder, error)
	UpdateCompleted(ctx context.Context, id string, completedAt time.Time) error
	ListByApplication(ctx context.Context, applicationID string) ([]*domain.FollowUpReminder, error)
	ListUpcoming(ctx context.Context, now time.Time) ([]*domain.FollowUpReminder, error)
	ListOverdue(ctx context.Context, now time.Time) ([]*domain.FollowUpReminder, error)
	DeactivateByApplication(ctx context.Context, applicationID string, completedAt time.Time) error
}

type NoteRepository interface {
	Save(ctx context.Context, applicationID string, note *domain.ApplicationNote) error
	ListByApplication(ctx context.Context, applicationID string) ([]*domain.ApplicationNote, error)
}

type TimelineRepository interface {
	Save(ctx context.Context, applicationID string, event *domain.TimelineEvent) error
	ListByApplication(ctx context.Context, applicationID string) ([]*domain.TimelineEvent, error)
}
