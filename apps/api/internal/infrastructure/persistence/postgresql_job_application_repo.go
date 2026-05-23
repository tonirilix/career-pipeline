package persistence

import (
	"database/sql"
	"strconv"
	"strings"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type PostgreSQLJobApplicationRepository struct {
	db sqlExecutor
}

func NewPostgreSQLJobApplicationRepository(db *sql.DB) *PostgreSQLJobApplicationRepository {
	return &PostgreSQLJobApplicationRepository{db: db}
}

func newPostgreSQLJobApplicationRepositoryWithExecutor(db sqlExecutor) *PostgreSQLJobApplicationRepository {
	return &PostgreSQLJobApplicationRepository{db: db}
}

var _ ports.JobApplicationRepository = (*PostgreSQLJobApplicationRepository)(nil)

func (r *PostgreSQLJobApplicationRepository) Save(app *domain.JobApplication) error {
	_, err := r.db.Exec(
		insertJobApplicationSQL,
		app.ID, app.Company, app.RoleTitle, app.PostingURL, string(app.Source),
		app.Location, app.Compensation, string(app.EmploymentType), string(app.Stage),
		app.CreatedAt.UTC(),
	)
	return err
}

func (r *PostgreSQLJobApplicationRepository) FindByID(id string) (*domain.JobApplication, error) {
	row := r.db.QueryRow(
		selectJobApplicationByIDSQL, id,
	)
	return scanApplication(row)
}

func (r *PostgreSQLJobApplicationRepository) List(filter ports.ListApplicationsFilter) ([]*domain.JobApplication, error) {
	query := selectJobApplicationsBaseSQL
	args := []interface{}{}
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

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apps []*domain.JobApplication
	for rows.Next() {
		app, err := scanApplicationRow(rows)
		if err != nil {
			return nil, err
		}
		apps = append(apps, app)
	}
	return apps, rows.Err()
}

func (r *PostgreSQLJobApplicationRepository) UpdateStage(id string, stage domain.ApplicationStage) error {
	_, err := r.db.Exec(updateJobApplicationStageSQL, string(stage), id)
	return err
}

func scanApplication(row *sql.Row) (*domain.JobApplication, error) {
	var app domain.JobApplication
	err := row.Scan(
		&app.ID, &app.Company, &app.RoleTitle, &app.PostingURL,
		&app.Source, &app.Location, &app.Compensation, &app.EmploymentType,
		&app.Stage, &app.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrApplicationNotFound
	}
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func scanApplicationRow(rows *sql.Rows) (*domain.JobApplication, error) {
	var app domain.JobApplication
	err := rows.Scan(
		&app.ID, &app.Company, &app.RoleTitle, &app.PostingURL,
		&app.Source, &app.Location, &app.Compensation, &app.EmploymentType,
		&app.Stage, &app.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &app, nil
}
