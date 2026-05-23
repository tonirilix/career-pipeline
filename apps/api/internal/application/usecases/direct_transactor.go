package usecases

import "github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"

type DirectTransactor struct {
	repos ports.Repositories
}

func NewDirectTransactor(repos ports.Repositories) *DirectTransactor {
	return &DirectTransactor{repos: repos}
}

var _ ports.Transactor = (*DirectTransactor)(nil)

func (t *DirectTransactor) WithTransaction(fn func(repos ports.Repositories) error) error {
	return fn(t.repos)
}
