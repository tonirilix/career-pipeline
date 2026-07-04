package usecases_test

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func TestUpdateCandidateProfileCreatesAndUpdatesActiveProfile(t *testing.T) {
	repo := newFakeCandidateProfileRepo()
	clock := &fakeClock{t: time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)}
	uc := usecases.NewUpdateCandidateProfile(repo, clock)

	profile, err := uc.Execute(context.Background(), usecases.UpdateCandidateProfileCommand{
		TargetRoles:              "Senior Frontend Engineer",
		PreferredStack:           "React, TypeScript",
		CompensationExpectations: "$100k USD",
		WritingTone:              "Warm and concise",
	})
	if err != nil {
		t.Fatalf("Execute: %v", err)
	}

	if profile.ID != domain.ActiveCandidateProfileID {
		t.Fatalf("expected active profile ID, got %q", profile.ID)
	}
	if profile.TargetRoles != "Senior Frontend Engineer" || profile.PreferredStack != "React, TypeScript" {
		t.Fatalf("profile fields not updated: %+v", profile)
	}
	if !profile.CreatedAt.Equal(clock.t) || !profile.UpdatedAt.Equal(clock.t) {
		t.Fatalf("expected timestamps from clock, got %+v", profile)
	}
}

func TestCandidateGroundingContextUsesApprovedCurrentMemory(t *testing.T) {
	profiles := newFakeCandidateProfileRepo()
	memory := newFakeCandidateMemoryRepo()
	clock := &fakeClock{t: time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)}
	ids := &fakeIDs{}
	memoryUC := usecases.NewCandidateMemory(memory, clock, ids)

	if _, err := usecases.NewUpdateCandidateProfile(profiles, clock).Execute(context.Background(), usecases.UpdateCandidateProfileCommand{
		TargetRoles: "Lead Frontend Engineer",
	}); err != nil {
		t.Fatalf("update profile: %v", err)
	}
	approved, _ := memoryUC.Create(context.Background(), usecases.CreateMemoryRecordCommand{
		MemoryType: domain.MemorySkill,
		Title:      "React",
		Body:       "Strong React and TypeScript background.",
		Approved:   true,
	})
	_, _ = memoryUC.Create(context.Background(), usecases.CreateMemoryRecordCommand{
		MemoryType: domain.MemoryWeakArea,
		Title:      "Python",
		Body:       "Do not overstate Python depth.",
		Approved:   false,
	})
	archived, _ := memoryUC.Create(context.Background(), usecases.CreateMemoryRecordCommand{
		MemoryType: domain.MemoryPreference,
		Title:      "Old preference",
		Body:       "Old preference.",
		Approved:   true,
	})
	if _, err := memoryUC.Archive(context.Background(), archived.ID); err != nil {
		t.Fatalf("archive: %v", err)
	}
	replacement, _ := memoryUC.Create(context.Background(), usecases.CreateMemoryRecordCommand{
		MemoryType: domain.MemoryPreference,
		Title:      "Current preference",
		Body:       "Prefer product companies.",
		Approved:   true,
	})
	if _, err := memoryUC.Supersede(context.Background(), approved.ID, replacement.ID); err != nil {
		t.Fatalf("supersede: %v", err)
	}

	contextUC := usecases.NewGetCandidateGroundingContext(profiles, memory)
	grounding, err := contextUC.Execute(context.Background())
	if err != nil {
		t.Fatalf("Execute: %v", err)
	}

	if grounding.Profile.TargetRoles != "Lead Frontend Engineer" {
		t.Fatalf("unexpected profile: %+v", grounding.Profile)
	}
	if len(grounding.Memory) != 1 {
		t.Fatalf("expected one approved current memory record, got %+v", grounding.Memory)
	}
	if grounding.Memory[0].ID != replacement.ID {
		t.Fatalf("expected replacement record, got %+v", grounding.Memory[0])
	}
}

