package usecases

import (
	"strings"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
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
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewCreateApplication(
	tx ports.Transactor,
	clock ports.Clock,
	ids ports.IDGenerator,
) *CreateApplication {
	return &CreateApplication{tx: tx, clock: clock, ids: ids}
}

func (uc *CreateApplication) Execute(cmd CreateApplicationCommand) (*domain.JobApplication, error) {
	if strings.TrimSpace(cmd.Company) == "" {
		return nil, domain.ErrCompanyRequired
	}
	if strings.TrimSpace(cmd.RoleTitle) == "" {
		return nil, domain.ErrRoleTitleRequired
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

	event := &domain.TimelineEvent{
		ID:          uc.ids.New(),
		OccurredAt:  now,
		Description: "Saved opportunity",
	}

	err := uc.tx.WithTransaction(func(repos ports.Repositories) error {
		if err := repos.Applications.Save(app); err != nil {
			return err
		}
		if err := repos.Timeline.Save(app.ID, event); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	app.Timeline = []domain.TimelineEvent{*event}
	return app, nil
}
