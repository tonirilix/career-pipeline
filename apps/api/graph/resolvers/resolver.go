package resolvers

import (
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/usecases"
)

type Resolver struct {
	CreateApplicationUC *usecases.CreateApplication
	AdvanceStageUC      *usecases.AdvanceStage
	ScheduleInterviewUC *usecases.ScheduleInterview
	AddFollowUpUC       *usecases.AddFollowUp
	CompleteFollowUpUC  *usecases.CompleteFollowUp
	AddNoteUC           *usecases.AddNote
	ListApplicationsUC  *usecases.ListApplications
}
