package persistence

import (
	"database/sql"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type SQLiteTimelineRepository struct {
	db *sql.DB
}

func NewSQLiteTimelineRepository(db *sql.DB) *SQLiteTimelineRepository {
	return &SQLiteTimelineRepository{db: db}
}

func (r *SQLiteTimelineRepository) Save(applicationID string, event *domain.TimelineEvent) error {
	_, err := r.db.Exec(
		`INSERT INTO timeline_events (id, application_id, description, occurred_at) VALUES (?, ?, ?, ?)`,
		event.ID, applicationID, event.Description,
		event.OccurredAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
	)
	return err
}

func (r *SQLiteTimelineRepository) ListByApplication(applicationID string) ([]*domain.TimelineEvent, error) {
	rows, err := r.db.Query(
		`SELECT id, description, occurred_at FROM timeline_events WHERE application_id = ? ORDER BY occurred_at ASC`,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*domain.TimelineEvent
	for rows.Next() {
		var e domain.TimelineEvent
		var occurredAtStr string
		if err := rows.Scan(&e.ID, &e.Description, &occurredAtStr); err != nil {
			return nil, err
		}
		e.OccurredAt, _ = parseStoredTime(occurredAtStr)
		out = append(out, &e)
	}
	return out, rows.Err()
}

