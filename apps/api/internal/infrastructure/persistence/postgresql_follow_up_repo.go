package persistence

import (
	"context"
	"database/sql"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLFollowUpRepository struct {
	q *db.Queries
}

func NewPostgreSQLFollowUpRepository(database *sql.DB) *PostgreSQLFollowUpRepository {
	return &PostgreSQLFollowUpRepository{q: db.New(database)}
}

func newPostgreSQLFollowUpRepositoryWithExecutor(dbtx db.DBTX) *PostgreSQLFollowUpRepository {
	return &PostgreSQLFollowUpRepository{q: db.New(dbtx)}
}

var _ ports.FollowUpRepository = (*PostgreSQLFollowUpRepository)(nil)

func (r *PostgreSQLFollowUpRepository) Save(ctx context.Context, fu *domain.FollowUpReminder) error {
	return r.q.InsertFollowUp(ctx, db.InsertFollowUpParams{
		ID:            fu.ID,
		ApplicationID: fu.ApplicationID,
		DueAt:         fu.DueAt.UTC(),
		Note:          fu.Note,
		CompletedAt:   nil,
		CreatedAt:     time.Now().UTC(),
	})
}

func (r *PostgreSQLFollowUpRepository) FindByID(ctx context.Context, id string) (*domain.FollowUpReminder, error) {
	row, err := r.q.GetFollowUpByID(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrFollowUpNotFound
	}
	if err != nil {
		return nil, err
	}
	return &domain.FollowUpReminder{
		ID:            row.ID,
		ApplicationID: row.ApplicationID,
		DueAt:         row.DueAt,
		Note:          row.Note,
		CompletedAt:   row.CompletedAt,
	}, nil
}

func (r *PostgreSQLFollowUpRepository) UpdateCompleted(ctx context.Context, id string, completedAt time.Time) error {
	t := completedAt.UTC()
	return r.q.UpdateFollowUpCompleted(ctx, db.UpdateFollowUpCompletedParams{
		CompletedAt: &t,
		ID:          id,
	})
}

func (r *PostgreSQLFollowUpRepository) ListByApplication(ctx context.Context, applicationID string) ([]*domain.FollowUpReminder, error) {
	rows, err := r.q.ListFollowUpsByApplication(ctx, applicationID)
	if err != nil {
		return nil, err
	}
	return followUpRowsToDomain(rows), nil
}

func (r *PostgreSQLFollowUpRepository) ListUpcoming(ctx context.Context, now time.Time) ([]*domain.FollowUpReminder, error) {
	rows, err := r.q.ListUpcomingFollowUps(ctx, now.UTC())
	if err != nil {
		return nil, err
	}
	out := make([]*domain.FollowUpReminder, len(rows))
	for i, row := range rows {
		out[i] = &domain.FollowUpReminder{
			ID:            row.ID,
			ApplicationID: row.ApplicationID,
			DueAt:         row.DueAt,
			Note:          row.Note,
			CompletedAt:   row.CompletedAt,
		}
	}
	return out, nil
}

func (r *PostgreSQLFollowUpRepository) ListOverdue(ctx context.Context, now time.Time) ([]*domain.FollowUpReminder, error) {
	rows, err := r.q.ListOverdueFollowUps(ctx, now.UTC())
	if err != nil {
		return nil, err
	}
	out := make([]*domain.FollowUpReminder, len(rows))
	for i, row := range rows {
		out[i] = &domain.FollowUpReminder{
			ID:            row.ID,
			ApplicationID: row.ApplicationID,
			DueAt:         row.DueAt,
			Note:          row.Note,
			CompletedAt:   row.CompletedAt,
		}
	}
	return out, nil
}

func (r *PostgreSQLFollowUpRepository) DeactivateByApplication(ctx context.Context, applicationID string, completedAt time.Time) error {
	t := completedAt.UTC()
	return r.q.DeactivateFollowUpsByApplication(ctx, db.DeactivateFollowUpsByApplicationParams{
		CompletedAt:   &t,
		ApplicationID: applicationID,
	})
}

func followUpRowsToDomain(rows []db.ListFollowUpsByApplicationRow) []*domain.FollowUpReminder {
	out := make([]*domain.FollowUpReminder, len(rows))
	for i, row := range rows {
		out[i] = &domain.FollowUpReminder{
			ID:            row.ID,
			ApplicationID: row.ApplicationID,
			DueAt:         row.DueAt,
			Note:          row.Note,
			CompletedAt:   row.CompletedAt,
		}
	}
	return out
}
