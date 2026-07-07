package usecases_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func TestRoleSearchTopics_CreateListUpdate(t *testing.T) {
	topics := newFakeRoleSearchTopicRepo()
	uc := usecases.NewRoleSearchTopics(topics, &fakeClock{t: fixedTime}, &fakeIDs{})

	created, err := uc.Create(context.Background(), usecases.UpsertRoleSearchTopicCommand{
		Name:           "Backend roles",
		TargetTitles:   "Senior Backend Engineer",
		PreferredStack: "Go",
		EmploymentType: domain.EmploymentFullTime,
		CompanyType:    domain.RoleCompanyProduct,
		Seniority:      domain.RoleSenioritySenior,
	})
	if err != nil {
		t.Fatalf("unexpected create error: %v", err)
	}

	got, err := uc.List(context.Background())
	if err != nil {
		t.Fatalf("unexpected list error: %v", err)
	}
	if len(got) != 1 || got[0].Name != "Backend roles" {
		t.Fatalf("expected created topic in list, got %#v", got)
	}

	updated, err := uc.Update(context.Background(), usecases.UpsertRoleSearchTopicCommand{
		ID:             created.ID,
		Name:           "Product roles",
		TargetTitles:   "Senior Full-stack Engineer",
		PreferredStack: "Go, React",
		EmploymentType: domain.EmploymentFullTime,
		CompanyType:    domain.RoleCompanyProduct,
		Seniority:      domain.RoleSenioritySenior,
	})
	if err != nil {
		t.Fatalf("unexpected update error: %v", err)
	}
	if updated.Name != "Product roles" || updated.CreatedAt.IsZero() {
		t.Fatalf("expected updated topic preserving timestamps, got %#v", updated)
	}
}

func TestRoleRecords_RunSearchImportsAndSkipsDuplicateURLs(t *testing.T) {
	topics := newFakeRoleSearchTopicRepo()
	roles := newFakeRoleRecordRepo()
	provider := &fakeRoleSearchProvider{
		results: []domain.RoleSearchProviderResult{
			{
				Company:         "Acme",
				Title:           "Engineer",
				PostingURL:      "https://jobs.example/acme",
				ProviderSource:  "fake search",
				RawSourceText:   "source text",
				EmploymentType:  domain.EmploymentFullTime,
				FreshnessStatus: domain.RoleFreshnessUnknown,
			},
			{
				Company:         "Dupe",
				Title:           "Engineer",
				PostingURL:      "https://jobs.example/dupe",
				EmploymentType:  domain.EmploymentFullTime,
				FreshnessStatus: domain.RoleFreshnessUnknown,
			},
		},
	}
	topic := &domain.RoleSearchTopic{
		ID:             "topic-1",
		Name:           "Search",
		EmploymentType: domain.EmploymentFullTime,
		CompanyType:    domain.RoleCompanyProduct,
		Seniority:      domain.RoleSenioritySenior,
		CreatedAt:      fixedTime,
		UpdatedAt:      fixedTime,
	}
	_, _ = topics.Save(context.Background(), topic)
	_, _ = roles.Save(context.Background(), &domain.RoleRecord{
		ID:              "existing",
		Company:         "Existing",
		Title:           "Engineer",
		PostingURL:      "https://jobs.example/dupe",
		SourceKind:      domain.RoleSourceSearchResult,
		EmploymentType:  domain.EmploymentFullTime,
		FreshnessStatus: domain.RoleFreshnessUnknown,
		DecisionStatus:  domain.RoleDecisionNew,
		Metadata:        []byte(`{}`),
		CreatedAt:       fixedTime,
		UpdatedAt:       fixedTime,
	})
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	createApp := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)
	uc := usecases.NewRoleRecords(roles, topics, provider, createApp, clock, ids)

	result, err := uc.RunSearch(context.Background(), "topic-1", 10)
	if err != nil {
		t.Fatalf("unexpected search error: %v", err)
	}
	if len(provider.requests) != 1 || provider.requests[0].Topic.ID != "topic-1" {
		t.Fatalf("expected provider called with topic, got %#v", provider.requests)
	}
	if result.ImportedCount != 1 || result.SkippedCount != 1 {
		t.Fatalf("expected 1 imported and 1 skipped, got %#v", result)
	}
	imported, err := roles.FindActiveByPostingURL(context.Background(), "https://jobs.example/acme")
	if err != nil {
		t.Fatalf("expected imported role: %v", err)
	}
	if imported.SearchTopicID == nil || *imported.SearchTopicID != "topic-1" {
		t.Fatalf("expected imported role to reference topic, got %#v", imported.SearchTopicID)
	}
	if imported.RawSourceText != "source text" {
		t.Fatalf("expected raw source preserved, got %q", imported.RawSourceText)
	}
}

