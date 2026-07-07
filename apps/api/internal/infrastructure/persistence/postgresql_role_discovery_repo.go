package persistence

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/lib/pq"
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLRoleSearchTopicRepository struct {
	q *db.Queries
}

func NewPostgreSQLRoleSearchTopicRepository(database *sql.DB) *PostgreSQLRoleSearchTopicRepository {
	return &PostgreSQLRoleSearchTopicRepository{q: db.New(database)}
}

var _ ports.RoleSearchTopicRepository = (*PostgreSQLRoleSearchTopicRepository)(nil)

func (r *PostgreSQLRoleSearchTopicRepository) Save(ctx context.Context, topic *domain.RoleSearchTopic) (*domain.RoleSearchTopic, error) {
	row, err := r.q.InsertRoleSearchTopic(ctx, db.InsertRoleSearchTopicParams{
		ID:               topic.ID,
		Name:             topic.Name,
		TargetTitles:     topic.TargetTitles,
		PreferredStack:   topic.PreferredStack,
		Location:         topic.Location,
		RemotePreference: topic.RemotePreference,
		EmploymentType:   string(topic.EmploymentType),
		CompanyType:      string(topic.CompanyType),
		Compensation:     topic.Compensation,
		Seniority:        string(topic.Seniority),
		Notes:            topic.Notes,
		CreatedAt:        topic.CreatedAt.UTC(),
		UpdatedAt:        topic.UpdatedAt.UTC(),
	})
	if err != nil {
		return nil, err
	}
	return dbRoleSearchTopicToDomain(row), nil
}

func (r *PostgreSQLRoleSearchTopicRepository) FindByID(ctx context.Context, id string) (*domain.RoleSearchTopic, error) {
	row, err := r.q.GetRoleSearchTopic(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleSearchTopicNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleSearchTopicToDomain(row), nil
}

func (r *PostgreSQLRoleSearchTopicRepository) List(ctx context.Context) ([]*domain.RoleSearchTopic, error) {
	rows, err := r.q.ListRoleSearchTopics(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]*domain.RoleSearchTopic, len(rows))
	for i, row := range rows {
		out[i] = dbRoleSearchTopicToDomain(row)
	}
	return out, nil
}

