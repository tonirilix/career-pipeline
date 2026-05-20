CREATE TABLE IF NOT EXISTS interviews (
    id             TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES job_applications(id),
    type           TEXT NOT NULL,
    scheduled_at   DATETIME NOT NULL,
    notes          TEXT NOT NULL DEFAULT '',
    outcome        TEXT NOT NULL DEFAULT 'Scheduled',
    created_at     DATETIME NOT NULL
);
