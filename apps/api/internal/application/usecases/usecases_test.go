package usecases_test

import (
	"errors"
	"testing"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
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

func newAssembler(
	followUps *fakeFollowUpRepo,
	timeline *fakeTimelineRepo,
	interviews *fakeInterviewRepo,
	notes *fakeNoteRepo,
) *usecases.FullApplicationAssembler {
	return usecases.NewFullApplicationAssembler(followUps, timeline, interviews, notes)
}

func newTx(
	apps *fakeAppRepo,
	followUps *fakeFollowUpRepo,
	timeline *fakeTimelineRepo,
	interviews *fakeInterviewRepo,
	notes *fakeNoteRepo,
) *fakeTransactor {
	return newFakeTransactor(apps, followUps, timeline, interviews, notes)
}

// --- CreateApplication ---

func TestCreateApplication_Success(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	uc := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

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

func TestCreateApplication_MissingCompanyReturnsDomainError(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	uc := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.CreateApplicationCommand{
		Company:        " ",
		RoleTitle:      "Engineer",
		PostingURL:     "https://example.com",
		Source:         domain.SourceLinkedIn,
		EmploymentType: domain.EmploymentFullTime,
	})

	if !errors.Is(err, domain.ErrCompanyRequired) {
		t.Fatalf("expected ErrCompanyRequired, got %v", err)
	}
	if !errors.Is(err, domain.ErrCompanyRequired) || errors.Is(err, domain.ErrNoteBodyEmpty) {
		t.Fatalf("expected company error to be distinct from note body error")
	}
	if got, _ := apps.List(ports.ListApplicationsFilter{}); len(got) != 0 {
		t.Fatalf("expected no persisted applications, got %d", len(got))
	}
}

func TestCreateApplication_MissingRoleTitleReturnsDomainError(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	uc := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.CreateApplicationCommand{
		Company:        "Acme Corp",
		RoleTitle:      " ",
		PostingURL:     "https://example.com",
		Source:         domain.SourceLinkedIn,
		EmploymentType: domain.EmploymentFullTime,
	})

	if !errors.Is(err, domain.ErrRoleTitleRequired) {
		t.Fatalf("expected ErrRoleTitleRequired, got %v", err)
	}
	if errors.Is(err, domain.ErrNoteBodyEmpty) {
		t.Fatalf("expected role title error to be distinct from note body error")
	}
	if got, _ := apps.List(ports.ListApplicationsFilter{}); len(got) != 0 {
		t.Fatalf("expected no persisted applications, got %d", len(got))
	}
}

func TestCreateApplication_RollsBackWhenTimelineFails(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	timeline.saveErr = errNotFound
	uc := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.CreateApplicationCommand{
		Company:        "Acme Corp",
		RoleTitle:      "Engineer",
		PostingURL:     "https://example.com",
		Source:         domain.SourceLinkedIn,
		EmploymentType: domain.EmploymentFullTime,
	})

	if !errors.Is(err, errNotFound) {
		t.Fatalf("expected timeline error, got %v", err)
	}
	if got, _ := apps.List(ports.ListApplicationsFilter{}); len(got) != 0 {
		t.Fatalf("expected application rollback, got %d applications", len(got))
	}
}

// --- AdvanceStage ---

