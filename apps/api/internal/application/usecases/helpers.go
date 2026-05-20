package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

// loadFullApplication populates Timeline, Interviews, FollowUps, and Notes on app.
// Pass nil for any repo to skip loading that collection.
func loadFullApplication(
	app *domain.JobApplication,
	_ ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
) (*domain.JobApplication, error) {
	if timeline != nil {
		events, err := timeline.ListByApplication(app.ID)
		if err != nil {
			return nil, err
		}
		app.Timeline = derefTimelineEvents(events)
	}

	if interviews != nil {
		ivs, err := interviews.ListByApplication(app.ID)
		if err != nil {
			return nil, err
		}
		app.Interviews = derefInterviews(ivs)
	}

	if followUps != nil {
		fus, err := followUps.ListByApplication(app.ID)
		if err != nil {
			return nil, err
		}
		app.FollowUps = derefFollowUps(fus)
	}

	if notes != nil {
		ns, err := notes.ListByApplication(app.ID)
		if err != nil {
			return nil, err
		}
		app.Notes = derefNotes(ns)
	}

	return app, nil
}

func derefTimelineEvents(ptrs []*domain.TimelineEvent) []domain.TimelineEvent {
	out := make([]domain.TimelineEvent, len(ptrs))
	for i, p := range ptrs {
		out[i] = *p
	}
	return out
}

func derefInterviews(ptrs []*domain.Interview) []domain.Interview {
	out := make([]domain.Interview, len(ptrs))
	for i, p := range ptrs {
		out[i] = *p
	}
	return out
}

func derefFollowUps(ptrs []*domain.FollowUpReminder) []domain.FollowUpReminder {
	out := make([]domain.FollowUpReminder, len(ptrs))
	for i, p := range ptrs {
		out[i] = *p
	}
	return out
}

func derefNotes(ptrs []*domain.ApplicationNote) []domain.ApplicationNote {
	out := make([]domain.ApplicationNote, len(ptrs))
	for i, p := range ptrs {
		out[i] = *p
	}
	return out
}
