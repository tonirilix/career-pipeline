package persistence_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"os"
	"testing"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence"
)

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is required for PostgreSQL persistence tests")
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := db.Ping(); err != nil {
		t.Fatalf("connect test db: %v", err)
	}

	schema, err := os.ReadFile("testdata/schema.sql")
	if err != nil {
		t.Fatalf("read schema: %v", err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("apply schema: %v", err)
	}
	truncateTestDB(t, db)
	t.Cleanup(func() { truncateTestDB(t, db) })
	return db
}

func truncateTestDB(t *testing.T, db *sql.DB) {
	t.Helper()
	_, err := db.Exec(`TRUNCATE role_records, role_search_topics, ai_artifacts, candidate_memory_records, candidate_profiles, timeline_events, application_notes, follow_up_reminders, interviews, job_applications RESTART IDENTITY CASCADE`)
	if err != nil {
		t.Fatalf("truncate test db: %v", err)
	}
}

func TestPostgreSQLRoleDiscoveryRepositories_RoundTripRoleData(t *testing.T) {
	db := openTestDB(t)
	topicRepo := persistence.NewPostgreSQLRoleSearchTopicRepository(db)
	roleRepo := persistence.NewPostgreSQLRoleRecordRepository(db)
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	ctx := context.Background()
	now := time.Date(2026, 7, 4, 9, 0, 0, 0, time.UTC)

	topic, err := topicRepo.Save(ctx, &domain.RoleSearchTopic{
		ID:               "topic-1",
		Name:             "Senior product roles",
		TargetTitles:     "Senior Software Engineer",
		PreferredStack:   "Go, React",
		Location:         "Remote",
		RemotePreference: "Remote",
		EmploymentType:   domain.EmploymentFullTime,
		CompanyType:      domain.RoleCompanyProduct,
		Compensation:     "$150k+",
		Seniority:        domain.RoleSenioritySenior,
		Notes:            "Avoid consultancies.",
		CreatedAt:        now,
		UpdatedAt:        now,
	})
	if err != nil {
		t.Fatalf("save topic: %v", err)
	}
	if topic.Name != "Senior product roles" {
		t.Fatalf("topic did not round-trip: %#v", topic)
	}

	checkedAt := now.Add(time.Hour)
	role, err := roleRepo.Save(ctx, &domain.RoleRecord{
		ID:                 "role-1",
		SearchTopicID:      &topic.ID,
		Company:            "Acme",
		Title:              "Senior Software Engineer",
		PostingURL:         "https://jobs.example/acme",
		Source:             string(domain.SourceCompanySite),
		SourceKind:         domain.RoleSourceSearchResult,
		ProviderSource:     "fake search",
		Description:        "Normalized description",
		RawSourceText:      "Raw source text",
		Location:           "Remote",
		RemoteEligibility:  domain.RoleRemoteRemote,
		EmploymentType:     domain.EmploymentFullTime,
		Seniority:          domain.RoleSenioritySenior,
		Compensation:       "$150k+",
		Stack:              "Go, React",
		CompanyType:        domain.RoleCompanyProduct,
		FreshnessStatus:    domain.RoleFreshnessUnknown,
		FreshnessCheckedAt: nil,
		DecisionStatus:     domain.RoleDecisionNew,
		RejectionReason:    domain.RoleRejectionNone,
		Metadata:           json.RawMessage(`{"score":1}`),
		CreatedAt:          now,
		UpdatedAt:          now,
	})
	if err != nil {
		t.Fatalf("save role: %v", err)
	}
	if role.SearchTopicID == nil || *role.SearchTopicID != topic.ID || role.RawSourceText != "Raw source text" {
		t.Fatalf("role did not preserve topic/raw source: %#v", role)
	}

	if _, err := roleRepo.Save(ctx, &domain.RoleRecord{
		ID:              "role-duplicate",
		Company:         "Acme",
		Title:           "Senior Software Engineer",
		PostingURL:      "https://jobs.example/acme",
		SourceKind:      domain.RoleSourceManualURL,
		EmploymentType:  domain.EmploymentFullTime,
		FreshnessStatus: domain.RoleFreshnessUnknown,
		DecisionStatus:  domain.RoleDecisionNew,
		Metadata:        json.RawMessage(`{}`),
		CreatedAt:       now,
		UpdatedAt:       now,
	}); !errors.Is(err, domain.ErrDuplicateActiveRoleURL) {
		t.Fatalf("expected duplicate active URL error, got %v", err)
	}

	decision, err := roleRepo.UpdateDecision(ctx, role.ID, domain.RoleDecisionRejected, domain.RoleRejectionWrongStack, now.Add(2*time.Hour))
	if err != nil {
		t.Fatalf("update decision: %v", err)
	}
	if decision.DecisionStatus != domain.RoleDecisionRejected || decision.RejectionReason != domain.RoleRejectionWrongStack {
		t.Fatalf("decision did not update: %#v", decision)
	}

	fresh, err := roleRepo.UpdateFreshness(ctx, role.ID, domain.RoleFreshnessLive, &checkedAt, now.Add(3*time.Hour))
	if err != nil {
		t.Fatalf("update freshness: %v", err)
	}
	if fresh.FreshnessStatus != domain.RoleFreshnessLive || fresh.FreshnessCheckedAt == nil {
		t.Fatalf("freshness did not update: %#v", fresh)
	}

	if err := appRepo.Save(ctx, &domain.JobApplication{
		ID:             "app-1",
		Company:        "Acme",
		RoleTitle:      "Senior Software Engineer",
		EmploymentType: domain.EmploymentFullTime,
		Stage:          domain.StageSaved,
		CreatedAt:      now,
	}); err != nil {
		t.Fatalf("save application: %v", err)
	}
	promoted, err := roleRepo.LinkPromotedApplication(ctx, role.ID, "app-1", now.Add(4*time.Hour))
	if err != nil {
		t.Fatalf("link promoted application: %v", err)
	}
	if promoted.PromotedApplicationID == nil || *promoted.PromotedApplicationID != "app-1" || promoted.DecisionStatus != domain.RoleDecisionPromoted {
		t.Fatalf("promotion link did not update: %#v", promoted)
	}
}

