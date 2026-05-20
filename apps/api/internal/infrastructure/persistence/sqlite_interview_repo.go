package persistence

import (
	"database/sql"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type SQLiteInterviewRepository struct {
	db *sql.DB
}

func NewSQLiteInterviewRepository(db *sql.DB) *SQLiteInterviewRepository {
	return &SQLiteInterviewRepository{db: db}
}

func (r *SQLiteInterviewRepository) Save(applicationID string, iv *domain.Interview) error {
	_, err := r.db.Exec(
		`INSERT INTO interviews (id, application_id, type, scheduled_at, notes, outcome, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		iv.ID, applicationID, string(iv.Type),
		iv.ScheduledAt.UTC().Format(time.RFC3339),
		iv.Notes, string(iv.Outcome),
		time.Now().UTC().Format(time.RFC3339),
	)
	return err
}

func (r *SQLiteInterviewRepository) FindByID(id string) (*domain.Interview, error) {
	row := r.db.QueryRow(
		`SELECT id, type, scheduled_at, notes, outcome FROM interviews WHERE id = ?`, id,
	)
	return scanInterview(row)
}

func (r *SQLiteInterviewRepository) UpdateOutcome(id string, outcome domain.InterviewOutcome) error {
	_, err := r.db.Exec(`UPDATE interviews SET outcome = ? WHERE id = ?`, string(outcome), id)
	return err
}

func (r *SQLiteInterviewRepository) ListByApplication(applicationID string) ([]*domain.Interview, error) {
	rows, err := r.db.Query(
		`SELECT id, type, scheduled_at, notes, outcome FROM interviews WHERE application_id = ? ORDER BY scheduled_at ASC`,
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
	var scheduledAtStr string
	err := row.Scan(&iv.ID, &iv.Type, &scheduledAtStr, &iv.Notes, &iv.Outcome)
	if err == sql.ErrNoRows {
		return nil, domain.ErrInterviewNotFound
	}
	if err != nil {
		return nil, err
	}
	iv.ScheduledAt, _ = parseStoredTime(scheduledAtStr)
	return &iv, nil
}

func scanInterviewRow(rows *sql.Rows) (*domain.Interview, error) {
	var iv domain.Interview
	var scheduledAtStr string
	err := rows.Scan(&iv.ID, &iv.Type, &scheduledAtStr, &iv.Notes, &iv.Outcome)
	if err != nil {
		return nil, err
	}
	iv.ScheduledAt, _ = parseStoredTime(scheduledAtStr)
	return &iv, nil
}
