CREATE TABLE IF NOT EXISTS application_notes (
    id             TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES job_applications(id),
    body           TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL
);