func TestPostgreSQLJobApplicationRepository_SaveAndFind(t *testing.T) {
	db := openTestDB(t)
	repo := persistence.NewPostgreSQLJobApplicationRepository(db)
	ctx := context.Background()

	app := &domain.JobApplication{
		ID:             "app-1",
		Company:        "Acme",
		RoleTitle:      "Engineer",
		PostingURL:     "https://example.com",
		Source:         domain.SourceLinkedIn,
		Location:       "Remote",
		Compensation:   "$100k",
		EmploymentType: domain.EmploymentFullTime,
		Stage:          domain.StageSaved,
		CreatedAt:      time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
	}

	if err := repo.Save(ctx, app); err != nil {
		t.Fatalf("Save: %v", err)
	}

	found, err := repo.FindByID(ctx, "app-1")
	if err != nil {
		t.Fatalf("FindByID: %v", err)
	}
	if found.Company != "Acme" {
		t.Errorf("expected company Acme, got %s", found.Company)
	}
	if found.Stage != domain.StageSaved {
		t.Errorf("expected stage Saved, got %s", found.Stage)
	}
}

func TestPostgreSQLJobApplicationRepository_UpdateStage(t *testing.T) {
	db := openTestDB(t)
	repo := persistence.NewPostgreSQLJobApplicationRepository(db)
	ctx := context.Background()
	_ = repo.Save(ctx, &domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})

	if err := repo.UpdateStage(ctx, "app-1", domain.StageApplied); err != nil {
		t.Fatalf("UpdateStage: %v", err)
	}
	found, _ := repo.FindByID(ctx, "app-1")
	if found.Stage != domain.StageApplied {
		t.Errorf("expected Applied, got %s", found.Stage)
	}
}

