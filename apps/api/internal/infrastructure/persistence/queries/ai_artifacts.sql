-- name: InsertAIArtifact :one
INSERT INTO ai_artifacts (
    id, artifact_type, owner_type, owner_id, title, source_inputs,
    generated_content, user_edited_content, status, sensitive, superseded_by,
    provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
    created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
RETURNING id, artifact_type, owner_type, owner_id, title, source_inputs,
          generated_content, user_edited_content, status, sensitive, superseded_by,
          provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
          created_at, updated_at;

-- name: GetAIArtifact :one
SELECT id, artifact_type, owner_type, owner_id, title, source_inputs,
       generated_content, user_edited_content, status, sensitive, superseded_by,
       provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
       created_at, updated_at
FROM ai_artifacts
WHERE id = $1;

-- name: ListAIArtifactsByOwner :many
SELECT id, artifact_type, owner_type, owner_id, title, source_inputs,
       generated_content, user_edited_content, status, sensitive, superseded_by,
       provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
       created_at, updated_at
FROM ai_artifacts
WHERE owner_type = $1 AND owner_id = $2
ORDER BY created_at DESC;

-- name: UpdateAIArtifactEditedContent :one
UPDATE ai_artifacts
SET user_edited_content = $2,
    updated_at = $3
WHERE id = $1
RETURNING id, artifact_type, owner_type, owner_id, title, source_inputs,
          generated_content, user_edited_content, status, sensitive, superseded_by,
          provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
          created_at, updated_at;

-- name: UpdateAIArtifactStatus :one
UPDATE ai_artifacts
SET status = $2,
    updated_at = $3
WHERE id = $1
RETURNING id, artifact_type, owner_type, owner_id, title, source_inputs,
          generated_content, user_edited_content, status, sensitive, superseded_by,
          provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
          created_at, updated_at;

-- name: SupersedeAIArtifact :one
UPDATE ai_artifacts
SET status = 'Superseded',
    superseded_by = $2,
    updated_at = $3
WHERE id = $1
RETURNING id, artifact_type, owner_type, owner_id, title, source_inputs,
          generated_content, user_edited_content, status, sensitive, superseded_by,
          provider_name, model_name, prompt_id, usage_metadata, raw_provider_id,
          created_at, updated_at;
