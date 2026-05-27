package resolvers

import (
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
)

type Resolver struct {
	CreateApplicationUC *usecases.CreateApplication
	AdvanceStageUC      *usecases.AdvanceStage
	ScheduleInterviewUC *usecases.ScheduleInterview
	RecordOutcomeUC     *usecases.RecordInterviewOutcome
	AddFollowUpUC       *usecases.AddFollowUp
	CompleteFollowUpUC  *usecases.CompleteFollowUp
	AddNoteUC           *usecases.AddNote
	ListApplicationsUC  *usecases.ListApplications
}
