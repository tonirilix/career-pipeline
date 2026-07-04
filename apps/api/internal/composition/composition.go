package composition

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/tonirilix/career-pipeline/apps/api/graph/resolvers"
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence"
)

type wallClock struct{}

func (c *wallClock) Now() time.Time { return time.Now() }

type uuidGenerator struct{}

func (g *uuidGenerator) New() string { return uuid.NewString() }

func NewResolver(database *sql.DB) *resolvers.Resolver {
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(database)
	interviewRepo := persistence.NewPostgreSQLInterviewRepository(database)
	followUpRepo := persistence.NewPostgreSQLFollowUpRepository(database)
	noteRepo := persistence.NewPostgreSQLNoteRepository(database)
	timelineRepo := persistence.NewPostgreSQLTimelineRepository(database)
	candidateProfileRepo := persistence.NewPostgreSQLCandidateProfileRepository(database)
	candidateMemoryRepo := persistence.NewPostgreSQLCandidateMemoryRepository(database)
	aiArtifactRepo := persistence.NewPostgreSQLAIArtifactRepository(database)
	assembler := usecases.NewFullApplicationAssembler(followUpRepo, timelineRepo, interviewRepo, noteRepo)
	transactor := persistence.NewPostgreSQLTransactor(database)

	clock := &wallClock{}
	ids := &uuidGenerator{}

	createAppUC := usecases.NewCreateApplication(transactor, clock, ids)
	advanceStageUC := usecases.NewAdvanceStage(transactor, clock, ids)
	scheduleInterviewUC := usecases.NewScheduleInterview(transactor, clock, ids)
	recordOutcomeUC := usecases.NewRecordInterviewOutcome(transactor, clock, ids)
	addFollowUpUC := usecases.NewAddFollowUp(transactor, clock, ids)
	completeFollowUpUC := usecases.NewCompleteFollowUp(transactor, clock, ids)
	addNoteUC := usecases.NewAddNote(transactor, clock, ids)
	listApplicationsUC := usecases.NewListApplications(appRepo, assembler)
	getCandidateProfileUC := usecases.NewGetCandidateProfile(candidateProfileRepo)
	updateCandidateProfileUC := usecases.NewUpdateCandidateProfile(candidateProfileRepo, clock)
	candidateMemoryUC := usecases.NewCandidateMemory(candidateMemoryRepo, clock, ids)
	groundingContextUC := usecases.NewGetCandidateGroundingContext(candidateProfileRepo, candidateMemoryRepo)
	aiArtifactsUC := usecases.NewAIArtifacts(aiArtifactRepo, clock, ids)

	return &resolvers.Resolver{
		CreateApplicationUC:      createAppUC,
		AdvanceStageUC:           advanceStageUC,
		ScheduleInterviewUC:      scheduleInterviewUC,
		RecordOutcomeUC:          recordOutcomeUC,
		AddFollowUpUC:            addFollowUpUC,
		CompleteFollowUpUC:       completeFollowUpUC,
		AddNoteUC:                addNoteUC,
		ListApplicationsUC:       listApplicationsUC,
		GetCandidateProfileUC:    getCandidateProfileUC,
		UpdateCandidateProfileUC: updateCandidateProfileUC,
		CandidateMemoryUC:        candidateMemoryUC,
		GroundingContextUC:       groundingContextUC,
		AIArtifactsUC:            aiArtifactsUC,
	}
}