func TestRoleRecords_IntakeDecisionFreshnessAndPromotion(t *testing.T) {
	topics := newFakeRoleSearchTopicRepo()
	roles := newFakeRoleRecordRepo()
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	createApp := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)
	uc := usecases.NewRoleRecords(roles, topics, &fakeRoleSearchProvider{}, createApp, clock, ids)
	ctx := context.Background()

	role, err := uc.CreateFromPaste(ctx, usecases.RoleRecordCommand{
		Company:           "Acme",
		Title:             "Senior Engineer",
		PostingURL:        "https://jobs.example/acme",
		Source:            string(domain.SourceOther),
		RawSourceText:     "Full job description",
		EmploymentType:    domain.EmploymentFullTime,
		RemoteEligibility: domain.RoleRemoteRemote,
		FreshnessStatus:   domain.RoleFreshnessUnknown,
	})
	if err != nil {
		t.Fatalf("unexpected paste intake error: %v", err)
	}
	if role.Description != "Full job description" || role.RawSourceText != "Full job description" {
		t.Fatalf("expected paste intake to preserve raw text, got %#v", role)
	}

	_, err = uc.CreateFromURL(ctx, usecases.RoleRecordCommand{
		Company:        "Acme",
		Title:          "Senior Engineer",
		PostingURL:     "https://jobs.example/acme",
		Source:         string(domain.SourceOther),
		EmploymentType: domain.EmploymentFullTime,
	})
	if !errors.Is(err, domain.ErrDuplicateActiveRoleURL) {
		t.Fatalf("expected duplicate URL error, got %v", err)
	}

	rejected, err := uc.UpdateDecision(ctx, usecases.UpdateRoleDecisionCommand{
		ID:              role.ID,
		Status:          domain.RoleDecisionRejected,
		RejectionReason: domain.RoleRejectionWrongLocation,
	})
	if err != nil {
		t.Fatalf("unexpected decision error: %v", err)
	}
	if rejected.DecisionStatus != domain.RoleDecisionRejected || rejected.RejectionReason != domain.RoleRejectionWrongLocation {
		t.Fatalf("expected rejected role with reason, got %#v", rejected)
	}

	checkedAt := fixedTime.Add(time.Hour)
	fresh, err := uc.UpdateFreshness(ctx, usecases.UpdateRoleFreshnessCommand{
		ID:        role.ID,
		Status:    domain.RoleFreshnessLive,
		CheckedAt: &checkedAt,
	})
	if err != nil {
		t.Fatalf("unexpected freshness error: %v", err)
	}
	if fresh.FreshnessStatus != domain.RoleFreshnessLive || fresh.FreshnessCheckedAt == nil {
		t.Fatalf("expected live freshness with timestamp, got %#v", fresh)
	}

	result, err := uc.Promote(ctx, role.ID)
	if err != nil {
		t.Fatalf("unexpected promotion error: %v", err)
	}
	if result.Role.DecisionStatus != domain.RoleDecisionPromoted || result.Role.PromotedApplicationID == nil {
		t.Fatalf("expected promoted role linked to application, got %#v", result.Role)
	}
	if result.Application.Company != "Acme" || result.Application.RoleTitle != "Senior Engineer" {
		t.Fatalf("expected created application from role fields, got %#v", result.Application)
	}
	_, err = uc.Promote(ctx, role.ID)
	if !errors.Is(err, domain.ErrRoleAlreadyPromoted) {
		t.Fatalf("expected already promoted error, got %v", err)
	}
}

