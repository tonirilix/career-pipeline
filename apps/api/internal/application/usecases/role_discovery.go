package usecases

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type UpsertRoleSearchTopicCommand struct {
	ID               string
	Name             string
	TargetTitles     string
	PreferredStack   string
	Location         string
	RemotePreference string
	EmploymentType   domain.EmploymentType
	CompanyType      domain.RoleCompanyType
	Compensation     string
	Seniority        domain.RoleSeniority
	Notes            string
}

type RoleSearchTopics struct {
	topics ports.RoleSearchTopicRepository
	clock  ports.Clock
	ids    ports.IDGenerator
}

func NewRoleSearchTopics(topics ports.RoleSearchTopicRepository, clock ports.Clock, ids ports.IDGenerator) *RoleSearchTopics {
	return &RoleSearchTopics{topics: topics, clock: clock, ids: ids}
}

func (uc *RoleSearchTopics) Create(ctx context.Context, cmd UpsertRoleSearchTopicCommand) (*domain.RoleSearchTopic, error) {
	now := uc.clock.Now()
	topic := roleSearchTopicFromCommand(cmd)
	topic.ID = uc.ids.New()
	topic.CreatedAt = now
	topic.UpdatedAt = now
	return uc.topics.Save(ctx, topic)
}

func (uc *RoleSearchTopics) List(ctx context.Context) ([]*domain.RoleSearchTopic, error) {
	return uc.topics.List(ctx)
}

func (uc *RoleSearchTopics) Update(ctx context.Context, cmd UpsertRoleSearchTopicCommand) (*domain.RoleSearchTopic, error) {
	existing, err := uc.topics.FindByID(ctx, cmd.ID)
	if err != nil {
		return nil, err
	}
	updated := roleSearchTopicFromCommand(cmd)
	updated.ID = existing.ID
	updated.CreatedAt = existing.CreatedAt
	updated.UpdatedAt = uc.clock.Now()
	return uc.topics.Update(ctx, updated)
}

func roleSearchTopicFromCommand(cmd UpsertRoleSearchTopicCommand) *domain.RoleSearchTopic {
	return &domain.RoleSearchTopic{
		Name:             cmd.Name,
		TargetTitles:     cmd.TargetTitles,
		PreferredStack:   cmd.PreferredStack,
		Location:         cmd.Location,
		RemotePreference: cmd.RemotePreference,
		EmploymentType:   defaultEmploymentType(cmd.EmploymentType),
		CompanyType:      defaultCompanyType(cmd.CompanyType),
		Compensation:     cmd.Compensation,
		Seniority:        defaultSeniority(cmd.Seniority),
		Notes:            cmd.Notes,
	}
}

type RoleRecordCommand struct {
	SearchTopicID     *string
	Company           string
	Title             string
	PostingURL        string
	Source            string
	SourceKind        domain.RoleSourceKind
	ProviderSource    string
	Description       string
	RawSourceText     string
	Location          string
	RemoteEligibility domain.RoleRemoteEligibility
	EmploymentType    domain.EmploymentType
	Seniority         domain.RoleSeniority
	Compensation      string
	Stack             string
	CompanyType       domain.RoleCompanyType
	FreshnessStatus   domain.RoleFreshnessStatus
	Metadata          json.RawMessage
}

type UpdateRoleDecisionCommand struct {
	ID              string
	Status          domain.RoleDecisionStatus
	RejectionReason domain.RoleRejectionReason
}

type UpdateRoleFreshnessCommand struct {
	ID        string
	Status    domain.RoleFreshnessStatus
	CheckedAt *time.Time
}

type RoleRecords struct {
	roles          ports.RoleRecordRepository
	topics         ports.RoleSearchTopicRepository
	searchProvider ports.RoleSearchProvider
	createApp      *CreateApplication
	clock          ports.Clock
	ids            ports.IDGenerator
}

func NewRoleRecords(
	roles ports.RoleRecordRepository,
	topics ports.RoleSearchTopicRepository,
	searchProvider ports.RoleSearchProvider,
	createApp *CreateApplication,
	clock ports.Clock,
	ids ports.IDGenerator,
) *RoleRecords {
	return &RoleRecords{
		roles: roles, topics: topics, searchProvider: searchProvider,
		createApp: createApp, clock: clock, ids: ids,
	}
}

