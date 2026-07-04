package persistence

import (
	"context"
	"database/sql"
	"time"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence/db"
)

type PostgreSQLAIArtifactRepository struct {
	q *db.Queries
}

func NewPostgreSQLAIArtifactRepository(database *sql.DB) *PostgreSQLAIArtifactRepository {
	return &PostgreSQLAIArtifactRepository{q: db.New(database)}
}

var _ ports.AIArtifactRepository = (*PostgreSQLAIArtifactRepository)(nil)

func (r *PostgreSQLAIArtifactRepository) Save(ctx context.Context, artifact *domain.AIArtifact) (*domain.AIArtifact, error) {
	row, err := r.q.InsertAIArtifact(ctx, db.InsertAIArtifactParams{
		ID:                artifact.ID,
		ArtifactType:      string(artifact.ArtifactType),
		OwnerType:         artifact.Owner.Type,
		OwnerID:           artifact.Owner.ID,
		Title:             artifact.Title,
		SourceInputs:      jsonOrDefault(artifact.SourceInputs, `[]`),
		GeneratedContent:  artifact.GeneratedContent,
		UserEditedContent: nullableString(artifact.UserEditedContent),
		Status:            string(artifact.Status),
		Sensitive:         artifact.Sensitive,
		SupersededBy:      nullableString(artifact.SupersededBy),
		ProviderName:      nullableString(artifact.Provenance.ProviderName),
		ModelName:         nullableString(artifact.Provenance.ModelName),
		PromptID:          nullableString(artifact.Provenance.PromptID),
		UsageMetadata:     jsonOrDefault(artifact.Provenance.UsageMetadata, `{}`),
		RawProviderID:     nullableString(artifact.Provenance.RawProviderID),
		CreatedAt:         artifact.CreatedAt.UTC(),
		UpdatedAt:         artifact.UpdatedAt.UTC(),
	})
	if err != nil {
		return nil, err
	}
	return dbAIArtifactToDomain(row), nil
}

func (r *PostgreSQLAIArtifactRepository) FindByID(ctx context.Context, id string) (*domain.AIArtifact, error) {
	row, err := r.q.GetAIArtifact(ctx, id)
	if err == sql.ErrNoRows {
		return nil, domain.ErrAIArtifactNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbAIArtifactToDomain(row), nil
}

func (r *PostgreSQLAIArtifactRepository) ListByOwner(ctx context.Context, owner domain.OwnerReference) ([]*domain.AIArtifact, error) {
	rows, err := r.q.ListAIArtifactsByOwner(ctx, db.ListAIArtifactsByOwnerParams{
		OwnerType: owner.Type,
		OwnerID:   owner.ID,
	})
	if err != nil {
		return nil, err
	}
	out := make([]*domain.AIArtifact, len(rows))
	for i, row := range rows {
		out[i] = dbAIArtifactToDomain(row)
	}
	return out, nil
}

func (r *PostgreSQLAIArtifactRepository) UpdateEditedContent(ctx context.Context, id string, editedContent *string, updatedAt time.Time) (*domain.AIArtifact, error) {
	row, err := r.q.UpdateAIArtifactEditedContent(ctx, db.UpdateAIArtifactEditedContentParams{
		ID:                id,
		UserEditedContent: nullableString(editedContent),
		UpdatedAt:         updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrAIArtifactNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbAIArtifactToDomain(row), nil
}

func (r *PostgreSQLAIArtifactRepository) UpdateStatus(ctx context.Context, id string, status domain.ArtifactStatus, updatedAt time.Time) (*domain.AIArtifact, error) {
	row, err := r.q.UpdateAIArtifactStatus(ctx, db.UpdateAIArtifactStatusParams{
		ID:        id,
		Status:    string(status),
		UpdatedAt: updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrAIArtifactNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbAIArtifactToDomain(row), nil
}

func (r *PostgreSQLAIArtifactRepository) Supersede(ctx context.Context, id string, supersededBy string, updatedAt time.Time) (*domain.AIArtifact, error) {
	row, err := r.q.SupersedeAIArtifact(ctx, db.SupersedeAIArtifactParams{
		ID:           id,
		SupersededBy: sql.NullString{String: supersededBy, Valid: true},
		UpdatedAt:    updatedAt.UTC(),
	})
	if err == sql.ErrNoRows {
		return nil, domain.ErrAIArtifactNotFound
	}
	if err != nil {
		return nil, err
	}
	return dbAIArtifactToDomain(row), nil
}

func dbAIArtifactToDomain(row db.AiArtifact) *domain.AIArtifact {
	return &domain.AIArtifact{
		ID:           row.ID,
		ArtifactType: domain.ArtifactType(row.ArtifactType),
		Owner: domain.OwnerReference{
			Type: row.OwnerType,
			ID:   row.OwnerID,
		},
		Title:             row.Title,
		SourceInputs:      jsonOrDefault(row.SourceInputs, `[]`),
		GeneratedContent:  row.GeneratedContent,
		UserEditedContent: stringPtrFromNull(row.UserEditedContent),
		Status:            domain.ArtifactStatus(row.Status),
		Sensitive:         row.Sensitive,
		SupersededBy:      stringPtrFromNull(row.SupersededBy),
		Provenance: domain.ArtifactProvenance{
			ProviderName:  stringPtrFromNull(row.ProviderName),
			ModelName:     stringPtrFromNull(row.ModelName),
			PromptID:      stringPtrFromNull(row.PromptID),
			UsageMetadata: jsonOrDefault(row.UsageMetadata, `{}`),
			RawProviderID: stringPtrFromNull(row.RawProviderID),
		},
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
	}
}
