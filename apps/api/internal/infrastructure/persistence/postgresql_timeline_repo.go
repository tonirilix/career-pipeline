package persistence

import (
	"context"
	"database/sql"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLTimelineRepository struct {
	q *db.Queries
}

func NewPostgreSQLTimelineRepository(database *sql.DB) *PostgreSQLTimelineRepository {
	return &PostgreSQLTimelineRepository{q: db.New(database)}
}

func newPostgreSQLTimelineRepositoryWithExecutor(dbtx db.DBTX) *PostgreSQLTimelineRepository {
	return &PostgreSQLTimelineRepository{q: db.New(dbtx)}
}

var _ ports.TimelineRepository = (*PostgreSQLTimelineRepository)(nil)

func (r *PostgreSQLTimelineRepository) Save(applicationID string, event *domain.TimelineEvent) error {
	return r.q.InsertTimelineEvent(context.Background(), db.InsertTimelineEventParams{
		ID:            event.ID,
		ApplicationID: applicationID,
		Description:   event.Description,
		OccurredAt:    event.OccurredAt.UTC(),
	})
}

func (r *PostgreSQLTimelineRepository) ListByApplication(applicationID string) ([]*domain.TimelineEvent, error) {
	rows, err := r.q.ListTimelineEventsByApplication(context.Background(), applicationID)
	if err != nil {
		return nil, err
	}
	out := make([]*domain.TimelineEvent, len(rows))
	for i, row := range rows {
		out[i] = &domain.TimelineEvent{
			ID:          row.ID,
			Description: row.Description,
			OccurredAt:  row.OccurredAt,
		}
	}
	return out, nil
}
