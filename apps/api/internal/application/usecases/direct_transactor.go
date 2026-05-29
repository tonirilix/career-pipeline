package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
)

type DirectTransactor struct {
	repos ports.Repositories
}

func NewDirectTransactor(repos ports.Repositories) *DirectTransactor {
	return &DirectTransactor{repos: repos}
}

var _ ports.Transactor = (*DirectTransactor)(nil)

func (t *DirectTransactor) WithTransaction(ctx context.Context, fn func(ctx context.Context, repos ports.Repositories) error) error {
	return fn(ctx, t.repos)
}
