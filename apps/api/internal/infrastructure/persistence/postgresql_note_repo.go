package persistence

import (
	"context"
	"database/sql"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLNoteRepository struct {
	q *db.Queries
}

func NewPostgreSQLNoteRepository(database *sql.DB) *PostgreSQLNoteRepository {
	return &PostgreSQLNoteRepository{q: db.New(database)}
}

func newPostgreSQLNoteRepositoryWithExecutor(dbtx db.DBTX) *PostgreSQLNoteRepository {
	return &PostgreSQLNoteRepository{q: db.New(dbtx)}
}

var _ ports.NoteRepository = (*PostgreSQLNoteRepository)(nil)

func (r *PostgreSQLNoteRepository) Save(ctx context.Context, applicationID string, note *domain.ApplicationNote) error {
	return r.q.InsertApplicationNote(ctx, db.InsertApplicationNoteParams{
		ID:            note.ID,
		ApplicationID: applicationID,
		Body:          note.Body,
		CreatedAt:     note.CreatedAt.UTC(),
	})
}

func (r *PostgreSQLNoteRepository) ListByApplication(ctx context.Context, applicationID string) ([]*domain.ApplicationNote, error) {
	rows, err := r.q.ListApplicationNotesByApplication(ctx, applicationID)
	if err != nil {
		return nil, err
	}
	out := make([]*domain.ApplicationNote, len(rows))
	for i, row := range rows {
		out[i] = &domain.ApplicationNote{
			ID:        row.ID,
			Body:      row.Body,
			CreatedAt: row.CreatedAt,
		}
	}
	return out, nil
}
