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
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id TEXT PRIMARY KEY,
    target_roles TEXT NOT NULL DEFAULT '',
    preferred_stack TEXT NOT NULL DEFAULT '',
    compensation_expectations TEXT NOT NULL DEFAULT '',
    location_preferences TEXT NOT NULL DEFAULT '',
    work_constraints TEXT NOT NULL DEFAULT '',
    company_preferences TEXT NOT NULL DEFAULT '',
    writing_tone TEXT NOT NULL DEFAULT '',
    positioning_summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS candidate_memory_records (
    id TEXT PRIMARY KEY,
    memory_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT '',
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    superseded_by TEXT REFERENCES candidate_memory_records(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS ai_artifacts (
    id TEXT PRIMARY KEY,
    artifact_type TEXT NOT NULL,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    source_inputs JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_content TEXT NOT NULL,
    user_edited_content TEXT,
    status TEXT NOT NULL DEFAULT 'Draft',
    sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    superseded_by TEXT REFERENCES ai_artifacts(id),
    provider_name TEXT,
    model_name TEXT,
    prompt_id TEXT,
    usage_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_provider_id TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
