package persistence

import (
	"database/sql"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type SQLiteFollowUpRepository struct {
	db *sql.DB
}

func NewSQLiteFollowUpRepository(db *sql.DB) *SQLiteFollowUpRepository {
	return &SQLiteFollowUpRepository{db: db}
}

func (r *SQLiteFollowUpRepository) Save(fu *domain.FollowUpReminder) error {
	_, err := r.db.Exec(
		`INSERT INTO follow_up_reminders (id, application_id, due_at, note, completed_at, created_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		fu.ID, fu.ApplicationID,
		fu.DueAt.UTC().Format(time.RFC3339),
		fu.Note, nil,
		time.Now().UTC().Format(time.RFC3339),
	)
	return err
}

func (r *SQLiteFollowUpRepository) FindByID(id string) (*domain.FollowUpReminder, error) {
	row := r.db.QueryRow(
		`SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE id = ?`, id,
	)
	return scanFollowUp(row)
}

func (r *SQLiteFollowUpRepository) UpdateCompleted(id string, completedAt time.Time) error {
	_, err := r.db.Exec(
		`UPDATE follow_up_reminders SET completed_at = ? WHERE id = ?`,
		completedAt.UTC().Format(time.RFC3339), id,
	)
	return err
}

func (r *SQLiteFollowUpRepository) ListByApplication(applicationID string) ([]*domain.FollowUpReminder, error) {
	rows, err := r.db.Query(
		`SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE application_id = ? ORDER BY due_at ASC`,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFollowUpRows(rows)
}

func (r *SQLiteFollowUpRepository) ListUpcoming(now time.Time) ([]*domain.FollowUpReminder, error) {
	rows, err := r.db.Query(
		`SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE completed_at IS NULL AND due_at > ? ORDER BY due_at ASC`,
		now.UTC().Format(time.RFC3339),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFollowUpRows(rows)
}

func (r *SQLiteFollowUpRepository) ListOverdue(now time.Time) ([]*domain.FollowUpReminder, error) {
	rows, err := r.db.Query(
		`SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE completed_at IS NULL AND due_at < ? ORDER BY due_at ASC`,
		now.UTC().Format(time.RFC3339),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFollowUpRows(rows)
}

func (r *SQLiteFollowUpRepository) DeactivateByApplication(applicationID string, completedAt time.Time) error {
	_, err := r.db.Exec(
		`UPDATE follow_up_reminders SET completed_at = ? WHERE application_id = ? AND completed_at IS NULL`,
		completedAt.UTC().Format(time.RFC3339), applicationID,
	)
	return err
}

func scanFollowUp(row *sql.Row) (*domain.FollowUpReminder, error) {
	var fu domain.FollowUpReminder
	var dueAtStr string
	var completedAtStr *string
	err := row.Scan(&fu.ID, &fu.ApplicationID, &dueAtStr, &fu.Note, &completedAtStr)
	if err == sql.ErrNoRows {
		return nil, domain.ErrFollowUpNotFound
	}
	if err != nil {
		return nil, err
	}
	fu.DueAt, _ = parseStoredTime(dueAtStr)
	if completedAtStr != nil {
		t, _ := parseStoredTime(*completedAtStr)
		fu.CompletedAt = &t
	}
	return &fu, nil
}

func scanFollowUpRows(rows *sql.Rows) ([]*domain.FollowUpReminder, error) {
	var out []*domain.FollowUpReminder
	for rows.Next() {
		var fu domain.FollowUpReminder
		var dueAtStr string
		var completedAtStr *string
		if err := rows.Scan(&fu.ID, &fu.ApplicationID, &dueAtStr, &fu.Note, &completedAtStr); err != nil {
			return nil, err
		}
		fu.DueAt, _ = parseStoredTime(dueAtStr)
		if completedAtStr != nil {
			t, _ := parseStoredTime(*completedAtStr)
			fu.CompletedAt = &t
		}
		out = append(out, &fu)
	}
	return out, rows.Err()
}
