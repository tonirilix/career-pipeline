CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY, company TEXT NOT NULL, role_title TEXT NOT NULL,
    posting_url TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT 'Other',
    location TEXT NOT NULL DEFAULT '', compensation TEXT NOT NULL DEFAULT '',
    employment_type TEXT NOT NULL DEFAULT 'Full-time', stage TEXT NOT NULL DEFAULT 'Saved',
    created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY, application_id TEXT NOT NULL REFERENCES job_applications(id),
    type TEXT NOT NULL, scheduled_at TIMESTAMPTZ NOT NULL, notes TEXT NOT NULL DEFAULT '',
    outcome TEXT NOT NULL DEFAULT 'Scheduled', created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS follow_up_reminders (
    id TEXT PRIMARY KEY, application_id TEXT NOT NULL REFERENCES job_applications(id),
    due_at TIMESTAMPTZ NOT NULL, note TEXT NOT NULL DEFAULT '',
    completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS application_notes (
    id TEXT PRIMARY KEY, application_id TEXT NOT NULL REFERENCES job_applications(id),
    body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY, application_id TEXT NOT NULL REFERENCES job_applications(id),
    description TEXT NOT NULL, occurred_at TIMESTAMPTZ NOT NULL
);
