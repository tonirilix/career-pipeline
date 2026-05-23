package persistence

import (
	"database/sql"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type PostgreSQLFollowUpRepository struct {
	db sqlExecutor
}

func NewPostgreSQLFollowUpRepository(db *sql.DB) *PostgreSQLFollowUpRepository {
	return &PostgreSQLFollowUpRepository{db: db}
}

func newPostgreSQLFollowUpRepositoryWithExecutor(db sqlExecutor) *PostgreSQLFollowUpRepository {
	return &PostgreSQLFollowUpRepository{db: db}
}

var _ ports.FollowUpRepository = (*PostgreSQLFollowUpRepository)(nil)

func (r *PostgreSQLFollowUpRepository) Save(fu *domain.FollowUpReminder) error {
	_, err := r.db.Exec(
		insertFollowUpSQL,
		fu.ID, fu.ApplicationID,
		fu.DueAt.UTC(),
		fu.Note, nil,
		time.Now().UTC(),
	)
	return err
}

func (r *PostgreSQLFollowUpRepository) FindByID(id string) (*domain.FollowUpReminder, error) {
	row := r.db.QueryRow(
		selectFollowUpByIDSQL, id,
	)
	return scanFollowUp(row)
}

func (r *PostgreSQLFollowUpRepository) UpdateCompleted(id string, completedAt time.Time) error {
	_, err := r.db.Exec(
		updateFollowUpCompletedSQL,
		completedAt.UTC(), id,
	)
	return err
}

func (r *PostgreSQLFollowUpRepository) ListByApplication(applicationID string) ([]*domain.FollowUpReminder, error) {
	rows, err := r.db.Query(
		selectFollowUpsByApplicationSQL,
		applicationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFollowUpRows(rows)
}

func (r *PostgreSQLFollowUpRepository) ListUpcoming(now time.Time) ([]*domain.FollowUpReminder, error) {
	rows, err := r.db.Query(
		selectUpcomingFollowUpsSQL,
		now.UTC(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFollowUpRows(rows)
}

func (r *PostgreSQLFollowUpRepository) ListOverdue(now time.Time) ([]*domain.FollowUpReminder, error) {
	rows, err := r.db.Query(
		selectOverdueFollowUpsSQL,
		now.UTC(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFollowUpRows(rows)
}

func (r *PostgreSQLFollowUpRepository) DeactivateByApplication(applicationID string, completedAt time.Time) error {
	_, err := r.db.Exec(
		deactivateFollowUpsByApplicationSQL,
		completedAt.UTC(), applicationID,
	)
	return err
}

func scanFollowUp(row *sql.Row) (*domain.FollowUpReminder, error) {
	var fu domain.FollowUpReminder
	var completedAt *time.Time
	err := row.Scan(&fu.ID, &fu.ApplicationID, &fu.DueAt, &fu.Note, &completedAt)
	if err == sql.ErrNoRows {
		return nil, domain.ErrFollowUpNotFound
	}
	if err != nil {
		return nil, err
	}
	fu.CompletedAt = completedAt
	return &fu, nil
}

func scanFollowUpRows(rows *sql.Rows) ([]*domain.FollowUpReminder, error) {
	var out []*domain.FollowUpReminder
	for rows.Next() {
		var fu domain.FollowUpReminder
		var completedAt *time.Time
		if err := rows.Scan(&fu.ID, &fu.ApplicationID, &fu.DueAt, &fu.Note, &completedAt); err != nil {
			return nil, err
		}
		fu.CompletedAt = completedAt
		out = append(out, &fu)
	}
	return out, rows.Err()
}
