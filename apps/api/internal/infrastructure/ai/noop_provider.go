package ai

import (
	"context"
	"errors"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
)

var ErrProviderNotConfigured = errors.New("ai provider is not configured")

type NoopProvider struct{}

func NewNoopProvider() *NoopProvider {
	return &NoopProvider{}
}

func (p *NoopProvider) GenerateText(context.Context, ports.GenerateTextRequest) (ports.GenerateTextResponse, error) {
	return ports.GenerateTextResponse{}, ErrProviderNotConfigured
}
