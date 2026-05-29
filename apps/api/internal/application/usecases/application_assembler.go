package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type FullApplicationAssembler struct {
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	interviews ports.InterviewRepository
	notes      ports.NoteRepository
}

func NewFullApplicationAssembler(
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
) *FullApplicationAssembler {
	return &FullApplicationAssembler{
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
	}
}

func (a *FullApplicationAssembler) Load(ctx context.Context, app *domain.JobApplication) (*domain.JobApplication, error) {
	if a.timeline != nil {
		events, err := a.timeline.ListByApplication(ctx, app.ID)
		if err != nil {
			return nil, err
		}
		app.Timeline = derefTimelineEvents(events)
	}

	if a.interviews != nil {
		ivs, err := a.interviews.ListByApplication(ctx, app.ID)
		if err != nil {
			return nil, err
		}
		app.Interviews = derefInterviews(ivs)
	}

	if a.followUps != nil {
		fus, err := a.followUps.ListByApplication(ctx, app.ID)
		if err != nil {
			return nil, err
		}
		app.FollowUps = derefFollowUps(fus)
	}

	if a.notes != nil {
		ns, err := a.notes.ListByApplication(ctx, app.ID)
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
