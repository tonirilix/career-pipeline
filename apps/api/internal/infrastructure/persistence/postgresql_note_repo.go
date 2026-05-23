package persistence

import (
	"database/sql"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type PostgreSQLNoteRepository struct {
	db sqlExecutor
}

func NewPostgreSQLNoteRepository(db *sql.DB) *PostgreSQLNoteRepository {
	return &PostgreSQLNoteRepository{db: db}
}

func newPostgreSQLNoteRepositoryWithExecutor(db sqlExecutor) *PostgreSQLNoteRepository {
	return &PostgreSQLNoteRepository{db: db}
}

var _ ports.NoteRepository = (*PostgreSQLNoteRepository)(nil)

func (r *PostgreSQLNoteRepository) Save(applicationID string, note *domain.ApplicationNote) error {
	_, err := r.db.Exec(
		insertApplicationNoteSQL,
		note.ID, applicationID, note.Body, note.CreatedAt.UTC(),
	)
	return err
}

func (r *PostgreSQLNoteRepository) ListByApplication(applicationID string) ([]*domain.ApplicationNote, error) {
	rows, err := r.db.Query(
		selectApplicationNotesByApplicationSQL,
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
