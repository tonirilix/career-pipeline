-- name: InsertJobApplication :exec
INSERT INTO job_applications (id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);

-- name: GetJobApplicationByID :one
SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at
FROM job_applications WHERE id = $1;

-- name: ListJobApplications :many
SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at
FROM job_applications
ORDER BY created_at ASC;

-- name: UpdateJobApplicationStage :exec
UPDATE job_applications SET stage = $1 WHERE id = $2;
