package usecases

import (
	"strings"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type CreateApplicationCommand struct {
	Company        string
	RoleTitle      string
	PostingURL     string
	Source         domain.JobSource
	Location       string
	Compensation   string
	EmploymentType domain.EmploymentType
}

type CreateApplication struct {
	apps     ports.JobApplicationRepository
	timeline ports.TimelineRepository
	clock    ports.Clock
	ids      ports.IDGenerator
}

func NewCreateApplication(
	apps ports.JobApplicationRepository,
	timeline ports.TimelineRepository,
	clock ports.Clock,
	ids ports.IDGenerator,
) *CreateApplication {
	return &CreateApplication{apps: apps, timeline: timeline, clock: clock, ids: ids}
}

func (uc *CreateApplication) Execute(cmd CreateApplicationCommand) (*domain.JobApplication, error) {
	if strings.TrimSpace(cmd.Company) == "" {
		return nil, domain.ErrNoteBodyEmpty
	}
	if strings.TrimSpace(cmd.RoleTitle) == "" {
		return nil, domain.ErrNoteBodyEmpty
	}

	now := uc.clock.Now()
	app := &domain.JobApplication{
		ID:             uc.ids.New(),
		Company:        cmd.Company,
		RoleTitle:      cmd.RoleTitle,
		PostingURL:     cmd.PostingURL,
		Source:         cmd.Source,
		Location:       cmd.Location,
		Compensation:   cmd.Compensation,
		EmploymentType: cmd.EmploymentType,
		Stage:          domain.StageSaved,
		CreatedAt:      now,
	}

	if err := uc.apps.Save(app); err != nil {
		return nil, err
	}

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  now,
		Description: "Saved opportunity",
	}
	if err := uc.timeline.Save(app.ID, event); err != nil {
		return nil, err
	}
	app.Timeline = []domain.TimelineEvent{*event}

	return app, nil
}
