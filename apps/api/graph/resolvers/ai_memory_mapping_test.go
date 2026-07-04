package resolvers

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func TestMapCandidateMemoryRecordPreservesFlagsAndSupersession(t *testing.T) {
	archivedAt := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)
	supersededBy := "memory-new"
	record := &domain.CandidateMemoryRecord{
		ID:           "memory-old",
		MemoryType:   domain.MemorySkill,
		Title:        "React leadership",
		Body:         "Led React migrations",
		Source:       "profile review",
		Approved:     true,
		Sensitive:    true,
		Metadata:     json.RawMessage(`{"tags":["frontend"]}`),
		ArchivedAt:   &archivedAt,
		SupersededBy: &supersededBy,
		CreatedAt:    time.Date(2026, 1, 1, 1, 2, 3, 0, time.UTC),
		UpdatedAt:    time.Date(2026, 1, 1, 4, 5, 6, 0, time.UTC),
	}

	got := mapCandidateMemoryRecord(record)

	if got.ID != record.ID || got.MemoryType != string(record.MemoryType) {
		t.Fatalf("mapped identity/type incorrectly: %#v", got)
	}
	if !got.Approved || !got.Sensitive {
		t.Fatalf("expected approval and sensitivity flags to be preserved: %#v", got)
	}
	if got.Metadata != `{"tags":["frontend"]}` {
		t.Fatalf("expected metadata to be preserved, got %s", got.Metadata)
	}
	if got.ArchivedAt == nil || *got.ArchivedAt != "2026-01-02T03:04:05Z" {
		t.Fatalf("expected archived timestamp, got %v", got.ArchivedAt)
	}
	if got.SupersededBy == nil || *got.SupersededBy != "memory-new" {
		t.Fatalf("expected supersession link, got %v", got.SupersededBy)
	}
}

func TestMapAIArtifactPreservesOwnerProvenanceAndCurrentContent(t *testing.T) {
	edited := "Edited recruiter message"
	supersededBy := "artifact-new"
	artifact := &domain.AIArtifact{
		ID:                "artifact-old",
		ArtifactType:      domain.ArtifactRecruiterMessage,
		Owner:             domain.OwnerReference{Type: "Application", ID: "app-1"},
		Title:             "Recruiter reply",
		SourceInputs:      json.RawMessage(`[{"type":"memory","id":"memory-1"}]`),
		GeneratedContent:  "Generated recruiter message",
		UserEditedContent: &edited,
		Status:            domain.ArtifactApproved,
		Sensitive:         true,
		SupersededBy:      &supersededBy,
		Provenance: domain.ArtifactProvenance{
			ProviderName:  strPtr("fake"),
			ModelName:     strPtr("test-model"),
			PromptID:      strPtr("recruiter-message-v1"),
			UsageMetadata: json.RawMessage(`{"inputTokens":10}`),
			RawProviderID: strPtr("provider-123"),
		},
		CreatedAt: time.Date(2026, 2, 3, 4, 5, 6, 0, time.UTC),
		UpdatedAt: time.Date(2026, 2, 3, 7, 8, 9, 0, time.UTC),
	}

	got := mapAIArtifact(artifact)

	if got.Owner.Type != "Application" || got.Owner.ID != "app-1" {
		t.Fatalf("expected owner reference to be preserved, got %#v", got.Owner)
	}
	if got.CurrentContent != edited {
		t.Fatalf("expected current content to prefer edited content, got %q", got.CurrentContent)
	}
	if got.GeneratedContent != artifact.GeneratedContent || got.UserEditedContent == nil || *got.UserEditedContent != edited {
		t.Fatalf("expected generated and edited content to be preserved: %#v", got)
	}
	if got.Status != string(domain.ArtifactApproved) || !got.Sensitive {
		t.Fatalf("expected status and sensitivity fields, got %#v", got)
	}
	if got.Provenance.ProviderName == nil || *got.Provenance.ProviderName != "fake" || got.Provenance.UsageMetadata != `{"inputTokens":10}` {
		t.Fatalf("expected provenance to be preserved, got %#v", got.Provenance)
	}
	if got.SupersededBy == nil || *got.SupersededBy != "artifact-new" {
		t.Fatalf("expected supersession link, got %v", got.SupersededBy)
	}
}

func strPtr(value string) *string {
	return &value
}
