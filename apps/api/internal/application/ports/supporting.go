package ports

import (
	"context"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type Clock interface {
	Now() time.Time
}

type IDGenerator interface {
	New() string
}

type Repositories struct {
	Applications JobApplicationRepository
	Interviews   InterviewRepository
	FollowUps    FollowUpRepository
	Notes        NoteRepository
	Timeline     TimelineRepository
}

type Transactor interface {
	WithTransaction(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error
}

type AIContextReference struct {
	Type string
	ID   string
}

type GenerationParameters struct {
	Model       string
	Temperature *float64
	MaxTokens   *int
}

type GenerateTextRequest struct {
	OperationName      string
	SystemInstructions string
	UserInstructions   string
	ContextReferences  []AIContextReference
	Parameters         GenerationParameters
}

type AIUsageMetadata struct {
	InputTokens  int
	OutputTokens int
	TotalTokens  int
}

type GenerateTextResponse struct {
	Content       string
	ProviderName  string
	ModelName     string
	FinishReason  string
	Usage         AIUsageMetadata
	RawProviderID string
}

type AIProvider interface {
	GenerateText(ctx context.Context, request GenerateTextRequest) (GenerateTextResponse, error)
}

type RoleSearchProvider interface {
	Search(ctx context.Context, request domain.RoleSearchRequest) ([]domain.RoleSearchProviderResult, error)
}
