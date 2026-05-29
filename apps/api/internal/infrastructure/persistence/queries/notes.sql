-- name: InsertApplicationNote :exec
INSERT INTO application_notes (id, application_id, body, created_at) VALUES ($1, $2, $3, $4);

-- name: ListApplicationNotesByApplication :many
SELECT id, body, created_at FROM application_notes WHERE application_id = $1 ORDER BY created_at ASC;
