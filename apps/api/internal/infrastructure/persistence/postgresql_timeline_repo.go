package persistence

import (
	"database/sql"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type PostgreSQLTimelineRepository struct {
	db *sql.DB
}

func NewPostgreSQLTimelineRepository(db *sql.DB) *PostgreSQLTimelineRepository {
	return &PostgreSQLTimelineRepository{db: db}
}

var _ ports.TimelineRepository = (*PostgreSQLTimelineRepository)(nil)

func (r *PostgreSQLTimelineRepository) Save(applicationID string, event *domain.TimelineEvent) error {
	_, err := r.db.Exec(
		`INSERT INTO timeline_events (id, application_id, description, occurred_at) VALUES ($1, $2, $3, $4)`,
		event.ID, applicationID, event.Description,
		event.OccurredAt.UTC(),
	)
	return err
}

func (r *PostgreSQLTimelineRepository) ListByApplication(applicationID string) ([]*domain.TimelineEvent, error) {
	rows, err := r.db.Query(
		`SELECT id, description, occurred_at FROM timeline_events WHERE application_id = $1 ORDER BY occurred_at ASC`,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*domain.TimelineEvent
	for rows.Next() {
		var e domain.TimelineEvent
		if err := rows.Scan(&e.ID, &e.Description, &e.OccurredAt); err != nil {
			return nil, err
		}
		out = append(out, &e)
	}
	return out, rows.Err()
}
