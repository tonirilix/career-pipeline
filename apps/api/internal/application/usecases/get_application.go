package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
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

func (uc *GetApplication) Execute(id string) (*domain.JobApplication, error) {
	app, err := uc.apps.FindByID(id)
	if err != nil {
		return nil, err
	}
	return uc.assembler.Load(app)
}
