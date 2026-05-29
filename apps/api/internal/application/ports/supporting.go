package ports

import (
	"context"
	"time"
)

type Clock interface {
	Now() time.Time
}

type IDGenerator interface {
	New() string
}

type Repositories struct {
	Applications JobApplicationRepository
	Interviews   InterviewRepository
	FollowUps    FollowUpRepository
	Notes        NoteRepository
	Timeline     TimelineRepository
}

type Transactor interface {
	WithTransaction(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error
}
