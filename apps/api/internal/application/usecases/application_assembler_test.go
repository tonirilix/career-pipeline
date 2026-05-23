package usecases_test

import (
	"testing"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func TestFullApplicationAssembler_LoadsChildCollectionsInRepositoryOrder(t *testing.T) {
	_, followUps, timeline, interviews, notes, _, _ := newDeps()
	application := &domain.JobApplication{ID: "app-1", Stage: domain.StageApplied}
	first := fixedTime.Add(-1 * time.Hour)
	second := fixedTime.Add(1 * time.Hour)

	_ = timeline.Save("app-1", &domain.TimelineEvent{ID: "event-1", OccurredAt: first, Description: "First"})
	_ = timeline.Save("app-1", &domain.TimelineEvent{ID: "event-2", OccurredAt: second, Description: "Second"})
	_ = interviews.Save("app-1", &domain.Interview{ID: "interview-1", Type: domain.InterviewRecruiterScreen, ScheduledAt: second})
	_ = interviews.Save("app-1", &domain.Interview{ID: "interview-2", Type: domain.InterviewTechnical, ScheduledAt: first})
	_ = followUps.Save(&domain.FollowUpReminder{ID: "follow-up-1", ApplicationID: "app-1", DueAt: second})
	_ = followUps.Save(&domain.FollowUpReminder{ID: "follow-up-2", ApplicationID: "app-1", DueAt: first})
	_ = notes.Save("app-1", &domain.ApplicationNote{ID: "note-1", Body: "First note", CreatedAt: first})
	_ = notes.Save("app-1", &domain.ApplicationNote{ID: "note-2", Body: "Second note", CreatedAt: second})

	loaded, err := usecases.NewFullApplicationAssembler(followUps, timeline, interviews, notes).Load(application)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	assertIDs(t, "timeline", []string{loaded.Timeline[0].ID, loaded.Timeline[1].ID}, []string{"event-1", "event-2"})
	assertIDs(t, "interviews", []string{loaded.Interviews[0].ID, loaded.Interviews[1].ID}, []string{"interview-1", "interview-2"})
	assertIDs(t, "follow-ups", []string{loaded.FollowUps[0].ID, loaded.FollowUps[1].ID}, []string{"follow-up-1", "follow-up-2"})
	assertIDs(t, "notes", []string{loaded.Notes[0].ID, loaded.Notes[1].ID}, []string{"note-1", "note-2"})

	if loaded.Timeline[0].OccurredAt != first || loaded.FollowUps[0].DueAt != second {
		t.Fatalf("expected loaded values to preserve repository values")
	}
}

func TestUseCasesSourceDoesNotReimplementFullApplicationAssembly(t *testing.T) {
	violations := sourceFilesWithReference(t, "ListByApplication", "application_assembler.go", "add_follow_up.go")
	if len(violations) > 0 {
		t.Fatalf("full application assembly leaked into use cases: %v", violations)
	}
}

func assertIDs(t *testing.T, label string, got []string, want []string) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("%s: expected %d ids, got %d", label, len(want), len(got))
	}
	for i := range got {
		if got[i] != want[i] {
			t.Fatalf("%s[%d]: expected %s, got %s", label, i, want[i], got[i])
		}
	}
}
