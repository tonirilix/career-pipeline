package resolvers

import (
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/graph/model"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func mapApplication(app *domain.JobApplication) *model.JobApplication {
	out := &model.JobApplication{
		ID:             app.ID,
		Company:        app.Company,
		RoleTitle:      app.RoleTitle,
		PostingURL:     app.PostingURL,
		Source:         string(app.Source),
		Location:       app.Location,
		Compensation:   app.Compensation,
		EmploymentType: string(app.EmploymentType),
		Stage:          string(app.Stage),
		Timeline:       make([]*model.TimelineEvent, len(app.Timeline)),
		Interviews:     make([]*model.Interview, len(app.Interviews)),
		FollowUps:      make([]*model.FollowUpReminder, len(app.FollowUps)),
		Notes:          make([]*model.ApplicationNote, len(app.Notes)),
	}
	for i, e := range app.Timeline {
		out.Timeline[i] = &model.TimelineEvent{
			ID:          e.ID,
			OccurredAt:  e.OccurredAt.UTC().Format(time.RFC3339),
			Description: e.Description,
		}
	}
	for i, iv := range app.Interviews {
		out.Interviews[i] = &model.Interview{
			ID:          iv.ID,
			Type:        string(iv.Type),
			ScheduledAt: iv.ScheduledAt.UTC().Format(time.RFC3339),
			Notes:       iv.Notes,
			Outcome:     string(iv.Outcome),
		}
	}
	for i, fu := range app.FollowUps {
		gfu := &model.FollowUpReminder{
			ID:            fu.ID,
			ApplicationID: fu.ApplicationID,
			DueAt:         fu.DueAt.UTC().Format(time.RFC3339),
			Note:          fu.Note,
		}
		if fu.CompletedAt != nil {
			s := fu.CompletedAt.UTC().Format(time.RFC3339)
			gfu.CompletedAt = &s
		}
		out.FollowUps[i] = gfu
	}
	for i, n := range app.Notes {
		out.Notes[i] = &model.ApplicationNote{
			ID:        n.ID,
			Body:      n.Body,
			CreatedAt: n.CreatedAt.UTC().Format(time.RFC3339),
		}
	}
	return out
}
