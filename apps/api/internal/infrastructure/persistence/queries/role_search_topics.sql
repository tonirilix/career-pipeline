-- name: InsertRoleSearchTopic :one
INSERT INTO role_search_topics (
    id, name, target_titles, preferred_stack, location, remote_preference,
    employment_type, company_type, compensation, seniority, notes, created_at, updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10, $11, $12, $13
)
RETURNING *;

-- name: GetRoleSearchTopic :one
SELECT * FROM role_search_topics
WHERE id = $1;

-- name: ListRoleSearchTopics :many
SELECT * FROM role_search_topics
ORDER BY updated_at DESC, created_at DESC;

-- name: UpdateRoleSearchTopic :one
UPDATE role_search_topics
SET name = $2,
    target_titles = $3,
    preferred_stack = $4,
    location = $5,
    remote_preference = $6,
    employment_type = $7,
    company_type = $8,
    compensation = $9,
    seniority = $10,
    notes = $11,
    updated_at = $12
WHERE id = $1
RETURNING *;
