package persistence

import (
	"context"
	"database/sql"
	"strconv"
	"strings"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLJobApplicationRepository struct {
	q    *db.Queries
	dbtx db.DBTX // kept for dynamic List query which cannot be statically generated
}

func NewPostgreSQLJobApplicationRepository(database *sql.DB) *PostgreSQLJobApplicationRepository {
	return &PostgreSQLJobApplicationRepository{q: db.New(database), dbtx: database}
}

func newPostgreSQLJobApplicationRepositoryWithExecutor(dbtx db.DBTX) *PostgreSQLJobApplicationRepository {
	return &PostgreSQLJobApplicationRepository{q: db.New(dbtx), dbtx: dbtx}
}

var _ ports.JobApplicationRepository = (*PostgreSQLJobApplicationRepository)(nil)

func (r *PostgreSQLJobApplicationRepository) Save(ctx context.Context, app *domain.JobApplication) error {
	return r.q.InsertJobApplication(ctx, db.InsertJobApplicationParams{
		ID:             app.ID,
		Company:        app.Company,
		RoleTitle:      app.RoleTitle,
		PostingUrl:     app.PostingURL,
		Source:         string(app.Source),
		Location:       app.Location,
		Compensation:   app.Compensation,
		EmploymentType: string(app.EmploymentType),
		Stage:          string(app.Stage),
		CreatedAt:      app.CreatedAt.UTC(),
	})
}

func (r *PostgreSQLJobApplicationRepository) FindByID(ctx context.Context, id string) (*domain.JobApplication, error) {
	row, err := r.q.GetJobApplicationByID(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrApplicationNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbJobApplicationToDomain(row), nil
}

func (r *PostgreSQLJobApplicationRepository) List(ctx context.Context, filter ports.ListApplicationsFilter) ([]*domain.JobApplication, error) {
	query := `SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at FROM job_applications WHERE 1=1`
	args := []any{}
	nextArg := func() string {
		args = append(args, nil)
		return "$" + strconv.Itoa(len(args))
	}

	if filter.Stage != nil {
		placeholder := nextArg()
		args[len(args)-1] = string(*filter.Stage)
		query += " AND stage = " + placeholder
	}
	if filter.Source != nil {
		placeholder := nextArg()
		args[len(args)-1] = string(*filter.Source)
		query += " AND source = " + placeholder
	}
	if filter.SearchTerm != "" {
		companyPlaceholder := nextArg()
		args[len(args)-1] = "%" + strings.ToLower(filter.SearchTerm) + "%"
		rolePlaceholder := nextArg()
		args[len(args)-1] = "%" + strings.ToLower(filter.SearchTerm) + "%"
		query += " AND (LOWER(company) LIKE " + companyPlaceholder + " OR LOWER(role_title) LIKE " + rolePlaceholder + ")"
	}

	switch filter.SortBy {
	case "lastActivity":
		query += ` ORDER BY (SELECT MAX(occurred_at) FROM timeline_events WHERE application_id = job_applications.id) DESC`
	case "followUpDate":
		query += ` ORDER BY (SELECT MIN(due_at) FROM follow_up_reminders WHERE application_id = job_applications.id AND completed_at IS NULL) ASC`
	default:
		query += " ORDER BY created_at ASC"
	}

	rows, err := r.dbtx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apps []*domain.JobApplication
	for rows.Next() {
		var a db.JobApplication
		if err := rows.Scan(
			&a.ID, &a.Company, &a.RoleTitle, &a.PostingUrl,
			&a.Source, &a.Location, &a.Compensation, &a.EmploymentType,
			&a.Stage, &a.CreatedAt,
		); err != nil {
			return nil, err
		}
		apps = append(apps, dbJobApplicationToDomain(a))
	}
	return apps, rows.Err()
}

func (r *PostgreSQLJobApplicationRepository) UpdateStage(ctx context.Context, id string, stage domain.ApplicationStage) error {
	return r.q.UpdateJobApplicationStage(ctx, db.UpdateJobApplicationStageParams{
		Stage: string(stage),
		ID:    id,
	})
}

func dbJobApplicationToDomain(a db.JobApplication) *domain.JobApplication {
	return &domain.JobApplication{
		ID:             a.ID,
		Company:        a.Company,
		RoleTitle:      a.RoleTitle,
		PostingURL:     a.PostingUrl,
		Source:         domain.JobSource(a.Source),
		Location:       a.Location,
		Compensation:   a.Compensation,
		EmploymentType: domain.EmploymentType(a.EmploymentType),
		Stage:          domain.ApplicationStage(a.Stage),
		CreatedAt:      a.CreatedAt,
	}
}
