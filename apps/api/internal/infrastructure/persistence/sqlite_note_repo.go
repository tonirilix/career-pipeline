package persistence

import (
	"database/sql"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type SQLiteNoteRepository struct {
	db *sql.DB
}

func NewSQLiteNoteRepository(db *sql.DB) *SQLiteNoteRepository {
	return &SQLiteNoteRepository{db: db}
}

func (r *SQLiteNoteRepository) Save(applicationID string, note *domain.ApplicationNote) error {
	_, err := r.db.Exec(
		`INSERT INTO application_notes (id, application_id, body, created_at) VALUES (?, ?, ?, ?)`,
		note.ID, applicationID, note.Body, note.CreatedAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
	)
	return err
}

func (r *SQLiteNoteRepository) ListByApplication(applicationID string) ([]*domain.ApplicationNote, error) {
	rows, err := r.db.Query(
		`SELECT id, body, created_at FROM application_notes WHERE application_id = ? ORDER BY created_at ASC`,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*domain.ApplicationNote
	for rows.Next() {
		var n domain.ApplicationNote
		var createdAtStr string
		if err := rows.Scan(&n.ID, &n.Body, &createdAtStr); err != nil {
			return nil, err
		}
		n.CreatedAt, _ = parseStoredTime(createdAtStr)
		out = append(out, &n)
	}
	return out, rows.Err()
}
