-- name: InsertFollowUp :exec
INSERT INTO follow_up_reminders (id, application_id, due_at, note, completed_at, created_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetFollowUpByID :one
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE id = $1;

-- name: UpdateFollowUpCompleted :exec
UPDATE follow_up_reminders SET completed_at = $1 WHERE id = $2;

-- name: ListFollowUpsByApplication :many
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE application_id = $1 ORDER BY due_at ASC;

-- name: ListUpcomingFollowUps :many
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE completed_at IS NULL AND due_at > $1 ORDER BY due_at ASC;

-- name: ListOverdueFollowUps :many
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE completed_at IS NULL AND due_at < $1 ORDER BY due_at ASC;

-- name: DeactivateFollowUpsByApplication :exec
UPDATE follow_up_reminders SET completed_at = $1 WHERE application_id = $2 AND completed_at IS NULL;
