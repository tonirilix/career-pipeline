package composition

import "testing"

func TestNewResolverWiresJobApplicationUseCases(t *testing.T) {
	resolver := NewResolver(nil)

	if resolver.CreateApplicationUC == nil {
		t.Fatal("CreateApplicationUC was not wired")
	}
	if resolver.AdvanceStageUC == nil {
		t.Fatal("AdvanceStageUC was not wired")
	}
	if resolver.ScheduleInterviewUC == nil {
		t.Fatal("ScheduleInterviewUC was not wired")
	}
	if resolver.RecordOutcomeUC == nil {
		t.Fatal("RecordOutcomeUC was not wired")
	}
	if resolver.AddFollowUpUC == nil {
		t.Fatal("AddFollowUpUC was not wired")
	}
	if resolver.CompleteFollowUpUC == nil {
		t.Fatal("CompleteFollowUpUC was not wired")
	}
	if resolver.AddNoteUC == nil {
		t.Fatal("AddNoteUC was not wired")
	}
	if resolver.ListApplicationsUC == nil {
		t.Fatal("ListApplicationsUC was not wired")
	}
}
