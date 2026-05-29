-- name: InsertTimelineEvent :exec
INSERT INTO timeline_events (id, application_id, description, occurred_at) VALUES ($1, $2, $3, $4);

-- name: ListTimelineEventsByApplication :many
SELECT id, description, occurred_at FROM timeline_events WHERE application_id = $1 ORDER BY occurred_at ASC;