func (uc *RoleRecords) RunSearch(ctx context.Context, topicID string, maxRoles int) (*domain.RoleSearchRunResult, error) {
	topic, err := uc.topics.FindByID(ctx, topicID)
	if err != nil {
		return nil, err
	}
	results, err := uc.searchProvider.Search(ctx, domain.RoleSearchRequest{Topic: *topic, MaxRoles: maxRoles})
	if err != nil {
		return nil, errors.Join(domain.ErrRoleSearchProviderFailed, err)
	}
	run := &domain.RoleSearchRunResult{TopicID: topicID}
	for _, result := range results {
		if strings.TrimSpace(result.PostingURL) != "" {
			if existing, err := uc.roles.FindActiveByPostingURL(ctx, result.PostingURL); err == nil {
				run.Skipped = append(run.Skipped, domain.SkippedRoleSummary{
					Company: existing.Company, Title: existing.Title, PostingURL: existing.PostingURL, Reason: "duplicate",
				})
				continue
			} else if !errors.Is(err, domain.ErrRoleRecordNotFound) {
				return nil, err
			}
		}
		searchTopicID := topicID
		role, err := uc.create(ctx, RoleRecordCommand{
			SearchTopicID:     &searchTopicID,
			Company:           result.Company,
			Title:             result.Title,
			PostingURL:        result.PostingURL,
			Source:            result.Source,
			SourceKind:        domain.RoleSourceSearchResult,
			ProviderSource:    result.ProviderSource,
			Description:       result.Description,
			RawSourceText:     result.RawSourceText,
			Location:          result.Location,
			RemoteEligibility: result.RemoteEligibility,
			EmploymentType:    result.EmploymentType,
			Seniority:         result.Seniority,
			Compensation:      result.Compensation,
			Stack:             result.Stack,
			CompanyType:       result.CompanyType,
			FreshnessStatus:   result.FreshnessStatus,
			Metadata:          result.Metadata,
		})
		if errors.Is(err, domain.ErrDuplicateActiveRoleURL) {
			run.Skipped = append(run.Skipped, domain.SkippedRoleSummary{
				Company: result.Company, Title: result.Title, PostingURL: result.PostingURL, Reason: "duplicate",
			})
			continue
		}
		if err != nil {
			return nil, err
		}
		run.Imported = append(run.Imported, domain.ImportedRoleSummary{
			RoleID: role.ID, Company: role.Company, Title: role.Title, PostingURL: role.PostingURL,
		})
	}
	run.ImportedCount = len(run.Imported)
	run.SkippedCount = len(run.Skipped)
	return run, nil
}

func (uc *RoleRecords) CreateFromURL(ctx context.Context, cmd RoleRecordCommand) (*domain.RoleRecord, error) {
	cmd.SourceKind = domain.RoleSourceManualURL
	return uc.create(ctx, cmd)
}

func (uc *RoleRecords) CreateFromPaste(ctx context.Context, cmd RoleRecordCommand) (*domain.RoleRecord, error) {
	cmd.SourceKind = domain.RoleSourcePastedDescription
	if cmd.RawSourceText == "" {
		cmd.RawSourceText = cmd.Description
	}
	if cmd.Description == "" {
		cmd.Description = cmd.RawSourceText
	}
	return uc.create(ctx, cmd)
}

func (uc *RoleRecords) List(ctx context.Context, filter ports.ListRoleRecordsFilter) ([]*domain.RoleRecord, error) {
	return uc.roles.List(ctx, filter)
}

func (uc *RoleRecords) Get(ctx context.Context, id string) (*domain.RoleRecord, error) {
	return uc.roles.FindByID(ctx, id)
}

func (uc *RoleRecords) Update(ctx context.Context, id string, cmd RoleRecordCommand) (*domain.RoleRecord, error) {
	role, err := uc.roles.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := validateRequiredRoleFields(cmd.Company, cmd.Title); err != nil {
		return nil, err
	}
	role.Company = cmd.Company
	role.Title = cmd.Title
	role.PostingURL = cmd.PostingURL
	role.Source = cmd.Source
	role.SourceKind = defaultSourceKind(cmd.SourceKind)
	role.ProviderSource = cmd.ProviderSource
	role.Description = cmd.Description
	role.Location = cmd.Location
	role.RemoteEligibility = defaultRemoteEligibility(cmd.RemoteEligibility)
	role.EmploymentType = defaultEmploymentType(cmd.EmploymentType)
	role.Seniority = defaultSeniority(cmd.Seniority)
	role.Compensation = cmd.Compensation
	role.Stack = cmd.Stack
	role.CompanyType = defaultCompanyType(cmd.CompanyType)
	role.Metadata = nonNilJSON(cmd.Metadata, `{}`)
	role.UpdatedAt = uc.clock.Now()
	return uc.roles.Update(ctx, role)
}

func (uc *RoleRecords) UpdateDecision(ctx context.Context, cmd UpdateRoleDecisionCommand) (*domain.RoleRecord, error) {
	if err := domain.ValidateRoleDecisionStatus(cmd.Status); err != nil {
		return nil, err
	}
	reason := cmd.RejectionReason
	if cmd.Status != domain.RoleDecisionRejected {
		reason = domain.RoleRejectionNone
	}
	return uc.roles.UpdateDecision(ctx, cmd.ID, cmd.Status, reason, uc.clock.Now())
}

