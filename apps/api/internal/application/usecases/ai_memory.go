package usecases

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type GetCandidateProfile struct {
	profiles ports.CandidateProfileRepository
	clock    ports.Clock
}

func NewGetCandidateProfile(profiles ports.CandidateProfileRepository, clock ports.Clock) *GetCandidateProfile {
	return &GetCandidateProfile{profiles: profiles, clock: clock}
}

func (uc *GetCandidateProfile) Execute(ctx context.Context) (*domain.CandidateProfile, error) {
	profile, err := uc.profiles.GetActive(ctx)
	if errors.Is(err, domain.ErrCandidateProfileNotFound) {
		return newUnsavedCandidateProfile(uc.clock.Now()), nil
	}
	return profile, err
}

// newUnsavedCandidateProfile represents the active profile before it has ever
// been saved. Its timestamps use the current time rather than the zero value
// so callers never observe a fabricated "0001-01-01" date.
func newUnsavedCandidateProfile(now time.Time) *domain.CandidateProfile {
	return &domain.CandidateProfile{
		ID:        domain.ActiveCandidateProfileID,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

type UpdateCandidateProfileCommand struct {
	TargetRoles              string
	PreferredStack           string
	CompensationExpectations string
	LocationPreferences      string
	WorkConstraints          string
	CompanyPreferences       string
	WritingTone              string
	PositioningSummary       string
}

type UpdateCandidateProfile struct {
	profiles ports.CandidateProfileRepository
	clock    ports.Clock
}

func NewUpdateCandidateProfile(profiles ports.CandidateProfileRepository, clock ports.Clock) *UpdateCandidateProfile {
	return &UpdateCandidateProfile{profiles: profiles, clock: clock}
}

func (uc *UpdateCandidateProfile) Execute(ctx context.Context, cmd UpdateCandidateProfileCommand) (*domain.CandidateProfile, error) {
	now := uc.clock.Now()
	profile, err := uc.profiles.GetActive(ctx)
	if errors.Is(err, domain.ErrCandidateProfileNotFound) {
		profile = &domain.CandidateProfile{ID: domain.ActiveCandidateProfileID, CreatedAt: now}
	} else if err != nil {
		return nil, err
	}

	profile.TargetRoles = cmd.TargetRoles
	profile.PreferredStack = cmd.PreferredStack
	profile.CompensationExpectations = cmd.CompensationExpectations
	profile.LocationPreferences = cmd.LocationPreferences
	profile.WorkConstraints = cmd.WorkConstraints
	profile.CompanyPreferences = cmd.CompanyPreferences
	profile.WritingTone = cmd.WritingTone
	profile.PositioningSummary = cmd.PositioningSummary
	profile.UpdatedAt = now

	return uc.profiles.Save(ctx, profile)
}

type CreateMemoryRecordCommand struct {
	MemoryType domain.MemoryType
	Title      string
	Body       string
	Source     string
	Approved   bool
	Sensitive  bool
	Metadata   json.RawMessage
}

type UpdateMemoryRecordCommand struct {
	ID         string
	MemoryType domain.MemoryType
	Title      string
	Body       string
	Source     string
	Approved   bool
	Sensitive  bool
	Metadata   json.RawMessage
}

type CandidateMemory struct {
	memory ports.CandidateMemoryRepository
	clock  ports.Clock
	ids    ports.IDGenerator
}

func NewCandidateMemory(memory ports.CandidateMemoryRepository, clock ports.Clock, ids ports.IDGenerator) *CandidateMemory {
	return &CandidateMemory{memory: memory, clock: clock, ids: ids}
}

func (uc *CandidateMemory) Create(ctx context.Context, cmd CreateMemoryRecordCommand) (*domain.CandidateMemoryRecord, error) {
	if err := domain.ValidateMemoryType(cmd.MemoryType); err != nil {
		return nil, err
	}
	now := uc.clock.Now()
	record := &domain.CandidateMemoryRecord{
		ID:         uc.ids.New(),
		MemoryType: cmd.MemoryType,
		Title:      cmd.Title,
		Body:       cmd.Body,
		Source:     cmd.Source,
		Approved:   cmd.Approved,
		Sensitive:  cmd.Sensitive,
		Metadata:   nonNilJSON(cmd.Metadata, `{}`),
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	return uc.memory.Save(ctx, record)
}

func (uc *CandidateMemory) List(ctx context.Context) ([]*domain.CandidateMemoryRecord, error) {
	return uc.memory.List(ctx)
}

func (uc *CandidateMemory) Update(ctx context.Context, cmd UpdateMemoryRecordCommand) (*domain.CandidateMemoryRecord, error) {
	if err := domain.ValidateMemoryType(cmd.MemoryType); err != nil {
		return nil, err
	}
	record, err := uc.memory.FindByID(ctx, cmd.ID)
	if err != nil {
		return nil, err
	}
	record.MemoryType = cmd.MemoryType
	record.Title = cmd.Title
	record.Body = cmd.Body
	record.Source = cmd.Source
	record.Approved = cmd.Approved
	record.Sensitive = cmd.Sensitive
	record.Metadata = nonNilJSON(cmd.Metadata, `{}`)
	record.UpdatedAt = uc.clock.Now()
	return uc.memory.Update(ctx, record)
}

func (uc *CandidateMemory) Archive(ctx context.Context, id string) (*domain.CandidateMemoryRecord, error) {
	return uc.memory.Archive(ctx, id, uc.clock.Now())
}

func (uc *CandidateMemory) Supersede(ctx context.Context, id string, supersededBy string) (*domain.CandidateMemoryRecord, error) {
	return uc.memory.Supersede(ctx, id, supersededBy, uc.clock.Now())
}

type GetCandidateGroundingContext struct {
	profiles ports.CandidateProfileRepository
	memory   ports.CandidateMemoryRepository
	clock    ports.Clock
}

func NewGetCandidateGroundingContext(
	profiles ports.CandidateProfileRepository,
	memory ports.CandidateMemoryRepository,
	clock ports.Clock,
) *GetCandidateGroundingContext {
	return &GetCandidateGroundingContext{profiles: profiles, memory: memory, clock: clock}
}

func (uc *GetCandidateGroundingContext) Execute(ctx context.Context) (*domain.CandidateGroundingContext, error) {
	profile, err := uc.profiles.GetActive(ctx)
	if errors.Is(err, domain.ErrCandidateProfileNotFound) {
		profile = newUnsavedCandidateProfile(uc.clock.Now())
	} else if err != nil {
		return nil, err
	}

	memory, err := uc.memory.ListApprovedCurrent(ctx)
	if err != nil {
		return nil, err
	}

	records := make([]domain.CandidateMemoryRecord, len(memory))
	for i, record := range memory {
		records[i] = *record
	}

	return &domain.CandidateGroundingContext{Profile: profile, Memory: records}, nil
}

type CreateAIArtifactCommand struct {
	ArtifactType      domain.ArtifactType
	Owner             domain.OwnerReference
	Title             string
	SourceInputs      json.RawMessage
	GeneratedContent  string
	UserEditedContent *string
	Status            domain.ArtifactStatus
	Sensitive         bool
	Provenance        domain.ArtifactProvenance
}

type AIArtifacts struct {
	artifacts ports.AIArtifactRepository
	clock     ports.Clock
	ids       ports.IDGenerator
}

func NewAIArtifacts(artifacts ports.AIArtifactRepository, clock ports.Clock, ids ports.IDGenerator) *AIArtifacts {
	return &AIArtifacts{artifacts: artifacts, clock: clock, ids: ids}
}

func (uc *AIArtifacts) Create(ctx context.Context, cmd CreateAIArtifactCommand) (*domain.AIArtifact, error) {
	if err := domain.ValidateArtifactType(cmd.ArtifactType); err != nil {
		return nil, err
	}
	status := cmd.Status
	if status == "" {
		status = domain.ArtifactDraft
	}
	if err := domain.ValidateArtifactStatus(status); err != nil {
		return nil, err
	}
	if status == domain.ArtifactSuperseded {
		return nil, domain.ErrArtifactSupersedeRequired
	}
	now := uc.clock.Now()
	artifact := &domain.AIArtifact{
		ID:                uc.ids.New(),
		ArtifactType:      cmd.ArtifactType,
		Owner:             cmd.Owner,
		Title:             cmd.Title,
		SourceInputs:      nonNilJSON(cmd.SourceInputs, `[]`),
		GeneratedContent:  cmd.GeneratedContent,
		UserEditedContent: cmd.UserEditedContent,
		Status:            status,
		Sensitive:         cmd.Sensitive,
		Provenance:        withDefaultUsageMetadata(cmd.Provenance),
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	return uc.artifacts.Save(ctx, artifact)
}

func (uc *AIArtifacts) ListByOwner(ctx context.Context, owner domain.OwnerReference) ([]*domain.AIArtifact, error) {
	return uc.artifacts.ListByOwner(ctx, owner)
}

func (uc *AIArtifacts) Edit(ctx context.Context, id string, editedContent *string) (*domain.AIArtifact, error) {
	return uc.artifacts.UpdateEditedContent(ctx, id, editedContent, uc.clock.Now())
}

func (uc *AIArtifacts) UpdateStatus(ctx context.Context, id string, status domain.ArtifactStatus) (*domain.AIArtifact, error) {
	if err := domain.ValidateArtifactStatus(status); err != nil {
		return nil, err
	}
	if status == domain.ArtifactSuperseded {
		return nil, domain.ErrArtifactSupersedeRequired
	}
	return uc.artifacts.UpdateStatus(ctx, id, status, uc.clock.Now())
}

func (uc *AIArtifacts) Supersede(ctx context.Context, id string, supersededBy string) (*domain.AIArtifact, error) {
	return uc.artifacts.Supersede(ctx, id, supersededBy, uc.clock.Now())
}

func nonNilJSON(value json.RawMessage, fallback string) json.RawMessage {
	if len(value) == 0 {
		return json.RawMessage(fallback)
	}
	return value
}

func withDefaultUsageMetadata(provenance domain.ArtifactProvenance) domain.ArtifactProvenance {
	provenance.UsageMetadata = nonNilJSON(provenance.UsageMetadata, `{}`)
	return provenance
}