func TestPostgreSQLTimelineRepository_SaveAndList(t *testing.T) {
	db := openTestDB(t)
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	repo := persistence.NewPostgreSQLTimelineRepository(db)
	ctx := context.Background()

	_ = appRepo.Save(ctx, &domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})
	event := &domain.TimelineEvent{ID: "ev-1", Description: "Saved", OccurredAt: time.Now()}
	if err := repo.Save(ctx, "app-1", event); err != nil {
		t.Fatalf("Save: %v", err)
	}
	events, err := repo.ListByApplication(ctx, "app-1")
	if err != nil {
		t.Fatalf("ListByApplication: %v", err)
	}
	if len(events) != 1 || events[0].Description != "Saved" {
		t.Errorf("unexpected events: %+v", events)
	}
}

func TestPostgreSQLNoteRepository_SaveAndList(t *testing.T) {
	db := openTestDB(t)
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	repo := persistence.NewPostgreSQLNoteRepository(db)
	ctx := context.Background()

	_ = appRepo.Save(ctx, &domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})
	note := &domain.ApplicationNote{ID: "n-1", Body: "Test note", CreatedAt: time.Now()}
	if err := repo.Save(ctx, "app-1", note); err != nil {
		t.Fatalf("Save: %v", err)
	}
	notes, err := repo.ListByApplication(ctx, "app-1")
	if err != nil {
		t.Fatalf("ListByApplication: %v", err)
	}
	if len(notes) != 1 || notes[0].Body != "Test note" {
		t.Errorf("unexpected notes: %+v", notes)
	}
}

func TestPostgreSQLFollowUpRepository(t *testing.T) {
	db := openTestDB(t)
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	repo := persistence.NewPostgreSQLFollowUpRepository(db)
	ctx := context.Background()

	_ = appRepo.Save(ctx, &domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})
	future := time.Now().Add(24 * time.Hour)
	fu := &domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: future, Note: "Follow up"}
	if err := repo.Save(ctx, fu); err != nil {
		t.Fatalf("Save: %v", err)
	}

	upcoming, err := repo.ListUpcoming(ctx, time.Now())
	if err != nil || len(upcoming) != 1 {
		t.Errorf("expected 1 upcoming, got %d (err: %v)", len(upcoming), err)
	}

	now := time.Now()
	if err := repo.UpdateCompleted(ctx, "fu-1", now); err != nil {
		t.Fatalf("UpdateCompleted: %v", err)
	}
	found, _ := repo.FindByID(ctx, "fu-1")
	if found.CompletedAt == nil {
		t.Error("expected CompletedAt to be set")
	}
}

