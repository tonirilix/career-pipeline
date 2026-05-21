CREATE TABLE IF NOT EXISTS follow_up_reminders (
    id             TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES job_applications(id),
    due_at         TIMESTAMPTZ NOT NULL,
    note           TEXT NOT NULL DEFAULT '',
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL
);
