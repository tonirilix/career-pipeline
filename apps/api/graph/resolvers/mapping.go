package resolvers

import (
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/graph/model"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func mapApplication(app *domain.JobApplication) *model.JobApplication {
	out := &model.JobApplication{
		ID:             app.ID,
		Company:        app.Company,
		RoleTitle:      app.RoleTitle,
		PostingURL:     app.PostingURL,
		Source:         string(app.Source),
		Location:       app.Location,
		Compensation:   app.Compensation,
		EmploymentType: string(app.EmploymentType),
		Stage:          string(app.Stage),
		Timeline:       make([]*model.TimelineEvent, len(app.Timeline)),
		Interviews:     make([]*model.Interview, len(app.Interviews)),
		FollowUps:      make([]*model.FollowUpReminder, len(app.FollowUps)),
		Notes:          make([]*model.ApplicationNote, len(app.Notes)),
	}
	for i, e := range app.Timeline {
		out.Timeline[i] = &model.TimelineEvent{
			ID:          e.ID,
			OccurredAt:  e.OccurredAt.UTC().Format(time.RFC3339),
			Description: e.Description,
		}
	}
	for i, iv := range app.Interviews {
		out.Interviews[i] = &model.Interview{
			ID:          iv.ID,
			Type:        string(iv.Type),
			ScheduledAt: iv.ScheduledAt.UTC().Format(time.RFC3339),
			Notes:       iv.Notes,
			Outcome:     string(iv.Outcome),
		}
	}
	for i, fu := range app.FollowUps {
		gfu := &model.FollowUpReminder{
			ID:            fu.ID,
			ApplicationID: fu.ApplicationID,
			DueAt:         fu.DueAt.UTC().Format(time.RFC3339),
			Note:          fu.Note,
		}
		if fu.CompletedAt != nil {
			s := fu.CompletedAt.UTC().Format(time.RFC3339)
			gfu.CompletedAt = &s
		}
		out.FollowUps[i] = gfu
	}
	for i, n := range app.Notes {
		out.Notes[i] = &model.ApplicationNote{
			ID:        n.ID,
			Body:      n.Body,
			CreatedAt: n.CreatedAt.UTC().Format(time.RFC3339),
		}
	}
	return out
}

func mapCandidateProfile(profile *domain.CandidateProfile) *model.CandidateProfile {
	return &model.CandidateProfile{
		ID:                       profile.ID,
		TargetRoles:              profile.TargetRoles,
		PreferredStack:           profile.PreferredStack,
		CompensationExpectations: profile.CompensationExpectations,
		LocationPreferences:      profile.LocationPreferences,
		WorkConstraints:          profile.WorkConstraints,
		CompanyPreferences:       profile.CompanyPreferences,
		WritingTone:              profile.WritingTone,
		PositioningSummary:       profile.PositioningSummary,
		CreatedAt:                profile.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:                profile.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func mapCandidateMemoryRecord(record *domain.CandidateMemoryRecord) *model.CandidateMemoryRecord {
	out := &model.CandidateMemoryRecord{
		ID:         record.ID,
		MemoryType: string(record.MemoryType),
		Title:      record.Title,
		Body:       record.Body,
		Source:     record.Source,
		Approved:   record.Approved,
		Sensitive:  record.Sensitive,
		Metadata:   string(record.Metadata),
		CreatedAt:  record.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:  record.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if record.ArchivedAt != nil {
		s := record.ArchivedAt.UTC().Format(time.RFC3339)
		out.ArchivedAt = &s
	}
	if record.SupersededBy != nil {
		out.SupersededBy = record.SupersededBy
	}
	return out
}

func mapCandidateMemoryRecords(records []*domain.CandidateMemoryRecord) []*model.CandidateMemoryRecord {
	out := make([]*model.CandidateMemoryRecord, len(records))
	for i, record := range records {
		out[i] = mapCandidateMemoryRecord(record)
	}
	return out
}

func mapCandidateGroundingContext(context *domain.CandidateGroundingContext) *model.CandidateGroundingContext {
	memory := make([]*model.CandidateMemoryRecord, len(context.Memory))
	for i := range context.Memory {
		memory[i] = mapCandidateMemoryRecord(&context.Memory[i])
	}
	return &model.CandidateGroundingContext{
		Profile: mapCandidateProfile(context.Profile),
		Memory:  memory,
	}
}

func mapAIArtifact(artifact *domain.AIArtifact) *model.AIArtifact {
	out := &model.AIArtifact{
		ID:               artifact.ID,
		ArtifactType:     string(artifact.ArtifactType),
		Owner:            &model.OwnerReference{Type: artifact.Owner.Type, ID: artifact.Owner.ID},
		Title:            artifact.Title,
		SourceInputs:     string(artifact.SourceInputs),
		GeneratedContent: artifact.GeneratedContent,
		CurrentContent:   artifact.CurrentContent(),
		Status:           string(artifact.Status),
		Sensitive:        artifact.Sensitive,
		Provenance: &model.ArtifactProvenance{
			ProviderName:  artifact.Provenance.ProviderName,
			ModelName:     artifact.Provenance.ModelName,
			PromptID:      artifact.Provenance.PromptID,
			UsageMetadata: string(artifact.Provenance.UsageMetadata),
			RawProviderID: artifact.Provenance.RawProviderID,
		},
		CreatedAt: artifact.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: artifact.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if artifact.UserEditedContent != nil {
		out.UserEditedContent = artifact.UserEditedContent
	}
	if artifact.SupersededBy != nil {
		out.SupersededBy = artifact.SupersededBy
	}
	return out
}

func mapAIArtifacts(artifacts []*domain.AIArtifact) []*model.AIArtifact {
	out := make([]*model.AIArtifact, len(artifacts))
	for i, artifact := range artifacts {
		out[i] = mapAIArtifact(artifact)
	}
	return out
}