func TestRoleRecords_SearchTopicMissingDoesNotCallProvider(t *testing.T) {
	topics := newFakeRoleSearchTopicRepo()
	roles := newFakeRoleRecordRepo()
	provider := &fakeRoleSearchProvider{}
	apps, followUps, timeline, interviews, notes, clock, ids := newDeps()
	createApp := usecases.NewCreateApplication(newTx(apps, followUps, timeline, interviews, notes), clock, ids)
	uc := usecases.NewRoleRecords(roles, topics, provider, createApp, clock, ids)

	_, err := uc.RunSearch(context.Background(), "missing", 3)
	if !errors.Is(err, domain.ErrRoleSearchTopicNotFound) {
		t.Fatalf("expected topic not found, got %v", err)
	}
	if len(provider.requests) != 0 {
		t.Fatalf("expected provider not called, got %#v", provider.requests)
	}
}

type fakeRoleSearchProvider struct {
	results  []domain.RoleSearchProviderResult
	requests []domain.RoleSearchRequest
	err      error
}

func (p *fakeRoleSearchProvider) Search(_ context.Context, request domain.RoleSearchRequest) ([]domain.RoleSearchProviderResult, error) {
	p.requests = append(p.requests, request)
	if p.err != nil {
		return nil, p.err
	}
	return p.results, nil
}

type fakeRoleSearchTopicRepo struct {
	topics map[string]*domain.RoleSearchTopic
}

func newFakeRoleSearchTopicRepo() *fakeRoleSearchTopicRepo {
	return &fakeRoleSearchTopicRepo{topics: map[string]*domain.RoleSearchTopic{}}
}

func (r *fakeRoleSearchTopicRepo) Save(_ context.Context, topic *domain.RoleSearchTopic) (*domain.RoleSearchTopic, error) {
	copied := *topic
	r.topics[topic.ID] = &copied
	return &copied, nil
}

func (r *fakeRoleSearchTopicRepo) FindByID(_ context.Context, id string) (*domain.RoleSearchTopic, error) {
	topic, ok := r.topics[id]
	if !ok {
		return nil, domain.ErrRoleSearchTopicNotFound
	}
	copied := *topic
	return &copied, nil
}

func (r *fakeRoleSearchTopicRepo) List(_ context.Context) ([]*domain.RoleSearchTopic, error) {
	out := make([]*domain.RoleSearchTopic, 0, len(r.topics))
	for _, topic := range r.topics {
		copied := *topic
		out = append(out, &copied)
	}
	return out, nil
}

func (r *fakeRoleSearchTopicRepo) Update(_ context.Context, topic *domain.RoleSearchTopic) (*domain.RoleSearchTopic, error) {
	if _, ok := r.topics[topic.ID]; !ok {
		return nil, domain.ErrRoleSearchTopicNotFound
	}
	copied := *topic
	r.topics[topic.ID] = &copied
	return &copied, nil
}

type fakeRoleRecordRepo struct {
	roles map[string]*domain.RoleRecord
}

func newFakeRoleRecordRepo() *fakeRoleRecordRepo {
	return &fakeRoleRecordRepo{roles: map[string]*domain.RoleRecord{}}
}

func (r *fakeRoleRecordRepo) Save(_ context.Context, role *domain.RoleRecord) (*domain.RoleRecord, error) {
	if strings.TrimSpace(role.PostingURL) != "" {
		if _, err := r.FindActiveByPostingURL(context.Background(), role.PostingURL); err == nil {
			return nil, domain.ErrDuplicateActiveRoleURL
		}
	}
	copied := *role
	r.roles[role.ID] = &copied
	return copyRole(&copied), nil
}

