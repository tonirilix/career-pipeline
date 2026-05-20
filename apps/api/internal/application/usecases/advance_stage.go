package usecases

import (
	"fmt"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type AdvanceStageCommand struct {
	ApplicationID string
	ToStage       domain.ApplicationStage
}

type AdvanceStage struct {
	apps       ports.JobApplicationRepository
	followUps  ports.FollowUpRepository
	timeline   ports.TimelineRepository
	interviews ports.InterviewRepository
	notes      ports.NoteRepository
	clock      ports.Clock
	ids        ports.IDGenerator
}

func NewAdvanceStage(
	apps ports.JobApplicationRepository,
	followUps ports.FollowUpRepository,
	timeline ports.TimelineRepository,
	interviews ports.InterviewRepository,
	notes ports.NoteRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *AdvanceStage {
	return &AdvanceStage{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
		clock:      clock,
		ids:        ids,
	}
}

func (uc *AdvanceStage) Execute(cmd AdvanceStageCommand) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(cmd.ApplicationID)
	if err != nil {
		return nil, err
	}

	if err := domain.ValidateStageTransition(app.Stage, cmd.ToStage); err != nil {
		return nil, err
	}

	if err := uc.apps.UpdateStage(app.ID, cmd.ToStage); err != nil {
		return nil, err
	}

	now := uc.clock.Now()
	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  now,
		Description: fmt.Sprintf("Moved from %s to %s", app.Stage, cmd.ToStage),
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}

	if domain.IsClosedStage(cmd.ToStage) {
		if err := uc.followUps.DeactivateByApplication(app.ID, now); err != nil {
			return nil, err
		}
	}

	app.Stage = cmd.ToStage
	return loadFullApplication(app, uc.apps, uc.followUps, uc.timeline, uc.interviews, uc.notes)
}
