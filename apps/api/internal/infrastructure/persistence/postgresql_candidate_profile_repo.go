package persistence

import (
	"context"
	"database/sql"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLCandidateProfileRepository struct {
	q *db.Queries
}

func NewPostgreSQLCandidateProfileRepository(database *sql.DB) *PostgreSQLCandidateProfileRepository {
	return &PostgreSQLCandidateProfileRepository{q: db.New(database)}
}

var _ ports.CandidateProfileRepository = (*PostgreSQLCandidateProfileRepository)(nil)

func (r *PostgreSQLCandidateProfileRepository) GetActive(ctx context.Context) (*domain.CandidateProfile, error) {
	row, err := r.q.GetCandidateProfile(ctx, domain.ActiveCandidateProfileID)
	if err == sql.ErrNoRows {
		return nil, domain.ErrCandidateProfileNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbCandidateProfileToDomain(row), nil
}

func (r *PostgreSQLCandidateProfileRepository) Save(ctx context.Context, profile *domain.CandidateProfile) (*domain.CandidateProfile, error) {
	row, err := r.q.UpsertCandidateProfile(ctx, db.UpsertCandidateProfileParams{
		ID:                       profile.ID,
		TargetRoles:              profile.TargetRoles,
		PreferredStack:           profile.PreferredStack,
		CompensationExpectations: profile.CompensationExpectations,
		LocationPreferences:      profile.LocationPreferences,
		WorkConstraints:          profile.WorkConstraints,
		CompanyPreferences:       profile.CompanyPreferences,
		WritingTone:              profile.WritingTone,
		PositioningSummary:       profile.PositioningSummary,
		CreatedAt:                profile.CreatedAt.UTC(),
		UpdatedAt:                profile.UpdatedAt.UTC(),
	})
	if err != nil {
		return nil, err
	}
	return dbCandidateProfileToDomain(row), nil
}

func dbCandidateProfileToDomain(row db.CandidateProfile) *domain.CandidateProfile {
	return &domain.CandidateProfile{
		ID:                       row.ID,
		TargetRoles:              row.TargetRoles,
		PreferredStack:           row.PreferredStack,
		CompensationExpectations: row.CompensationExpectations,
		LocationPreferences:      row.LocationPreferences,
		WorkConstraints:          row.WorkConstraints,
		CompanyPreferences:       row.CompanyPreferences,
		WritingTone:              row.WritingTone,
		PositioningSummary:       row.PositioningSummary,
		CreatedAt:                row.CreatedAt,
		UpdatedAt:                row.UpdatedAt,
	}
}
