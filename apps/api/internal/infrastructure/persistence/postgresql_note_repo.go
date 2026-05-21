package persistence

import (
	"database/sql"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type PostgreSQLNoteRepository struct {
	db *sql.DB
}

func NewPostgreSQLNoteRepository(db *sql.DB) *PostgreSQLNoteRepository {
	return &PostgreSQLNoteRepository{db: db}
}

var _ ports.NoteRepository = (*PostgreSQLNoteRepository)(nil)

func (r *PostgreSQLNoteRepository) Save(applicationID string, note *domain.ApplicationNote) error {
	_, err := r.db.Exec(
		`INSERT INTO application_notes (id, application_id, body, created_at) VALUES ($1, $2, $3, $4)`,
		note.ID, applicationID, note.Body, note.CreatedAt.UTC(),
	)
	return err
}

func (r *PostgreSQLNoteRepository) ListByApplication(applicationID string) ([]*domain.ApplicationNote, error) {
	rows, err := r.db.Query(
		`SELECT id, body, created_at FROM application_notes WHERE application_id = $1 ORDER BY created_at ASC`,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*domain.ApplicationNote
	for rows.Next() {
		var n domain.ApplicationNote
		if err := rows.Scan(&n.ID, &n.Body, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, &n)
	}
	return out, rows.Err()
}
