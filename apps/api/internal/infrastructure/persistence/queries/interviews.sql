-- name: InsertInterview :exec
INSERT INTO interviews (id, application_id, type, scheduled_at, notes, outcome, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetInterviewByID :one
SELECT id, type, scheduled_at, notes, outcome FROM interviews WHERE id = $1;

-- name: UpdateInterviewOutcome :exec
UPDATE interviews SET outcome = $1 WHERE id = $2;

-- name: ListInterviewsByApplication :many
SELECT id, type, scheduled_at, notes, outcome FROM interviews WHERE application_id = $1 ORDER BY scheduled_at ASC;