func (r *PostgreSQLRoleSearchTopicRepository) Update(ctx context.Context, topic *domain.RoleSearchTopic) (*domain.RoleSearchTopic, error) {
	row, err := r.q.UpdateRoleSearchTopic(ctx, db.UpdateRoleSearchTopicParams{
		ID:               topic.ID,
		Name:             topic.Name,
		TargetTitles:     topic.TargetTitles,
		PreferredStack:   topic.PreferredStack,
		Location:         topic.Location,
		RemotePreference: topic.RemotePreference,
		EmploymentType:   string(topic.EmploymentType),
		CompanyType:      string(topic.CompanyType),
		Compensation:     topic.Compensation,
		Seniority:        string(topic.Seniority),
		Notes:            topic.Notes,
		UpdatedAt:        topic.UpdatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleSearchTopicNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleSearchTopicToDomain(row), nil
}

type PostgreSQLRoleRecordRepository struct {
	q *db.Queries
}

func NewPostgreSQLRoleRecordRepository(database *sql.DB) *PostgreSQLRoleRecordRepository {
	return &PostgreSQLRoleRecordRepository{q: db.New(database)}
}

var _ ports.RoleRecordRepository = (*PostgreSQLRoleRecordRepository)(nil)

func (r *PostgreSQLRoleRecordRepository) Save(ctx context.Context, role *domain.RoleRecord) (*domain.RoleRecord, error) {
	row, err := r.q.InsertRoleRecord(ctx, db.InsertRoleRecordParams{
		ID:                    role.ID,
		SearchTopicID:         nullableString(role.SearchTopicID),
		Company:               role.Company,
		Title:                 role.Title,
		PostingUrl:            role.PostingURL,
		Source:                role.Source,
		SourceKind:            string(role.SourceKind),
		ProviderSource:        role.ProviderSource,
		Description:           role.Description,
		RawSourceText:         role.RawSourceText,
		Location:              role.Location,
		RemoteEligibility:     string(role.RemoteEligibility),
		EmploymentType:        string(role.EmploymentType),
		Seniority:             string(role.Seniority),
		Compensation:          role.Compensation,
		Stack:                 role.Stack,
		CompanyType:           string(role.CompanyType),
		FreshnessStatus:       string(role.FreshnessStatus),
		FreshnessCheckedAt:    role.FreshnessCheckedAt,
		DecisionStatus:        string(role.DecisionStatus),
		RejectionReason:       string(role.RejectionReason),
		PromotedApplicationID: nullableString(role.PromotedApplicationID),
		Metadata:              jsonOrDefault(role.Metadata, `{}`),
		CreatedAt:             role.CreatedAt.UTC(),
		UpdatedAt:             role.UpdatedAt.UTC(),
	})
	if isUniqueViolation(err) {
		return nil, domain.ErrDuplicateActiveRoleURL
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func (r *PostgreSQLRoleRecordRepository) FindByID(ctx context.Context, id string) (*domain.RoleRecord, error) {
	row, err := r.q.GetRoleRecord(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func (r *PostgreSQLRoleRecordRepository) List(ctx context.Context, filter ports.ListRoleRecordsFilter) ([]*domain.RoleRecord, error) {
	rows, err := r.q.ListRoleRecords(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]*domain.RoleRecord, 0, len(rows))
	for _, row := range rows {
		role := dbRoleRecordToDomain(row)
		if !matchesRoleFilter(role, filter) {
			continue
		}
		out = append(out, role)
	}
	return out, nil
}

func (r *PostgreSQLRoleRecordRepository) Update(ctx context.Context, role *domain.RoleRecord) (*domain.RoleRecord, error) {
	row, err := r.q.UpdateRoleRecord(ctx, db.UpdateRoleRecordParams{
		ID:                role.ID,
		Company:           role.Company,
		Title:             role.Title,
		PostingUrl:        role.PostingURL,
		Source:            role.Source,
		SourceKind:        string(role.SourceKind),
		ProviderSource:    role.ProviderSource,
		Description:       role.Description,
		Location:          role.Location,
		RemoteEligibility: string(role.RemoteEligibility),
		EmploymentType:    string(role.EmploymentType),
		Seniority:         string(role.Seniority),
		Compensation:      role.Compensation,
		Stack:             role.Stack,
		CompanyType:       string(role.CompanyType),
		Metadata:          jsonOrDefault(role.Metadata, `{}`),
		UpdatedAt:         role.UpdatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleRecordNotFound
	}
	if isUniqueViolation(err) {
		return nil, domain.ErrDuplicateActiveRoleURL
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func (r *PostgreSQLRoleRecordRepository) FindActiveByPostingURL(ctx context.Context, postingURL string) (*domain.RoleRecord, error) {
	row, err := r.q.FindActiveRoleRecordByPostingURL(ctx, postingURL)
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func (r *PostgreSQLRoleRecordRepository) UpdateDecision(ctx context.Context, id string, status domain.RoleDecisionStatus, reason domain.RoleRejectionReason, updatedAt time.Time) (*domain.RoleRecord, error) {
	row, err := r.q.UpdateRoleRecordDecision(ctx, db.UpdateRoleRecordDecisionParams{
		ID:              id,
		DecisionStatus:  string(status),
		RejectionReason: string(reason),
		UpdatedAt:       updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func (r *PostgreSQLRoleRecordRepository) UpdateFreshness(ctx context.Context, id string, status domain.RoleFreshnessStatus, checkedAt *time.Time, updatedAt time.Time) (*domain.RoleRecord, error) {
	if checkedAt != nil {
		utc := checkedAt.UTC()
		checkedAt = &utc
	}
	row, err := r.q.UpdateRoleRecordFreshness(ctx, db.UpdateRoleRecordFreshnessParams{
		ID:                 id,
		FreshnessStatus:    string(status),
		FreshnessCheckedAt: checkedAt,
		UpdatedAt:          updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func (r *PostgreSQLRoleRecordRepository) LinkPromotedApplication(ctx context.Context, id string, applicationID string, updatedAt time.Time) (*domain.RoleRecord, error) {
	row, err := r.q.LinkRoleRecordPromotedApplication(ctx, db.LinkRoleRecordPromotedApplicationParams{
		ID:                    id,
		PromotedApplicationID: sql.NullString{String: applicationID, Valid: true},
		UpdatedAt:             updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrRoleRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbRoleRecordToDomain(row), nil
}

func dbRoleSearchTopicToDomain(row db.RoleSearchTopic) *domain.RoleSearchTopic {
	return &domain.RoleSearchTopic{
		ID:               row.ID,
		Name:             row.Name,
		TargetTitles:     row.TargetTitles,
		PreferredStack:   row.PreferredStack,
		Location:         row.Location,
		RemotePreference: row.RemotePreference,
		EmploymentType:   domain.EmploymentType(row.EmploymentType),
		CompanyType:      domain.RoleCompanyType(row.CompanyType),
		Compensation:     row.Compensation,
		Seniority:        domain.RoleSeniority(row.Seniority),
		Notes:            row.Notes,
		CreatedAt:        row.CreatedAt,
		UpdatedAt:        row.UpdatedAt,
	}
}

func dbRoleRecordToDomain(row db.RoleRecord) *domain.RoleRecord {
	return &domain.RoleRecord{
		ID:                    row.ID,
		SearchTopicID:         stringPtrFromNull(row.SearchTopicID),
		Company:               row.Company,
		Title:                 row.Title,
		PostingURL:            row.PostingUrl,
		Source:                row.Source,
		SourceKind:            domain.RoleSourceKind(row.SourceKind),
		ProviderSource:        row.ProviderSource,
		Description:           row.Description,
		RawSourceText:         row.RawSourceText,
		Location:              row.Location,
		RemoteEligibility:     domain.RoleRemoteEligibility(row.RemoteEligibility),
		EmploymentType:        domain.EmploymentType(row.EmploymentType),
		Seniority:             domain.RoleSeniority(row.Seniority),
		Compensation:          row.Compensation,
		Stack:                 row.Stack,
		CompanyType:           domain.RoleCompanyType(row.CompanyType),
		FreshnessStatus:       domain.RoleFreshnessStatus(row.FreshnessStatus),
		FreshnessCheckedAt:    row.FreshnessCheckedAt,
		DecisionStatus:        domain.RoleDecisionStatus(row.DecisionStatus),
		RejectionReason:       domain.RoleRejectionReason(row.RejectionReason),
		PromotedApplicationID: stringPtrFromNull(row.PromotedApplicationID),
		Metadata:              jsonOrDefault(row.Metadata, `{}`),
		CreatedAt:             row.CreatedAt,
		UpdatedAt:             row.UpdatedAt,
	}
}

func matchesRoleFilter(role *domain.RoleRecord, filter ports.ListRoleRecordsFilter) bool {
	if filter.DecisionStatus != nil && role.DecisionStatus != *filter.DecisionStatus {
		return false
	}
	if filter.FreshnessStatus != nil && role.FreshnessStatus != *filter.FreshnessStatus {
		return false
	}
	if filter.SourceKind != nil && role.SourceKind != *filter.SourceKind {
		return false
	}
	if filter.SearchTerm != "" {
		term := strings.ToLower(filter.SearchTerm)
		haystack := strings.ToLower(role.Company + " " + role.Title)
		return strings.Contains(haystack, term)
	}
	return true
}

func isUniqueViolation(err error) bool {
	var pqErr *pq.Error
	return errors.As(err, &pqErr) && pqErr.Code == "23505"
}
