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

type CandidateProfileRepository interface {
	GetActive(ctx context.Context) (*domain.CandidateProfile, error)
	Save(ctx context.Context, profile *domain.CandidateProfile) (*domain.CandidateProfile, error)
}

type CandidateMemoryRepository interface {
	Save(ctx context.Context, record *domain.CandidateMemoryRecord) (*domain.CandidateMemoryRecord, error)
	FindByID(ctx context.Context, id string) (*domain.CandidateMemoryRecord, error)
	List(ctx context.Context) ([]*domain.CandidateMemoryRecord, error)
	ListApprovedCurrent(ctx context.Context) ([]*domain.CandidateMemoryRecord, error)
	Update(ctx context.Context, record *domain.CandidateMemoryRecord) (*domain.CandidateMemoryRecord, error)
	Archive(ctx context.Context, id string, archivedAt time.Time) (*domain.CandidateMemoryRecord, error)
	Supersede(ctx context.Context, id string, supersededBy string, updatedAt time.Time) (*domain.CandidateMemoryRecord, error)
}

type AIArtifactRepository interface {
	Save(ctx context.Context, artifact *domain.AIArtifact) (*domain.AIArtifact, error)
	FindByID(ctx context.Context, id string) (*domain.AIArtifact, error)
	ListByOwner(ctx context.Context, owner domain.OwnerReference) ([]*domain.AIArtifact, error)
	UpdateEditedContent(ctx context.Context, id string, editedContent *string, updatedAt time.Time) (*domain.AIArtifact, error)
	UpdateStatus(ctx context.Context, id string, status domain.ArtifactStatus, updatedAt time.Time) (*domain.AIArtifact, error)
	Supersede(ctx context.Context, id string, supersededBy string, updatedAt time.Time) (*domain.AIArtifact, error)
}
