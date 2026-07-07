-- name: InsertRoleRecord :one
INSERT INTO role_records (
    id, search_topic_id, company, title, posting_url, source, source_kind,
    provider_source, description, raw_source_text, location, remote_eligibility,
    employment_type, seniority, compensation, stack, company_type, freshness_status,
    freshness_checked_at, decision_status, rejection_reason, promoted_application_id,
    metadata, created_at, updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7,
    $8, $9, $10, $11, $12,
    $13, $14, $15, $16, $17, $18,
    $19, $20, $21, $22,
    $23, $24, $25
)
RETURNING *;

-- name: GetRoleRecord :one
SELECT * FROM role_records
WHERE id = $1;

-- name: ListRoleRecords :many
SELECT * FROM role_records
ORDER BY updated_at DESC, created_at DESC;

-- name: UpdateRoleRecord :one
UPDATE role_records
SET company = $2,
    title = $3,
    posting_url = $4,
    source = $5,
    source_kind = $6,
    provider_source = $7,
    description = $8,
    location = $9,
    remote_eligibility = $10,
    employment_type = $11,
    seniority = $12,
    compensation = $13,
    stack = $14,
    company_type = $15,
    metadata = $16,
    updated_at = $17
WHERE id = $1
RETURNING *;

-- name: FindActiveRoleRecordByPostingURL :one
SELECT * FROM role_records
WHERE posting_url = $1
  AND posting_url <> ''
  AND decision_status <> 'Rejected'
LIMIT 1;

-- name: UpdateRoleRecordDecision :one
UPDATE role_records
SET decision_status = $2,
    rejection_reason = $3,
    updated_at = $4
WHERE id = $1
RETURNING *;

-- name: UpdateRoleRecordFreshness :one
UPDATE role_records
SET freshness_status = $2,
    freshness_checked_at = $3,
    updated_at = $4
WHERE id = $1
RETURNING *;

-- name: LinkRoleRecordPromotedApplication :one
UPDATE role_records
SET decision_status = 'Promoted',
    promoted_application_id = $2,
    updated_at = $3
WHERE id = $1
RETURNING *;
