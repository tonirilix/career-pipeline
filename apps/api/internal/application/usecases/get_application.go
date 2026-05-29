package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type GetApplication struct {
	apps      ports.JobApplicationRepository
	assembler *FullApplicationAssembler
}

func NewGetApplication(
	apps ports.JobApplicationRepository,
	assembler *FullApplicationAssembler,
) *GetApplication {
	return &GetApplication{
		apps:      apps,
		assembler: assembler,
	}
}

func (uc *GetApplication) Execute(ctx context.Context, id string) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return uc.assembler.Load(ctx, app)
}