func (uc *RoleRecords) UpdateFreshness(ctx context.Context, cmd UpdateRoleFreshnessCommand) (*domain.RoleRecord, error) {
	if err := domain.ValidateRoleFreshnessStatus(cmd.Status); err != nil {
		return nil, err
	}
	return uc.roles.UpdateFreshness(ctx, cmd.ID, cmd.Status, cmd.CheckedAt, uc.clock.Now())
}

type PromoteRoleResult struct {
	Role        *domain.RoleRecord
	Application *domain.JobApplication
}

func (uc *RoleRecords) Promote(ctx context.Context, id string) (*PromoteRoleResult, error) {
	role, err := uc.roles.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if role.PromotedApplicationID != nil {
		return nil, domain.ErrRoleAlreadyPromoted
	}
	app, err := uc.createApp.Execute(ctx, CreateApplicationCommand{
		Company:        role.Company,
		RoleTitle:      role.Title,
		PostingURL:     role.PostingURL,
		Source:         jobSourceFromRole(role),
		Location:       role.Location,
		Compensation:   role.Compensation,
		EmploymentType: role.EmploymentType,
	})
	if err != nil {
		return nil, err
	}
	updated, err := uc.roles.LinkPromotedApplication(ctx, role.ID, app.ID, uc.clock.Now())
	if err != nil {
		return nil, err
	}
	return &PromoteRoleResult{Role: updated, Application: app}, nil
}

func (uc *RoleRecords) create(ctx context.Context, cmd RoleRecordCommand) (*domain.RoleRecord, error) {
	if err := validateRequiredRoleFields(cmd.Company, cmd.Title); err != nil {
		return nil, err
	}
	if strings.TrimSpace(cmd.PostingURL) != "" {
		if _, err := uc.roles.FindActiveByPostingURL(ctx, cmd.PostingURL); err == nil {
			return nil, domain.ErrDuplicateActiveRoleURL
		} else if !errors.Is(err, domain.ErrRoleRecordNotFound) {
			return nil, err
		}
	}
	now := uc.clock.Now()
	role := &domain.RoleRecord{
		ID:                uc.ids.New(),
		SearchTopicID:     cmd.SearchTopicID,
		Company:           cmd.Company,
		Title:             cmd.Title,
		PostingURL:        cmd.PostingURL,
		Source:            cmd.Source,
		SourceKind:        defaultSourceKind(cmd.SourceKind),
		ProviderSource:    cmd.ProviderSource,
		Description:       cmd.Description,
		RawSourceText:     cmd.RawSourceText,
		Location:          cmd.Location,
		RemoteEligibility: defaultRemoteEligibility(cmd.RemoteEligibility),
		EmploymentType:    defaultEmploymentType(cmd.EmploymentType),
		Seniority:         defaultSeniority(cmd.Seniority),
		Compensation:      cmd.Compensation,
		Stack:             cmd.Stack,
		CompanyType:       defaultCompanyType(cmd.CompanyType),
		FreshnessStatus:   defaultFreshnessStatus(cmd.FreshnessStatus),
		DecisionStatus:    domain.RoleDecisionNew,
		RejectionReason:   domain.RoleRejectionNone,
		Metadata:          nonNilJSON(cmd.Metadata, `{}`),
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	return uc.roles.Save(ctx, role)
}

func validateRequiredRoleFields(company string, title string) error {
	if strings.TrimSpace(company) == "" {
		return domain.ErrCompanyRequired
	}
	if strings.TrimSpace(title) == "" {
		return domain.ErrRoleTitleRequired
	}
	return nil
}

func defaultEmploymentType(value domain.EmploymentType) domain.EmploymentType {
	if value == "" {
		return domain.EmploymentFullTime
	}
	return value
}

func defaultCompanyType(value domain.RoleCompanyType) domain.RoleCompanyType {
	if value == "" {
		return domain.RoleCompanyUnknown
	}
	return value
}

func defaultSeniority(value domain.RoleSeniority) domain.RoleSeniority {
	if value == "" {
		return domain.RoleSeniorityUnknown
	}
	return value
}

func defaultSourceKind(value domain.RoleSourceKind) domain.RoleSourceKind {
	if value == "" {
		return domain.RoleSourceOther
	}
	return value
}

func defaultRemoteEligibility(value domain.RoleRemoteEligibility) domain.RoleRemoteEligibility {
	if value == "" {
		return domain.RoleRemoteUnknown
	}
	return value
}

func defaultFreshnessStatus(value domain.RoleFreshnessStatus) domain.RoleFreshnessStatus {
	if value == "" {
		return domain.RoleFreshnessUnknown
	}
	return value
}

func jobSourceFromRole(role *domain.RoleRecord) domain.JobSource {
	switch role.Source {
	case string(domain.SourceLinkedIn):
		return domain.SourceLinkedIn
	case string(domain.SourceReferral):
		return domain.SourceReferral
	case string(domain.SourceRecruiter):
		return domain.SourceRecruiter
	case string(domain.SourceCompanySite):
		return domain.SourceCompanySite
	default:
		return domain.SourceOther
	}
}
