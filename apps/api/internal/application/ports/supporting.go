package ports

import "time"

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
	WithTransaction(fn func(repos Repositories) error) error
}
