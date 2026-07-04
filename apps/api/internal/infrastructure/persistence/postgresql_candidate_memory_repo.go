package persistence

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLCandidateMemoryRepository struct {
	q *db.Queries
}

func NewPostgreSQLCandidateMemoryRepository(database *sql.DB) *PostgreSQLCandidateMemoryRepository {
	return &PostgreSQLCandidateMemoryRepository{q: db.New(database)}
}

var _ ports.CandidateMemoryRepository = (*PostgreSQLCandidateMemoryRepository)(nil)

func (r *PostgreSQLCandidateMemoryRepository) Save(ctx context.Context, record *domain.CandidateMemoryRecord) (*domain.CandidateMemoryRecord, error) {
	row, err := r.q.InsertCandidateMemoryRecord(ctx, db.InsertCandidateMemoryRecordParams{
		ID:           record.ID,
		MemoryType:   string(record.MemoryType),
		Title:        record.Title,
		Body:         record.Body,
		Source:       record.Source,
		Approved:     record.Approved,
		Sensitive:    record.Sensitive,
		ArchivedAt:   record.ArchivedAt,
		SupersededBy: nullableString(record.SupersededBy),
		Metadata:     jsonOrDefault(record.Metadata, `{}`),
		CreatedAt:    record.CreatedAt.UTC(),
		UpdatedAt:    record.UpdatedAt.UTC(),
	})
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordToDomain(row), nil
}

func (r *PostgreSQLCandidateMemoryRepository) FindByID(ctx context.Context, id string) (*domain.CandidateMemoryRecord, error) {
	row, err := r.q.GetCandidateMemoryRecord(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrMemoryRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordToDomain(row), nil
}

func (r *PostgreSQLCandidateMemoryRepository) List(ctx context.Context) ([]*domain.CandidateMemoryRecord, error) {
	rows, err := r.q.ListCandidateMemoryRecords(ctx)
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordsToDomain(rows), nil
}

func (r *PostgreSQLCandidateMemoryRepository) ListApprovedCurrent(ctx context.Context) ([]*domain.CandidateMemoryRecord, error) {
	rows, err := r.q.ListApprovedCurrentCandidateMemoryRecords(ctx)
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordsToDomain(rows), nil
}

func (r *PostgreSQLCandidateMemoryRepository) Update(ctx context.Context, record *domain.CandidateMemoryRecord) (*domain.CandidateMemoryRecord, error) {
	row, err := r.q.UpdateCandidateMemoryRecord(ctx, db.UpdateCandidateMemoryRecordParams{
		ID:         record.ID,
		MemoryType: string(record.MemoryType),
		Title:      record.Title,
		Body:       record.Body,
		Source:     record.Source,
		Approved:   record.Approved,
		Sensitive:  record.Sensitive,
		Metadata:   jsonOrDefault(record.Metadata, `{}`),
		UpdatedAt:  record.UpdatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrMemoryRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordToDomain(row), nil
}

func (r *PostgreSQLCandidateMemoryRepository) Archive(ctx context.Context, id string, archivedAt time.Time) (*domain.CandidateMemoryRecord, error) {
	row, err := r.q.ArchiveCandidateMemoryRecord(ctx, db.ArchiveCandidateMemoryRecordParams{
		ID:         id,
		ArchivedAt: ptrTime(archivedAt.UTC()),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrMemoryRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordToDomain(row), nil
}

func (r *PostgreSQLCandidateMemoryRepository) Supersede(ctx context.Context, id string, supersededBy string, updatedAt time.Time) (*domain.CandidateMemoryRecord, error) {
	row, err := r.q.SupersedeCandidateMemoryRecord(ctx, db.SupersedeCandidateMemoryRecordParams{
		ID:           id,
		SupersededBy: sql.NullString{String: supersededBy, Valid: true},
		UpdatedAt:    updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrMemoryRecordNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbCandidateMemoryRecordToDomain(row), nil
}

func dbCandidateMemoryRecordsToDomain(rows []db.CandidateMemoryRecord) []*domain.CandidateMemoryRecord {
	out := make([]*domain.CandidateMemoryRecord, len(rows))
	for i, row := range rows {
		out[i] = dbCandidateMemoryRecordToDomain(row)
	}
	return out
}

func dbCandidateMemoryRecordToDomain(row db.CandidateMemoryRecord) *domain.CandidateMemoryRecord {
	return &domain.CandidateMemoryRecord{
		ID:           row.ID,
		MemoryType:   domain.MemoryType(row.MemoryType),
		Title:        row.Title,
		Body:         row.Body,
		Source:       row.Source,
		Approved:     row.Approved,
		Sensitive:    row.Sensitive,
		ArchivedAt:   row.ArchivedAt,
		SupersededBy: stringPtrFromNull(row.SupersededBy),
		Metadata:     jsonOrDefault(row.Metadata, `{}`),
		CreatedAt:    row.CreatedAt,
		UpdatedAt:    row.UpdatedAt,
	}
}

func jsonOrDefault(value json.RawMessage, fallback string) json.RawMessage {
	if len(value) == 0 {
		return json.RawMessage(fallback)
	}
	return value
}
