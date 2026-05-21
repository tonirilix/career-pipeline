CREATE TABLE IF NOT EXISTS timeline_events (
    id             TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES job_applications(id),
    description    TEXT NOT NULL,
    occurred_at    TIMESTAMPTZ NOT NULL
);