func TestAdvanceStage_ValidTransition(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	uc := usecases.NewAdvanceStage(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

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
	uc := usecases.NewAdvanceStage(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

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
	uc := usecases.NewAdvanceStage(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.AdvanceStageCommand{ApplicationID: "app-1", ToStage: domain.StageRejected})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	fu, _ := followUps.FindByID("fu-1")
	if fu.CompletedAt == nil {
		t.Error("expected follow-up to be deactivated")
	}
}

func TestAdvanceStage_RollsBackWhenTimelineFails(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	timeline.saveErr = errNotFound
	uc := usecases.NewAdvanceStage(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.AdvanceStageCommand{ApplicationID: "app-1", ToStage: domain.StageScreening})
	if !errors.Is(err, errNotFound) {
		t.Fatalf("expected timeline error, got %v", err)
	}
	app, _ := apps.FindByID("app-1")
	if app.Stage != domain.StageApplied {
		t.Fatalf("expected stage rollback to Applied, got %s", app.Stage)
	}
}

func TestAdvanceStage_RollsBackWhenFollowUpDeactivationFails(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	_ = followUps.Save(&domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: fixedTime.Add(24 * time.Hour)})
	followUps.deactivateErr = errNotFound
	uc := usecases.NewAdvanceStage(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.AdvanceStageCommand{ApplicationID: "app-1", ToStage: domain.StageRejected})
	if !errors.Is(err, errNotFound) {
		t.Fatalf("expected follow-up deactivation error, got %v", err)
	}
	app, _ := apps.FindByID("app-1")
	if app.Stage != domain.StageApplied {
		t.Fatalf("expected stage rollback to Applied, got %s", app.Stage)
	}
	fu, _ := followUps.FindByID("fu-1")
	if fu.CompletedAt != nil {
		t.Fatal("expected follow-up completion rollback")
	}
}

// --- AddNote ---

func TestAddNote_EmptyBodyReturnsError(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	uc := usecases.NewAddNote(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.AddNoteCommand{ApplicationID: "app-1", Body: "  "})
	if !errors.Is(err, domain.ErrNoteBodyEmpty) {
		t.Errorf("expected ErrNoteBodyEmpty, got %v", err)
	}
}

func TestAddNote_Success(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	uc := usecases.NewAddNote(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	app, err := uc.Execute(usecases.AddNoteCommand{ApplicationID: "app-1", Body: "Great company"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(app.Notes) != 1 {
		t.Errorf("expected 1 note, got %d", len(app.Notes))
	}
}

func TestDetailWorkflows_RollBackWhenTimelineFails(t *testing.T) {
	t.Run("schedule interview", func(t *testing.T) {
		apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
		_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
		timeline.saveErr = errNotFound
		uc := usecases.NewScheduleInterview(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

		_, err := uc.Execute(usecases.ScheduleInterviewCommand{
			ApplicationID: "app-1",
			Type:          domain.InterviewRecruiterScreen,
			ScheduledAt:   fixedTime.Add(24 * time.Hour).Format(time.RFC3339),
		})
		if !errors.Is(err, errNotFound) {
			t.Fatalf("expected timeline error, got %v", err)
		}
		if got, _ := interviews.ListByApplication("app-1"); len(got) != 0 {
			t.Fatalf("expected interview rollback, got %d interviews", len(got))
		}
	})

	t.Run("create follow-up", func(t *testing.T) {
		apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
		_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
		_ = timeline.Save("app-1", &domain.TimelineEvent{ID: "event-1", OccurredAt: fixedTime})
		timeline.saveErr = errNotFound
		uc := usecases.NewAddFollowUp(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

		_, err := uc.Execute(usecases.CreateFollowUpCommand{
			ApplicationID: "app-1",
			DueAt:         fixedTime.Add(24 * time.Hour).Format(time.RFC3339),
			Note:          "Follow up",
		})
		if !errors.Is(err, errNotFound) {
			t.Fatalf("expected timeline error, got %v", err)
		}
		if got, _ := followUps.ListByApplication("app-1"); len(got) != 0 {
			t.Fatalf("expected follow-up rollback, got %d follow-ups", len(got))
		}
	})

	t.Run("complete follow-up", func(t *testing.T) {
		apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
		_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
		_ = followUps.Save(&domain.FollowUpReminder{ID: "fu-1", ApplicationID: "app-1", DueAt: fixedTime.Add(24 * time.Hour)})
		timeline.saveErr = errNotFound
		uc := usecases.NewCompleteFollowUp(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

		_, err := uc.Execute(usecases.CompleteFollowUpCommand{ApplicationID: "app-1", ReminderID: "fu-1"})
		if !errors.Is(err, errNotFound) {
			t.Fatalf("expected timeline error, got %v", err)
		}
		fu, _ := followUps.FindByID("fu-1")
		if fu.CompletedAt != nil {
			t.Fatal("expected follow-up completion rollback")
		}
	})

	t.Run("add note", func(t *testing.T) {
		apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
		_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
		timeline.saveErr = errNotFound
		uc := usecases.NewAddNote(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

		_, err := uc.Execute(usecases.AddNoteCommand{ApplicationID: "app-1", Body: "Great company"})
		if !errors.Is(err, errNotFound) {
			t.Fatalf("expected timeline error, got %v", err)
		}
		if got, _ := notes.ListByApplication("app-1"); len(got) != 0 {
			t.Fatalf("expected note rollback, got %d notes", len(got))
		}
	})
}

// --- AddFollowUp ---

func TestScheduleInterview_ValidStageCreatesScheduledInterview(t *testing.T) {
	for _, stage := range []domain.ApplicationStage{
		domain.StageApplied,
		domain.StageScreening,
		domain.StageTechnicalInterview,
		domain.StageOnsite,
	} {
		t.Run(string(stage), func(t *testing.T) {
			apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
			_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: stage})
			uc := usecases.NewScheduleInterview(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

			app, err := uc.Execute(usecases.ScheduleInterviewCommand{
				ApplicationID: "app-1",
				Type:          domain.InterviewRecruiterScreen,
				ScheduledAt:   fixedTime.Add(24 * time.Hour).Format(time.RFC3339),
				Notes:         "Ask about team shape",
			})

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if len(app.Interviews) != 1 {
				t.Fatalf("expected 1 interview, got %d", len(app.Interviews))
			}
			if app.Interviews[0].Outcome != domain.OutcomeScheduled {
				t.Fatalf("expected scheduled outcome, got %s", app.Interviews[0].Outcome)
			}
		})
	}
}

func TestScheduleInterview_InvalidStagesReturnError(t *testing.T) {
	for _, stage := range []domain.ApplicationStage{
		domain.StageSaved,
		domain.StageOffer,
		domain.StageRejected,
		domain.StageWithdrawn,
	} {
		t.Run(string(stage), func(t *testing.T) {
			apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
			_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: stage})
			uc := usecases.NewScheduleInterview(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

			_, err := uc.Execute(usecases.ScheduleInterviewCommand{
				ApplicationID: "app-1",
				Type:          domain.InterviewRecruiterScreen,
				ScheduledAt:   fixedTime.Add(24 * time.Hour).Format(time.RFC3339),
			})

			if !errors.Is(err, domain.ErrCannotSchedule) {
				t.Fatalf("expected ErrCannotSchedule, got %v", err)
			}
			if got, _ := interviews.ListByApplication("app-1"); len(got) != 0 {
				t.Fatalf("expected no persisted interviews, got %d", len(got))
			}
		})
	}
}

func TestRecordInterviewOutcome_Success(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageScreening})
	_ = interviews.Save("app-1", &domain.Interview{
		ID:          "interview-1",
		Type:        domain.InterviewRecruiterScreen,
		ScheduledAt: fixedTime.Add(24 * time.Hour),
		Outcome:     domain.OutcomeScheduled,
	})
	uc := usecases.NewRecordInterviewOutcome(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	app, err := uc.Execute(usecases.RecordInterviewOutcomeCommand{
		ApplicationID: "app-1",
		InterviewID:   "interview-1",
		Outcome:       domain.OutcomePassed,
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if app.Interviews[0].Outcome != domain.OutcomePassed {
		t.Fatalf("expected Passed outcome, got %s", app.Interviews[0].Outcome)
	}
	if len(app.Timeline) != 1 {
		t.Fatalf("expected timeline event, got %d", len(app.Timeline))
	}
}

func TestRecordInterviewOutcome_RejectsScheduledOutcome(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageScreening})
	uc := usecases.NewRecordInterviewOutcome(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

	_, err := uc.Execute(usecases.RecordInterviewOutcomeCommand{
		ApplicationID: "app-1",
		InterviewID:   "interview-1",
		Outcome:       domain.OutcomeScheduled,
	})

	if !errors.Is(err, domain.ErrInvalidOutcome) {
		t.Fatalf("expected ErrInvalidOutcome, got %v", err)
	}
}

func TestAddFollowUp_PastDueDateReturnsError(t *testing.T) {
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	// Put a timeline event at fixedTime so dueAt must be after it
	_ = timeline.Save("app-1", &domain.TimelineEvent{ID: "t-1", OccurredAt: fixedTime, Description: "Created"})
	uc := usecases.NewAddFollowUp(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

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

func TestAddFollowUp_ClosedApplicationsReturnError(t *testing.T) {
	for _, stage := range []domain.ApplicationStage{domain.StageRejected, domain.StageWithdrawn} {
		t.Run(string(stage), func(t *testing.T) {
			apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
			_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: stage})
			_ = timeline.Save("app-1", &domain.TimelineEvent{ID: "t-1", OccurredAt: fixedTime, Description: "Created"})
			uc := usecases.NewAddFollowUp(newTx(apps, followUps, timeline, interviews, notes), clock, ids)

			_, err := uc.Execute(usecases.CreateFollowUpCommand{
				ApplicationID: "app-1",
				DueAt:         fixedTime.Add(24 * time.Hour).Format(time.RFC3339),
				Note:          "Follow up",
			})
			if !errors.Is(err, domain.ErrCannotCreateWork) {
				t.Fatalf("expected ErrCannotCreateWork, got %v", err)
			}
			if got, _ := followUps.ListByApplication("app-1"); len(got) != 0 {
				t.Fatalf("expected no persisted follow-ups, got %d", len(got))
			}
		})
	}
}

// --- ListApplications ---

func TestListApplications_FiltersAndReturnsAll(t *testing.T) {
	apps, followUps, timeline, interviews, notes, _, _ := newDeps()
	_ = apps.Save(&domain.JobApplication{ID: "app-1", Stage: domain.StageApplied})
	_ = apps.Save(&domain.JobApplication{ID: "app-2", Stage: domain.StageSaved})
	uc := usecases.NewListApplications(apps, newAssembler(followUps, timeline, interviews, notes))

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
