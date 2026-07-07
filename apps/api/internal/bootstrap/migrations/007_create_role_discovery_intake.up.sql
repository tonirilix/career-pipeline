CREATE TABLE IF NOT EXISTS role_search_topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_titles TEXT NOT NULL DEFAULT '',
    preferred_stack TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    remote_preference TEXT NOT NULL DEFAULT '',
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    company_type TEXT NOT NULL DEFAULT 'Unknown',
    compensation TEXT NOT NULL DEFAULT '',
    seniority TEXT NOT NULL DEFAULT 'Unknown',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS role_records (
    id TEXT PRIMARY KEY,
    search_topic_id TEXT REFERENCES role_search_topics(id),
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    posting_url TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    source_kind TEXT NOT NULL DEFAULT 'Other',
    provider_source TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    raw_source_text TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    remote_eligibility TEXT NOT NULL DEFAULT 'Unknown',
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    seniority TEXT NOT NULL DEFAULT 'Unknown',
    compensation TEXT NOT NULL DEFAULT '',
    stack TEXT NOT NULL DEFAULT '',
    company_type TEXT NOT NULL DEFAULT 'Unknown',
    freshness_status TEXT NOT NULL DEFAULT 'Unknown',
    freshness_checked_at TIMESTAMPTZ,
    decision_status TEXT NOT NULL DEFAULT 'New',
    rejection_reason TEXT NOT NULL DEFAULT '',
    promoted_application_id TEXT REFERENCES job_applications(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_role_records_search_topic_id
    ON role_records(search_topic_id);

CREATE INDEX IF NOT EXISTS idx_role_records_decision_status
    ON role_records(decision_status);

CREATE INDEX IF NOT EXISTS idx_role_records_freshness_status
    ON role_records(freshness_status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_role_records_active_posting_url
    ON role_records(posting_url)
    WHERE posting_url <> '' AND decision_status <> 'Rejected';