func TestAIArtifactsPreserveGeneratedAndEditedContent(t *testing.T) {
	repo := newFakeAIArtifactRepo()
	clock := &fakeClock{t: time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)}
	ids := &fakeIDs{}
	uc := usecases.NewAIArtifacts(repo, clock, ids)

	artifact, err := uc.Create(context.Background(), usecases.CreateAIArtifactCommand{
		ArtifactType:     domain.ArtifactApplicationDraft,
		Owner:            domain.OwnerReference{Type: "candidate_profile", ID: domain.ActiveCandidateProfileID},
		Title:            "Cover letter",
		SourceInputs:     json.RawMessage(`[{"type":"candidate_profile","id":"default"}]`),
		GeneratedContent: "Generated draft",
		Status:           domain.ArtifactDraft,
	})
	if err != nil {
		t.Fatalf("Create: %v", err)
	}

	edited := "Edited draft"
	updated, err := uc.Edit(context.Background(), artifact.ID, &edited)
	if err != nil {
		t.Fatalf("Edit: %v", err)
	}

	if updated.GeneratedContent != "Generated draft" {
		t.Fatalf("generated content was overwritten: %+v", updated)
	}
	if updated.UserEditedContent == nil || *updated.UserEditedContent != edited {
		t.Fatalf("edited content not preserved: %+v", updated)
	}
	if updated.CurrentContent() != edited {
		t.Fatalf("expected current content to prefer edit, got %q", updated.CurrentContent())
	}
}

func TestAIArtifactStatusValidation(t *testing.T) {
	uc := usecases.NewAIArtifacts(newFakeAIArtifactRepo(), &fakeClock{t: time.Now()}, &fakeIDs{})

	_, err := uc.Create(context.Background(), usecases.CreateAIArtifactCommand{
		ArtifactType:     domain.ArtifactOther,
		Owner:            domain.OwnerReference{Type: "candidate_profile", ID: domain.ActiveCandidateProfileID},
		Title:            "Invalid",
		GeneratedContent: "content",
		Status:           domain.ArtifactStatus("Published"),
	})
	if !errors.Is(err, domain.ErrInvalidArtifactStatus) {
		t.Fatalf("expected invalid status error, got %v", err)
	}
}

func TestAIArtifactsListByOwner(t *testing.T) {
	repo := newFakeAIArtifactRepo()
	uc := usecases.NewAIArtifacts(repo, &fakeClock{t: time.Now()}, &fakeIDs{})
	targetOwner := domain.OwnerReference{Type: "application", ID: "app-1"}
	otherOwner := domain.OwnerReference{Type: "application", ID: "app-2"}

	target, _ := uc.Create(context.Background(), usecases.CreateAIArtifactCommand{
		ArtifactType:     domain.ArtifactOther,
		Owner:            targetOwner,
		Title:            "Target",
		GeneratedContent: "target",
	})
	_, _ = uc.Create(context.Background(), usecases.CreateAIArtifactCommand{
		ArtifactType:     domain.ArtifactOther,
		Owner:            otherOwner,
		Title:            "Other",
		GeneratedContent: "other",
	})

	artifacts, err := uc.ListByOwner(context.Background(), targetOwner)
	if err != nil {
		t.Fatalf("ListByOwner: %v", err)
	}
	if len(artifacts) != 1 || artifacts[0].ID != target.ID {
		t.Fatalf("expected only target artifact, got %+v", artifacts)
	}
}

type fakeCandidateProfileRepo struct {
	profile *domain.CandidateProfile
}

func newFakeCandidateProfileRepo() *fakeCandidateProfileRepo {
	return &fakeCandidateProfileRepo{}
}

func (r *fakeCandidateProfileRepo) GetActive(context.Context) (*domain.CandidateProfile, error) {
	if r.profile == nil {
		return nil, domain.ErrCandidateProfileNotFound
	}
	copied := *r.profile
	return &copied, nil
}

func (r *fakeCandidateProfileRepo) Save(_ context.Context, profile *domain.CandidateProfile) (*domain.CandidateProfile, error) {
	copied := *profile
	r.profile = &copied
	return &copied, nil
}

type fakeCandidateMemoryRepo struct {
	records map[string]*domain.CandidateMemoryRecord
}

func newFakeCandidateMemoryRepo() *fakeCandidateMemoryRepo {
	return &fakeCandidateMemoryRepo{records: map[string]*domain.CandidateMemoryRecord{}}
}

func (r *fakeCandidateMemoryRepo) Save(_ context.Context, record *domain.CandidateMemoryRecord) (*domain.CandidateMemoryRecord, error) {
	copied := *record
	r.records[record.ID] = &copied
	return &copied, nil
}

func (r *fakeCandidateMemoryRepo) FindByID(_ context.Context, id string) (*domain.CandidateMemoryRecord, error) {
	record, ok := r.records[id]
	if !ok {
		return nil, domain.ErrMemoryRecordNotFound
	}
	copied := *record
	return &copied, nil
}