func TestPostgreSQLRepositories_RoundTripApplicationChildData(t *testing.T) {
	db := openTestDB(t)
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	interviewRepo := persistence.NewPostgreSQLInterviewRepository(db)
	followUpRepo := persistence.NewPostgreSQLFollowUpRepository(db)
	noteRepo := persistence.NewPostgreSQLNoteRepository(db)
	timelineRepo := persistence.NewPostgreSQLTimelineRepository(db)
	ctx := context.Background()
	now := time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC)

	app := &domain.JobApplication{
		ID:             "app-1",
		Company:        "Acme",
		RoleTitle:      "Engineer",
		PostingURL:     "https://example.com",
		Source:         domain.SourceReferral,
		Location:       "Remote",
		Compensation:   "$100k",
		EmploymentType: domain.EmploymentFullTime,
		Stage:          domain.StageApplied,
		CreatedAt:      now,
	}
	if err := appRepo.Save(ctx, app); err != nil {
		t.Fatalf("save app: %v", err)
	}
	if err := interviewRepo.Save(ctx, "app-1", &domain.Interview{
		ID:          "interview-1",
		Type:        domain.InterviewTechnical,
		ScheduledAt: now.Add(24 * time.Hour),
		Notes:       "Bring portfolio",
		Outcome:     domain.OutcomeScheduled,
	}); err != nil {
		t.Fatalf("save interview: %v", err)
	}
	if err := followUpRepo.Save(ctx, &domain.FollowUpReminder{
		ID:            "follow-up-1",
		ApplicationID: "app-1",
		DueAt:         now.Add(48 * time.Hour),
		Note:          "Send thank-you",
	}); err != nil {
		t.Fatalf("save follow-up: %v", err)
	}
	if err := noteRepo.Save(ctx, "app-1", &domain.ApplicationNote{
		ID:        "note-1",
		Body:      "Recruiter prefers email.",
		CreatedAt: now.Add(time.Hour),
	}); err != nil {
		t.Fatalf("save note: %v", err)
	}
	if err := timelineRepo.Save(ctx, "app-1", &domain.TimelineEvent{
		ID:          "event-1",
		Description: "Applied",
		OccurredAt:  now,
	}); err != nil {
		t.Fatalf("save timeline: %v", err)
	}

	found, err := appRepo.FindByID(ctx, "app-1")
	if err != nil {
		t.Fatalf("find app: %v", err)
	}
	interviews, err := interviewRepo.ListByApplication(ctx, "app-1")
	if err != nil {
		t.Fatalf("list interviews: %v", err)
	}
	followUps, err := followUpRepo.ListByApplication(ctx, "app-1")
	if err != nil {
		t.Fatalf("list follow-ups: %v", err)
	}
	notes, err := noteRepo.ListByApplication(ctx, "app-1")
	if err != nil {
		t.Fatalf("list notes: %v", err)
	}
	events, err := timelineRepo.ListByApplication(ctx, "app-1")
	if err != nil {
		t.Fatalf("list timeline: %v", err)
	}

	if found.Company != "Acme" || found.Source != domain.SourceReferral || found.Stage != domain.StageApplied {
		t.Fatalf("application fields did not round-trip: %+v", found)
	}
	if len(interviews) != 1 || interviews[0].Type != domain.InterviewTechnical || interviews[0].Notes != "Bring portfolio" {
		t.Fatalf("interview fields did not round-trip: %+v", interviews)
	}
	if len(followUps) != 1 || followUps[0].Note != "Send thank-you" || !followUps[0].DueAt.Equal(now.Add(48*time.Hour)) {
		t.Fatalf("follow-up fields did not round-trip: %+v", followUps)
	}
	if len(notes) != 1 || notes[0].Body != "Recruiter prefers email." {
		t.Fatalf("note fields did not round-trip: %+v", notes)
	}
	if len(events) != 1 || events[0].Description != "Applied" {
		t.Fatalf("timeline fields did not round-trip: %+v", events)
	}
}

func TestPostgreSQLCandidateProfileRepository_SaveAndGetActive(t *testing.T) {
	db := openTestDB(t)
	repo := persistence.NewPostgreSQLCandidateProfileRepository(db)
	ctx := context.Background()
	now := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)

	profile := &domain.CandidateProfile{
		ID:                       domain.ActiveCandidateProfileID,
		TargetRoles:              "Senior Frontend Engineer",
		PreferredStack:           "React, TypeScript",
		CompensationExpectations: "$100k USD",
		LocationPreferences:      "Remote LATAM",
		WorkConstraints:          "No weekend work",
		CompanyPreferences:       "Product companies",
		WritingTone:              "Warm and concise",
		PositioningSummary:       "Frontend-leaning senior engineer",
		CreatedAt:                now,
		UpdatedAt:                now,
	}
	if _, err := repo.Save(ctx, profile); err != nil {
		t.Fatalf("Save: %v", err)
	}

	found, err := repo.GetActive(ctx)
	if err != nil {
		t.Fatalf("GetActive: %v", err)
	}
	if found.TargetRoles != profile.TargetRoles || found.WritingTone != profile.WritingTone {
		t.Fatalf("profile fields did not round-trip: %+v", found)
	}
}

