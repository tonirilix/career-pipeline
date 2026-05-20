CREATE TABLE IF NOT EXISTS job_applications (
    id              TEXT PRIMARY KEY,
    company         TEXT NOT NULL,
    role_title      TEXT NOT NULL,
    posting_url     TEXT NOT NULL DEFAULT '',
    source          TEXT NOT NULL DEFAULT 'Other',
    location        TEXT NOT NULL DEFAULT '',
    compensation    TEXT NOT NULL DEFAULT '',
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    stage           TEXT NOT NULL DEFAULT 'Saved',
    created_at      DATETIME NOT NULL
);
