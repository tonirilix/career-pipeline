package persistence

import (
	"database/sql"
	"strings"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type SQLiteJobApplicationRepository struct {
	db *sql.DB
}

func NewSQLiteJobApplicationRepository(db *sql.DB) *SQLiteJobApplicationRepository {
	return &SQLiteJobApplicationRepository{db: db}
}

func (r *SQLiteJobApplicationRepository) Save(app *domain.JobApplication) error {
	_, err := r.db.Exec(
		`INSERT INTO job_applications (id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		app.ID, app.Company, app.RoleTitle, app.PostingURL, string(app.Source),
		app.Location, app.Compensation, string(app.EmploymentType), string(app.Stage),
		app.CreatedAt.UTC().Format(time.RFC3339),
	)
	return err
}

func (r *SQLiteJobApplicationRepository) FindByID(id string) (*domain.JobApplication, error) {
	row := r.db.QueryRow(
		`SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at
		 FROM job_applications WHERE id = ?`, id,
	)
	return scanApplication(row)
}

func (r *SQLiteJobApplicationRepository) List(filter ports.ListApplicationsFilter) ([]*domain.JobApplication, error) {
	query := `SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at FROM job_applications WHERE 1=1`
	args := []interface{}{}

	if filter.Stage != nil {
		query += " AND stage = ?"
		args = append(args, string(*filter.Stage))
	}
	if filter.Source != nil {
		query += " AND source = ?"
		args = append(args, string(*filter.Source))
	}
	if filter.SearchTerm != "" {
		query += " AND (LOWER(company) LIKE ? OR LOWER(role_title) LIKE ?)"
		term := "%" + strings.ToLower(filter.SearchTerm) + "%"
		args = append(args, term, term)
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

func (r *SQLiteJobApplicationRepository) UpdateStage(id string, stage domain.ApplicationStage) error {
	_, err := r.db.Exec(`UPDATE job_applications SET stage = ? WHERE id = ?`, string(stage), id)
	return err
}

func scanApplication(row *sql.Row) (*domain.JobApplication, error) {
	var app domain.JobApplication
	var createdAtStr string
	err := row.Scan(
		&app.ID, &app.Company, &app.RoleTitle, &app.PostingURL,
		&app.Source, &app.Location, &app.Compensation, &app.EmploymentType,
		&app.Stage, &createdAtStr,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrApplicationNotFound
	}
	if err != nil {
		return nil, err
	}
	app.CreatedAt, _ = parseStoredTime(createdAtStr)
	return &app, nil
}

func scanApplicationRow(rows *sql.Rows) (*domain.JobApplication, error) {
	var app domain.JobApplication
	var createdAtStr string
	err := rows.Scan(
		&app.ID, &app.Company, &app.RoleTitle, &app.PostingURL,
		&app.Source, &app.Location, &app.Compensation, &app.EmploymentType,
		&app.Stage, &createdAtStr,
	)
	if err != nil {
		return nil, err
	}
	app.CreatedAt, _ = parseStoredTime(createdAtStr)
	return &app, nil
}
