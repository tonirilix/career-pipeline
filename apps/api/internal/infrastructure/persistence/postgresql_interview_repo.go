package persistence

import (
	"database/sql"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type PostgreSQLInterviewRepository struct {
	db sqlExecutor
}

func NewPostgreSQLInterviewRepository(db *sql.DB) *PostgreSQLInterviewRepository {
	return &PostgreSQLInterviewRepository{db: db}
}

func newPostgreSQLInterviewRepositoryWithExecutor(db sqlExecutor) *PostgreSQLInterviewRepository {
	return &PostgreSQLInterviewRepository{db: db}
}

var _ ports.InterviewRepository = (*PostgreSQLInterviewRepository)(nil)

func (r *PostgreSQLInterviewRepository) Save(applicationID string, iv *domain.Interview) error {
	_, err := r.db.Exec(
		insertInterviewSQL,
		iv.ID, applicationID, string(iv.Type),
		iv.ScheduledAt.UTC(),
		iv.Notes, string(iv.Outcome),
		time.Now().UTC(),
	)
	return err
}

func (r *PostgreSQLInterviewRepository) FindByID(id string) (*domain.Interview, error) {
	row := r.db.QueryRow(
		selectInterviewByIDSQL, id,
	)
	return scanInterview(row)
}

func (r *PostgreSQLInterviewRepository) UpdateOutcome(id string, outcome domain.InterviewOutcome) error {
	_, err := r.db.Exec(updateInterviewOutcomeSQL, string(outcome), id)
	return err
}

func (r *PostgreSQLInterviewRepository) ListByApplication(applicationID string) ([]*domain.Interview, error) {
	rows, err := r.db.Query(
		selectInterviewsByApplicationSQL,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*domain.Interview
	for rows.Next() {
		iv, err := scanInterviewRow(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, iv)
	}
	return out, rows.Err()
}

func scanInterview(row *sql.Row) (*domain.Interview, error) {
	var iv domain.Interview
	err := row.Scan(&iv.ID, &iv.Type, &iv.ScheduledAt, &iv.Notes, &iv.Outcome)
	if err == sql.ErrNoRows {
		return nil, domain.ErrInterviewNotFound
	}
	if err != nil {
		return nil, err
	}
	return &iv, nil
}

func scanInterviewRow(rows *sql.Rows) (*domain.Interview, error) {
	var iv domain.Interview
	err := rows.Scan(&iv.ID, &iv.Type, &iv.ScheduledAt, &iv.Notes, &iv.Outcome)
	if err != nil {
		return nil, err
	}
	return &iv, nil
}
