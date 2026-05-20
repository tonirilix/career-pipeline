package usecases

import (
	"strings"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type ScheduleInterviewCommand struct {
	ApplicationID string
	Type          domain.InterviewType
	ScheduledAt   string
	Notes         string
	Outcome       domain.InterviewOutcome
}

type ScheduleInterview struct {
	apps       ports.JobApplicationRepository
	interviews ports.InterviewRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	notes      ports.NoteRepository
	clock      ports.Clock
	ids        ports.IDGenerator
}

func NewScheduleInterview(
	apps ports.JobApplicationRepository,
	interviews ports.InterviewRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	notes ports.NoteRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *ScheduleInterview {
	return &ScheduleInterview{
		apps:       apps,
		interviews: interviews,
		followUps:  followUps,
		timeline:   timeline,
		notes:      notes,
		clock:      clock,
		ids:        ids,
	}
}

func (uc *ScheduleInterview) Execute(cmd ScheduleInterviewCommand) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(cmd.ApplicationID)
	if err != nil {
		return nil, err
	}

	if app.Stage == domain.StageSaved {
		return nil, domain.ErrCannotSchedule
	}

	if strings.TrimSpace(cmd.ScheduledAt) == "" {
		return nil, domain.ErrScheduledAtEmpty
	}

	scheduledAt, err := parseTime(cmd.ScheduledAt)
	if err != nil {
		return nil, err
	}

	interview := &domain.Interview{
		ID:          uc.ids.New(),
		Type:        cmd.Type,
		ScheduledAt: scheduledAt,
		Notes:       cmd.Notes,
		Outcome:     cmd.Outcome,
	}
	if err := uc.interviews.Save(app.ID, interview); err != nil {
		return nil, err
	}

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  uc.clock.Now(),
		Description: "Scheduled " + string(cmd.Type) + " interview",
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}

	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
