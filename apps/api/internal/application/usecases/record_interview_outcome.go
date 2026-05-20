package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type RecordInterviewOutcomeCommand struct {
	ApplicationID string
	InterviewID   string
	Outcome       domain.InterviewOutcome
}

type RecordInterviewOutcome struct {
	apps       ports.JobApplicationRepository
	interviews ports.InterviewRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	notes      ports.NoteRepository
	clock      ports.Clock
	ids        ports.IDGenerator
}

func NewRecordInterviewOutcome(
	apps ports.JobApplicationRepository,
	interviews ports.InterviewRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	notes ports.NoteRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *RecordInterviewOutcome {
	return &RecordInterviewOutcome{
		apps:       apps,
		interviews: interviews,
		followUps:  followUps,
		timeline:   timeline,
		notes:      notes,
		clock:      clock,
		ids:        ids,
	}
}

func (uc *RecordInterviewOutcome) Execute(cmd RecordInterviewOutcomeCommand) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(cmd.ApplicationID)
	if err != nil {
		return nil, err
	}

	if err := uc.interviews.UpdateOutcome(cmd.InterviewID, cmd.Outcome); err != nil {
		return nil, err
	}

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  uc.clock.Now(),
		Description: "Recorded interview outcome: " + string(cmd.Outcome),
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}

	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