func (r *fakeRoleRecordRepo) FindByID(_ context.Context, id string) (*domain.RoleRecord, error) {
	role, ok := r.roles[id]
	if !ok {
		return nil, domain.ErrRoleRecordNotFound
	}
	return copyRole(role), nil
}

func (r *fakeRoleRecordRepo) List(_ context.Context, filter ports.ListRoleRecordsFilter) ([]*domain.RoleRecord, error) {
	out := make([]*domain.RoleRecord, 0, len(r.roles))
	for _, role := range r.roles {
		if filter.DecisionStatus != nil && role.DecisionStatus != *filter.DecisionStatus {
			continue
		}
		if filter.FreshnessStatus != nil && role.FreshnessStatus != *filter.FreshnessStatus {
			continue
		}
		if filter.SourceKind != nil && role.SourceKind != *filter.SourceKind {
			continue
		}
		if filter.SearchTerm != "" && !strings.Contains(strings.ToLower(role.Company+" "+role.Title), strings.ToLower(filter.SearchTerm)) {
			continue
		}
		out = append(out, copyRole(role))
	}
	return out, nil
}

func (r *fakeRoleRecordRepo) Update(_ context.Context, role *domain.RoleRecord) (*domain.RoleRecord, error) {
	if _, ok := r.roles[role.ID]; !ok {
		return nil, domain.ErrRoleRecordNotFound
	}
	copied := *role
	r.roles[role.ID] = &copied
	return copyRole(&copied), nil
}

func (r *fakeRoleRecordRepo) FindActiveByPostingURL(_ context.Context, postingURL string) (*domain.RoleRecord, error) {
	for _, role := range r.roles {
		if role.PostingURL == postingURL && role.DecisionStatus != domain.RoleDecisionRejected {
			return copyRole(role), nil
		}
	}
	return nil, domain.ErrRoleRecordNotFound
}

func (r *fakeRoleRecordRepo) UpdateDecision(_ context.Context, id string, status domain.RoleDecisionStatus, reason domain.RoleRejectionReason, updatedAt time.Time) (*domain.RoleRecord, error) {
	role, ok := r.roles[id]
	if !ok {
		return nil, domain.ErrRoleRecordNotFound
	}
	role.DecisionStatus = status
	role.RejectionReason = reason
	role.UpdatedAt = updatedAt
	return copyRole(role), nil
}

func (r *fakeRoleRecordRepo) UpdateFreshness(_ context.Context, id string, status domain.RoleFreshnessStatus, checkedAt *time.Time, updatedAt time.Time) (*domain.RoleRecord, error) {
	role, ok := r.roles[id]
	if !ok {
		return nil, domain.ErrRoleRecordNotFound
	}
	role.FreshnessStatus = status
	role.FreshnessCheckedAt = checkedAt
	role.UpdatedAt = updatedAt
	return copyRole(role), nil
}

func (r *fakeRoleRecordRepo) LinkPromotedApplication(_ context.Context, id string, applicationID string, updatedAt time.Time) (*domain.RoleRecord, error) {
	role, ok := r.roles[id]
	if !ok {
		return nil, domain.ErrRoleRecordNotFound
	}
	role.DecisionStatus = domain.RoleDecisionPromoted
	role.PromotedApplicationID = &applicationID
	role.UpdatedAt = updatedAt
	return copyRole(role), nil
}

func copyRole(role *domain.RoleRecord) *domain.RoleRecord {
	copied := *role
	if role.SearchTopicID != nil {
		value := *role.SearchTopicID
		copied.SearchTopicID = &value
	}
	if role.FreshnessCheckedAt != nil {
		value := *role.FreshnessCheckedAt
		copied.FreshnessCheckedAt = &value
	}
	if role.PromotedApplicationID != nil {
		value := *role.PromotedApplicationID
		copied.PromotedApplicationID = &value
	}
	return &copied
}