func (r *fakeCandidateMemoryRepo) List(context.Context) ([]*domain.CandidateMemoryRecord, error) {
	out := make([]*domain.CandidateMemoryRecord, 0, len(r.records))
	for _, record := range r.records {
		copied := *record
		out = append(out, &copied)
	}
	return out, nil
}

func (r *fakeCandidateMemoryRepo) ListApprovedCurrent(context.Context) ([]*domain.CandidateMemoryRecord, error) {
	out := make([]*domain.CandidateMemoryRecord, 0, len(r.records))
	for _, record := range r.records {
		if record.Approved && record.Current() {
			copied := *record
			out = append(out, &copied)
		}
	}
	return out, nil
}

func (r *fakeCandidateMemoryRepo) Update(_ context.Context, record *domain.CandidateMemoryRecord) (*domain.CandidateMemoryRecord, error) {
	if _, ok := r.records[record.ID]; !ok {
		return nil, domain.ErrMemoryRecordNotFound
	}
	copied := *record
	r.records[record.ID] = &copied
	return &copied, nil
}

func (r *fakeCandidateMemoryRepo) Archive(_ context.Context, id string, archivedAt time.Time) (*domain.CandidateMemoryRecord, error) {
	record, ok := r.records[id]
	if !ok {
		return nil, domain.ErrMemoryRecordNotFound
	}
	record.ArchivedAt = &archivedAt
	record.UpdatedAt = archivedAt
	copied := *record
	return &copied, nil
}

func (r *fakeCandidateMemoryRepo) Supersede(_ context.Context, id string, supersededBy string, updatedAt time.Time) (*domain.CandidateMemoryRecord, error) {
	record, ok := r.records[id]
	if !ok {
		return nil, domain.ErrMemoryRecordNotFound
	}
	record.SupersededBy = &supersededBy
	record.UpdatedAt = updatedAt
	copied := *record
	return &copied, nil
}

type fakeAIArtifactRepo struct {
	artifacts map[string]*domain.AIArtifact
}

func newFakeAIArtifactRepo() *fakeAIArtifactRepo {
	return &fakeAIArtifactRepo{artifacts: map[string]*domain.AIArtifact{}}
}

func (r *fakeAIArtifactRepo) Save(_ context.Context, artifact *domain.AIArtifact) (*domain.AIArtifact, error) {
	copied := *artifact
	r.artifacts[artifact.ID] = &copied
	return &copied, nil
}

func (r *fakeAIArtifactRepo) FindByID(_ context.Context, id string) (*domain.AIArtifact, error) {
	artifact, ok := r.artifacts[id]
	if !ok {
		return nil, domain.ErrAIArtifactNotFound
	}
	copied := *artifact
	return &copied, nil
}

func (r *fakeAIArtifactRepo) ListByOwner(_ context.Context, owner domain.OwnerReference) ([]*domain.AIArtifact, error) {
	out := []*domain.AIArtifact{}
	for _, artifact := range r.artifacts {
		if artifact.Owner == owner {
			copied := *artifact
			out = append(out, &copied)
		}
	}
	return out, nil
}

func (r *fakeAIArtifactRepo) UpdateEditedContent(_ context.Context, id string, editedContent *string, updatedAt time.Time) (*domain.AIArtifact, error) {
	artifact, ok := r.artifacts[id]
	if !ok {
		return nil, domain.ErrAIArtifactNotFound
	}
	artifact.UserEditedContent = editedContent
	artifact.UpdatedAt = updatedAt
	copied := *artifact
	return &copied, nil
}

func (r *fakeAIArtifactRepo) UpdateStatus(_ context.Context, id string, status domain.ArtifactStatus, updatedAt time.Time) (*domain.AIArtifact, error) {
	artifact, ok := r.artifacts[id]
	if !ok {
		return nil, domain.ErrAIArtifactNotFound
	}
	artifact.Status = status
	artifact.UpdatedAt = updatedAt
	copied := *artifact
	return &copied, nil
}

func (r *fakeAIArtifactRepo) Supersede(_ context.Context, id string, supersededBy string, updatedAt time.Time) (*domain.AIArtifact, error) {
	artifact, ok := r.artifacts[id]
	if !ok {
		return nil, domain.ErrAIArtifactNotFound
	}
	artifact.Status = domain.ArtifactSuperseded
	artifact.SupersededBy = &supersededBy
	artifact.UpdatedAt = updatedAt
	copied := *artifact
	return &copied, nil
}
