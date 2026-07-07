package resolvers

import (
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
)

type Resolver struct {
	CreateApplicationUC      *usecases.CreateApplication
	AdvanceStageUC           *usecases.AdvanceStage
	ScheduleInterviewUC      *usecases.ScheduleInterview
	RecordOutcomeUC          *usecases.RecordInterviewOutcome
	AddFollowUpUC            *usecases.AddFollowUp
	CompleteFollowUpUC       *usecases.CompleteFollowUp
	AddNoteUC                *usecases.AddNote
	ListApplicationsUC       *usecases.ListApplications
	GetCandidateProfileUC    *usecases.GetCandidateProfile
	UpdateCandidateProfileUC *usecases.UpdateCandidateProfile
	CandidateMemoryUC        *usecases.CandidateMemory
	GroundingContextUC       *usecases.GetCandidateGroundingContext
	AIArtifactsUC            *usecases.AIArtifacts
	RoleSearchTopicsUC       *usecases.RoleSearchTopics
	RoleRecordsUC            *usecases.RoleRecords
}
