package usecases_test

import (
	"errors"
	"testing"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/usecases"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

var fixedTime = time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC)

func newDeps() (
	*fakeAppRepo,
	*fakeFollowUpRepo,
	*fakeTimelineRepo,
	*fakeInterviewRepo,
	*fakeNoteRepo,
	*fakeClock,
	*fakeIDs,
) {
	return newFakeAppRepo(), newFakeFollowUpRepo(), newFakeTimelineRepo(),
		newFakeInterviewRepo(), newFakeNoteRepo(),
		&fakeClock{t: fixedTime}, &fakeIDs{}
}

// --- CreateApplication ---

func TestCreateApplication_Success(t *testing.T) {
	apps, _, timeline, _, _, clock, ids := newDeps()
	uc := usecases.NewCreateApplication(apps, timeline, clock, ids)

	app, err := uc.Execute(usecases.CreateApplicationCommand{
		Company:        "Acme Corp",
		RoleTitle:      "Engineer",
		PostingURL:     "https://example.com",
		Source:         domain.SourceLinkedIn,
		EmploymentType: domain.EmploymentFullTime,
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if app.Stage != domain.StageSaved {
		t.Errorf("expected stage Saved, got %s", app.Stage)
	}
	if len(app.Timeline) != 1 {
		t.Errorf("expected 1 timeline event, got %d", len(app.Timeline))
	}
	if !app.CreatedAt.Equal(fixedTime) {
		t.Errorf("expected createdAt %v, got %v", fixedTime, app.CreatedAt)
	}
}

// --- AdvanceStage ---

func TestAdvanceStage_ValidTransition(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	uc := usecases.NewAdvanceStage(apps, followUps, timeline, interviews, notes, clock, ids)

	app, err := uc.Execute(usecases.AdvanceStageCommand{ApplicationID: "app-1", ToStage: domain.StageScreening})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if app.Stage != domain.StageScreening {
		t.Errorf("expected stage Screening, got %s", app.Stage)
	}
}

func TestAdvanceStage_InvalidTransition(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageSaved})
	uc := usecases.NewAdvanceStage(apps, followUps, timeline, interviews, notes, clock, ids)

	_, err := uc.Execute(usecases.AdvanceStageCommand{ApplicationID: "app-1", ToStage: domain.StageOffer})
	if !errors.Is(err, domain.ErrInvalidStageTransition) {
		t.Errorf("expected ErrInvalidStageTransition, got %v", err)
	}
}

func TestAdvanceStage_DeactivatesFollowUpsOnClose(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	dueAt := fixedTime.Add(24 * time.Hour)
	_ = followUps.Save(&domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: dueAt})
	uc := usecases.NewAdvanceStage(apps, followUps, timeline, interviews, notes, clock, ids)

	_, err := uc.Execute(usecases.AdvanceStageCommand{ApplicationID: "app-1", ToStage: domain.StageRejected})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	fu, _ := followUps.FindByID("fu-1")
	if fu.CompletedAt == nil {
		t.Error("expected follow-up to be deactivated")
	}
}

// --- AddNote ---

func TestAddNote_EmptyBodyReturnsError(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	uc := usecases.NewAddNote(apps, followUps, timeline, interviews, notes, clock, ids)

	_, err := uc.Execute(usecases.AddNoteCommand{ApplicationID: "app-1", Body: "  "})
	if !errors.Is(err, domain.ErrNoteBodyEmpty) {
		t.Errorf("expected ErrNoteBodyEmpty, got %v", err)
	}
}

func TestAddNote_Success(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	uc := usecases.NewAddNote(apps, followUps, timeline, interviews, notes, clock, ids)

	app, err := uc.Execute(usecases.AddNoteCommand{ApplicationID: "app-1", Body: "Great company"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(app.Notes) != 1 {
		t.Errorf("expected 1 note, got %d", len(app.Notes))
	}
}

// --- AddFollowUp ---

func TestAddFollowUp_PastDueDateReturnsError(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	// Put a timeline event at fixedTime so dueAt must be after it
	_ = timeline.Save("app-1", &domain.TimelineEvent{ID: "t-1", OccurredAt: fixedTime, Description: "Created"})
	uc := usecases.NewAddFollowUp(apps, followUps, timeline, interviews, notes, clock, ids)

	pastDue := fixedTime.Add(-1 * time.Hour)
	_, err := uc.Execute(usecases.CreateFollowUpCommand{
		ApplicationID: "app-1",
		DueAt:         pastDue.Format(time.RFC3339),
		Note:          "Follow up",
	})
	if !errors.Is(err, domain.ErrDueDateInPast) {
		t.Errorf("expected ErrDueDateInPast, got %v", err)
	}
}

// --- ListApplications ---

func TestListApplications_FiltersAndReturnsAll(t *testing.T) {
	apps, followUps, timeline, interviews, notes, _, _ := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	_ = apps.Save(&domain.JobApplication{ID: "app-2", Stage: domain.StageSaved})
	uc := usecases.NewListApplications(apps, followUps, timeline, interviews, notes)

	list, err := uc.Execute(ports.ListApplicationsFilter{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(list) != 2 {
		t.Errorf("expected 2 applications, got %d", len(list))
	}
}

// --- ListUpcomingFollowUps / ListOverdueFollowUps ---

func TestListUpcomingFollowUps(t *testing.T) {
	_, followUps, _, _, _, clock, _ := newDeps()
	future := fixedTime.Add(1 * time.Hour)
	_ = followUps.Save(&domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: future})
	uc := usecases.NewListUpcomingFollowUps(followUps, clock)

	list, err := uc.Execute()
	if err != nil || len(list) != 1 {
		t.Errorf("expected 1 upcoming follow-up, got %d (err: %v)", len(list), err)
	}
}

func TestListOverdueFollowUps(t *testing.T) {
	_, followUps, _, _, _, clock, _ := newDeps()
	past := fixedTime.Add(-1 * time.Hour)
	_ = followUps.Save(&domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: past})
	uc := usecases.NewListOverdueFollowUps(followUps, clock)

	list, err := uc.Execute()
	if err != nil || len(list) != 1 {
		t.Errorf("expected 1 overdue follow-up, got %d (err: %v)", len(list), err)
	}
}
