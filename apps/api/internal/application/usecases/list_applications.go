package usecases

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type ListApplications struct {
	apps      ports.JobApplicationRepository
	assembler *FullApplicationAssembler
}

func NewListApplications(
	apps ports.JobApplicationRepository,
	assembler *FullApplicationAssembler,
) *ListApplications {
	return &ListApplications{
		apps:      apps,
		assembler: assembler,
	}
}

func (uc *ListApplications) Execute(filter ports.ListApplicationsFilter) ([]*domain.JobApplication, error) {
	list, err := uc.apps.List(filter)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.JobApplication, 0, len(list))
	for _, app := range list {
		full, err := uc.assembler.Load(app)
		if err != nil {
			return nil, err
		}
		result = append(result, full)
	}
	return result, nil
}