func TestPostgreSQLCandidateMemoryRepository_MetadataAndSupersession(t *testing.T) {
	db := openTestDB(t)
	repo := persistence.NewPostgreSQLCandidateMemoryRepository(db)
	ctx := context.Background()
	now := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)

	replacement, err := repo.Save(ctx, &domain.CandidateMemoryRecord{
		ID:         "memory-2",
		MemoryType: domain.MemoryPreference,
		Title:      "Current preference",
		Body:       "Prefer product companies.",
		Approved:   true,
		Metadata:   json.RawMessage(`{"confidence":"high"}`),
		CreatedAt:  now,
		UpdatedAt:  now,
	})
	if err != nil {
		t.Fatalf("save replacement: %v", err)
	}
	original, err := repo.Save(ctx, &domain.CandidateMemoryRecord{
		ID:         "memory-1",
		MemoryType: domain.MemoryPreference,
		Title:      "Old preference",
		Body:       "Open to anything.",
		Source:     "manual",
		Approved:   true,
		Sensitive:  true,
		Metadata:   json.RawMessage(`{"source":"test"}`),
		CreatedAt:  now.Add(-time.Hour),
		UpdatedAt:  now.Add(-time.Hour),
	})
	if err != nil {
		t.Fatalf("save original: %v", err)
	}
	if _, err := repo.Supersede(ctx, original.ID, replacement.ID, now); err != nil {
		t.Fatalf("Supersede: %v", err)
	}

	records, err := repo.ListApprovedCurrent(ctx)
	if err != nil {
		t.Fatalf("ListApprovedCurrent: %v", err)
	}
	if len(records) != 1 || records[0].ID != replacement.ID {
		t.Fatalf("expected only replacement in approved current list, got %+v", records)
	}
	if string(replacement.Metadata) != `{"confidence":"high"}` {
		t.Fatalf("metadata did not round-trip: %s", replacement.Metadata)
	}
}

func TestPostgreSQLAIArtifactRepository_OwnerFilteringAndEditedContent(t *testing.T) {
	db := openTestDB(t)
	repo := persistence.NewPostgreSQLAIArtifactRepository(db)
	ctx := context.Background()
	now := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)
	owner := domain.OwnerReference{Type: domain.OwnerTypeApplication, ID: "app-1"}
	otherOwner := domain.OwnerReference{Type: domain.OwnerTypeApplication, ID: "app-2"}
	provider := "openai"
	model := "gpt-test"

	target, err := repo.Save(ctx, &domain.AIArtifact{
		ID:               "artifact-1",
		ArtifactType:     domain.ArtifactApplicationDraft,
		Owner:            owner,
		Title:            "Cover letter",
		SourceInputs:     json.RawMessage(`[{"type":"candidate_profile","id":"default"}]`),
		GeneratedContent: "Generated draft",
		Status:           domain.ArtifactDraft,
		Sensitive:        true,
		Provenance: domain.ArtifactProvenance{
			ProviderName:  &provider,
			ModelName:     &model,
			UsageMetadata: json.RawMessage(`{"totalTokens":12}`),
		},
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("save target: %v", err)
	}
	if _, err := repo.Save(ctx, &domain.AIArtifact{
		ID:               "artifact-2",
		ArtifactType:     domain.ArtifactOther,
		Owner:            otherOwner,
		Title:            "Other",
		GeneratedContent: "Other content",
		Status:           domain.ArtifactDraft,
		CreatedAt:        now,
		UpdatedAt:        now,
	}); err != nil {
		t.Fatalf("save other: %v", err)
	}

	edited := "Edited draft"
	updated, err := repo.UpdateEditedContent(ctx, target.ID, &edited, now.Add(time.Minute))
	if err != nil {
		t.Fatalf("UpdateEditedContent: %v", err)
	}
	if updated.GeneratedContent != "Generated draft" {
		t.Fatalf("generated content was overwritten: %+v", updated)
	}
	if updated.UserEditedContent == nil || *updated.UserEditedContent != edited {
		t.Fatalf("edited content not stored: %+v", updated)
	}

	artifacts, err := repo.ListByOwner(ctx, owner)
	if err != nil {
		t.Fatalf("ListByOwner: %v", err)
	}
	if len(artifacts) != 1 || artifacts[0].ID != target.ID {
		t.Fatalf("expected only target artifact, got %+v", artifacts)
	}
	if !artifacts[0].Sensitive || artifacts[0].Provenance.ProviderName == nil || *artifacts[0].Provenance.ProviderName != provider {
		t.Fatalf("provenance/sensitivity did not round-trip: %+v", artifacts[0])
	}
}
