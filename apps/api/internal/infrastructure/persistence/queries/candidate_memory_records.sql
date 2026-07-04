-- name: InsertCandidateMemoryRecord :one
INSERT INTO candidate_memory_records (
    id, memory_type, title, body, source, approved, sensitive,
    archived_at, superseded_by, metadata, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING id, memory_type, title, body, source, approved, sensitive,
          archived_at, superseded_by, metadata, created_at, updated_at;

-- name: GetCandidateMemoryRecord :one
SELECT id, memory_type, title, body, source, approved, sensitive,
       archived_at, superseded_by, metadata, created_at, updated_at
FROM candidate_memory_records
WHERE id = $1;

-- name: ListCandidateMemoryRecords :many
SELECT id, memory_type, title, body, source, approved, sensitive,
       archived_at, superseded_by, metadata, created_at, updated_at
FROM candidate_memory_records
ORDER BY (archived_at IS NULL AND superseded_by IS NULL) DESC, created_at DESC;

-- name: ListApprovedCurrentCandidateMemoryRecords :many
SELECT id, memory_type, title, body, source, approved, sensitive,
       archived_at, superseded_by, metadata, created_at, updated_at
FROM candidate_memory_records
WHERE approved = TRUE AND archived_at IS NULL AND superseded_by IS NULL
ORDER BY created_at DESC;

-- name: UpdateCandidateMemoryRecord :one
UPDATE candidate_memory_records
SET memory_type = $2,
    title = $3,
    body = $4,
    source = $5,
    approved = $6,
    sensitive = $7,
    metadata = $8,
    updated_at = $9
WHERE id = $1
RETURNING id, memory_type, title, body, source, approved, sensitive,
          archived_at, superseded_by, metadata, created_at, updated_at;

-- name: ArchiveCandidateMemoryRecord :one
UPDATE candidate_memory_records
SET archived_at = $2,
    updated_at = $2
WHERE id = $1
RETURNING id, memory_type, title, body, source, approved, sensitive,
          archived_at, superseded_by, metadata, created_at, updated_at;

-- name: SupersedeCandidateMemoryRecord :one
UPDATE candidate_memory_records
SET superseded_by = $2,
    updated_at = $3
WHERE id = $1
RETURNING id, memory_type, title, body, source, approved, sensitive,
          archived_at, superseded_by, metadata, created_at, updated_at;
