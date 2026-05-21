package persistence_test

import (
	"database/sql"
	"os"
	"testing"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/infrastructure/persistence"
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
	_, err := db.Exec(`TRUNCATE timeline_events, application_notes, follow_up_reminders, interviews, job_applications RESTART IDENTITY CASCADE`)
	if err != nil {
		t.Fatalf("truncate test db: %v", err)
	}
}

func TestPostgreSQLJobApplicationRepository_SaveAndFind(t *testing.T) {
	db := openTestDB(t)
	repo := persistence.NewPostgreSQLJobApplicationRepository(db)

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

	if err := repo.Save(app); err != nil {
		t.Fatalf("Save: %v", err)
	}

	found, err := repo.FindByID("app-1")
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
	_ = repo.Save(&domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})

	if err := repo.UpdateStage("app-1", domain.StageApplied); err != nil {
		t.Fatalf("UpdateStage: %v", err)
	}
	found, _ := repo.FindByID("app-1")
	if found.Stage != domain.StageApplied {
		t.Errorf("expected Applied, got %s", found.Stage)
	}
}

func TestPostgreSQLTimelineRepository_SaveAndList(t *testing.T) {
	db := openTestDB(t)
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	repo := persistence.NewPostgreSQLTimelineRepository(db)

	_ = appRepo.Save(&domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})
	event := &domain.TimelineEvent{ID: "ev-1", Description: "Saved", OccurredAt: time.Now()}
	if err := repo.Save("app-1", event); err != nil {
		t.Fatalf("Save: %v", err)
	}
	events, err := repo.ListByApplication("app-1")
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

	_ = appRepo.Save(&domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})
	note := &domain.ApplicationNote{ID: "n-1", Body: "Test note", CreatedAt: time.Now()}
	if err := repo.Save("app-1", note); err != nil {
		t.Fatalf("Save: %v", err)
	}
	notes, err := repo.ListByApplication("app-1")
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

	_ = appRepo.Save(&domain.JobApplication{ID: "app-1", Company: "X", RoleTitle: "Y", Stage: domain.StageSaved, CreatedAt: time.Now()})
	future := time.Now().Add(24 * time.Hour)
	fu := &domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: future, Note: "Follow up"}
	if err := repo.Save(fu); err != nil {
		t.Fatalf("Save: %v", err)
	}

	upcoming, err := repo.ListUpcoming(time.Now())
	if err != nil || len(upcoming) != 1 {
		t.Errorf("expected 1 upcoming, got %d (err: %v)", len(upcoming), err)
	}

	now := time.Now()
	if err := repo.UpdateCompleted("fu-1", now); err != nil {
		t.Fatalf("UpdateCompleted: %v", err)
	}
	found, _ := repo.FindByID("fu-1")
	if found.CompletedAt == nil {
		t.Error("expected CompletedAt to be set")
	}
}
