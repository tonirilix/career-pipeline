package persistence

import (
	"context"
	"database/sql"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLInterviewRepository struct {
	q *db.Queries
}

func NewPostgreSQLInterviewRepository(database *sql.DB) *PostgreSQLInterviewRepository {
	return &PostgreSQLInterviewRepository{q: db.New(database)}
}

func newPostgreSQLInterviewRepositoryWithExecutor(dbtx db.DBTX) *PostgreSQLInterviewRepository {
	return &PostgreSQLInterviewRepository{q: db.New(dbtx)}
}

var _ ports.InterviewRepository = (*PostgreSQLInterviewRepository)(nil)

func (r *PostgreSQLInterviewRepository) Save(ctx context.Context, applicationID string, iv *domain.Interview) error {
	return r.q.InsertInterview(ctx, db.InsertInterviewParams{
		ID:            iv.ID,
		ApplicationID: applicationID,
		Type:          string(iv.Type),
		ScheduledAt:   iv.ScheduledAt.UTC(),
		Notes:         iv.Notes,
		Outcome:       string(iv.Outcome),
		CreatedAt:     time.Now().UTC(),
	})
}

func (r *PostgreSQLInterviewRepository) FindByID(ctx context.Context, id string) (*domain.Interview, error) {
	row, err := r.q.GetInterviewByID(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrInterviewNotFound
	}
	if err != nil {
		return nil, err
	}
	return &domain.Interview{
		ID:          row.ID,
		Type:        domain.InterviewType(row.Type),
		ScheduledAt: row.ScheduledAt,
		Notes:       row.Notes,
		Outcome:     domain.InterviewOutcome(row.Outcome),
	}, nil
}

func (r *PostgreSQLInterviewRepository) UpdateOutcome(ctx context.Context, id string, outcome domain.InterviewOutcome) error {
	return r.q.UpdateInterviewOutcome(ctx, db.UpdateInterviewOutcomeParams{
		Outcome: string(outcome),
		ID:      id,
	})
}

func (r *PostgreSQLInterviewRepository) ListByApplication(ctx context.Context, applicationID string) ([]*domain.Interview, error) {
	rows, err := r.q.ListInterviewsByApplication(ctx, applicationID)
	if err != nil {
		return nil, err
	}
	out := make([]*domain.Interview, len(rows))
	for i, row := range rows {
		out[i] = &domain.Interview{
			ID:          row.ID,
			Type:        domain.InterviewType(row.Type),
			ScheduledAt: row.ScheduledAt,
			Notes:       row.Notes,
			Outcome:     domain.InterviewOutcome(row.Outcome),
		}
	}
	return out, nil
}
