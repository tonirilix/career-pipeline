-- name: GetCandidateProfile :one
SELECT id, target_roles, preferred_stack, compensation_expectations, location_preferences,
       work_constraints, company_preferences, writing_tone, positioning_summary,
       created_at, updated_at
FROM candidate_profiles
WHERE id = $1;

-- name: UpsertCandidateProfile :one
INSERT INTO candidate_profiles (
    id, target_roles, preferred_stack, compensation_expectations, location_preferences,
    work_constraints, company_preferences, writing_tone, positioning_summary,
    created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (id) DO UPDATE SET
    target_roles = EXCLUDED.target_roles,
    preferred_stack = EXCLUDED.preferred_stack,
    compensation_expectations = EXCLUDED.compensation_expectations,
    location_preferences = EXCLUDED.location_preferences,
    work_constraints = EXCLUDED.work_constraints,
    company_preferences = EXCLUDED.company_preferences,
    writing_tone = EXCLUDED.writing_tone,
    positioning_summary = EXCLUDED.positioning_summary,
    updated_at = EXCLUDED.updated_at
RETURNING id, target_roles, preferred_stack, compensation_expectations, location_preferences,
          work_constraints, company_preferences, writing_tone, positioning_summary,
          created_at, updated_at;
