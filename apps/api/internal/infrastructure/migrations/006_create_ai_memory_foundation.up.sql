CREATE TABLE IF NOT EXISTS candidate_profiles (
    id                         TEXT PRIMARY KEY,
    target_roles               TEXT NOT NULL DEFAULT '',
    preferred_stack            TEXT NOT NULL DEFAULT '',
    compensation_expectations  TEXT NOT NULL DEFAULT '',
    location_preferences       TEXT NOT NULL DEFAULT '',
    work_constraints           TEXT NOT NULL DEFAULT '',
    company_preferences        TEXT NOT NULL DEFAULT '',
    writing_tone               TEXT NOT NULL DEFAULT '',
    positioning_summary        TEXT NOT NULL DEFAULT '',
    created_at                 TIMESTAMPTZ NOT NULL,
    updated_at                 TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS candidate_memory_records (
    id             TEXT PRIMARY KEY,
    memory_type    TEXT NOT NULL,
    title          TEXT NOT NULL,
    body           TEXT NOT NULL,
    source         TEXT NOT NULL DEFAULT '',
    approved       BOOLEAN NOT NULL DEFAULT FALSE,
    sensitive      BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at    TIMESTAMPTZ,
    superseded_by  TEXT REFERENCES candidate_memory_records(id),
    metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL,
    updated_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_artifacts (
    id                   TEXT PRIMARY KEY,
    artifact_type        TEXT NOT NULL,
    owner_type           TEXT NOT NULL,
    owner_id             TEXT NOT NULL,
    title                TEXT NOT NULL,
    source_inputs        JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_content    TEXT NOT NULL,
    user_edited_content  TEXT,
    status               TEXT NOT NULL DEFAULT 'Draft',
    sensitive            BOOLEAN NOT NULL DEFAULT FALSE,
    superseded_by        TEXT REFERENCES ai_artifacts(id),
    provider_name        TEXT,
    model_name           TEXT,
    prompt_id            TEXT,
    usage_metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_provider_id      TEXT,
    created_at           TIMESTAMPTZ NOT NULL,
    updated_at           TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_candidate_memory_records_current
    ON candidate_memory_records (approved, archived_at, superseded_by, created_at);

CREATE INDEX IF NOT EXISTS idx_ai_artifacts_owner
    ON ai_artifacts (owner_type, owner_id, created_at);
