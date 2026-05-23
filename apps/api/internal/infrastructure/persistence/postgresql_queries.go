package persistence

const insertJobApplicationSQL = `
INSERT INTO job_applications (id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

const selectJobApplicationByIDSQL = `
SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at
FROM job_applications WHERE id = $1`

const selectJobApplicationsBaseSQL = `
SELECT id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at
FROM job_applications WHERE 1=1`

const updateJobApplicationStageSQL = `
UPDATE job_applications SET stage = $1 WHERE id = $2`

const insertInterviewSQL = `
INSERT INTO interviews (id, application_id, type, scheduled_at, notes, outcome, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)`

const selectInterviewByIDSQL = `
SELECT id, type, scheduled_at, notes, outcome FROM interviews WHERE id = $1`

const updateInterviewOutcomeSQL = `
UPDATE interviews SET outcome = $1 WHERE id = $2`

const selectInterviewsByApplicationSQL = `
SELECT id, type, scheduled_at, notes, outcome FROM interviews WHERE application_id = $1 ORDER BY scheduled_at ASC`

const insertFollowUpSQL = `
INSERT INTO follow_up_reminders (id, application_id, due_at, note, completed_at, created_at)
VALUES ($1, $2, $3, $4, $5, $6)`

const selectFollowUpByIDSQL = `
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE id = $1`

const updateFollowUpCompletedSQL = `
UPDATE follow_up_reminders SET completed_at = $1 WHERE id = $2`

const selectFollowUpsByApplicationSQL = `
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE application_id = $1 ORDER BY due_at ASC`

const selectUpcomingFollowUpsSQL = `
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE completed_at IS NULL AND due_at > $1 ORDER BY due_at ASC`

const selectOverdueFollowUpsSQL = `
SELECT id, application_id, due_at, note, completed_at FROM follow_up_reminders WHERE completed_at IS NULL AND due_at < $1 ORDER BY due_at ASC`

const deactivateFollowUpsByApplicationSQL = `
UPDATE follow_up_reminders SET completed_at = $1 WHERE application_id = $2 AND completed_at IS NULL`

const insertApplicationNoteSQL = `
INSERT INTO application_notes (id, application_id, body, created_at) VALUES ($1, $2, $3, $4)`

const selectApplicationNotesByApplicationSQL = `
SELECT id, body, created_at FROM application_notes WHERE application_id = $1 ORDER BY created_at ASC`

const insertTimelineEventSQL = `
INSERT INTO timeline_events (id, application_id, description, occurred_at) VALUES ($1, $2, $3, $4)`

const selectTimelineEventsByApplicationSQL = `
SELECT id, description, occurred_at FROM timeline_events WHERE application_id = $1 ORDER BY occurred_at ASC`
