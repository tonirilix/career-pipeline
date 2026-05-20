-- Seed data for local development
INSERT INTO job_applications (id, company, role_title, posting_url, source, location, compensation, employment_type, stage, created_at) VALUES
  ('seed-1', 'Stripe', 'Senior Engineer', 'https://stripe.com/jobs/1', 'LinkedIn', 'Remote', '$180k–$220k', 'Full-time', 'Saved', '2024-01-01T09:00:00Z'),
  ('seed-2', 'Vercel', 'Staff Engineer', 'https://vercel.com/careers/2', 'Referral', 'Remote', '$200k–$240k', 'Full-time', 'Applied', '2024-01-03T10:00:00Z'),
  ('seed-3', 'Linear', 'Frontend Engineer', 'https://linear.app/jobs/3', 'Company site', 'Remote', '$150k–$180k', 'Full-time', 'Screening', '2024-01-05T11:00:00Z'),
  ('seed-4', 'Notion', 'Platform Engineer', 'https://notion.so/careers/4', 'Recruiter', 'New York, NY', '$160k–$200k', 'Full-time', 'Onsite', '2024-01-08T09:00:00Z'),
  ('seed-5', 'Figma', 'Backend Engineer', 'https://figma.com/jobs/5', 'LinkedIn', 'San Francisco, CA', '$190k–$230k', 'Full-time', 'Offer', '2024-01-10T08:00:00Z'),
  ('seed-6', 'Atlassian', 'Software Engineer', 'https://atlassian.com/jobs/6', 'LinkedIn', 'Remote', '$140k–$170k', 'Full-time', 'Rejected', '2024-01-02T09:00:00Z'),
  ('seed-7', 'GitHub', 'DevEx Engineer', 'https://github.com/careers/7', 'Referral', 'Remote', '$170k–$210k', 'Full-time', 'Withdrawn', '2024-01-04T10:00:00Z');

-- Timeline events
INSERT INTO timeline_events (id, application_id, description, occurred_at) VALUES
  ('tl-1-1', 'seed-1', 'Saved opportunity', '2024-01-01T09:00:00Z'),
  ('tl-2-1', 'seed-2', 'Saved opportunity', '2024-01-03T10:00:00Z'),
  ('tl-2-2', 'seed-2', 'Moved from Saved to Applied', '2024-01-04T09:00:00Z'),
  ('tl-3-1', 'seed-3', 'Saved opportunity', '2024-01-05T11:00:00Z'),
  ('tl-3-2', 'seed-3', 'Moved from Saved to Applied', '2024-01-06T09:00:00Z'),
  ('tl-3-3', 'seed-3', 'Moved from Applied to Screening', '2024-01-09T10:00:00Z'),
  ('tl-4-1', 'seed-4', 'Saved opportunity', '2024-01-08T09:00:00Z'),
  ('tl-4-2', 'seed-4', 'Moved from Saved to Applied', '2024-01-09T09:00:00Z'),
  ('tl-4-3', 'seed-4', 'Moved from Applied to Screening', '2024-01-11T09:00:00Z'),
  ('tl-4-4', 'seed-4', 'Moved from Screening to Technical interview', '2024-01-13T09:00:00Z'),
  ('tl-4-5', 'seed-4', 'Moved from Technical interview to Onsite', '2024-01-16T09:00:00Z'),
  ('tl-5-1', 'seed-5', 'Saved opportunity', '2024-01-10T08:00:00Z'),
  ('tl-5-2', 'seed-5', 'Moved from Saved to Applied', '2024-01-11T08:00:00Z'),
  ('tl-5-3', 'seed-5', 'Moved from Applied to Screening', '2024-01-13T08:00:00Z'),
  ('tl-5-4', 'seed-5', 'Moved from Screening to Technical interview', '2024-01-15T08:00:00Z'),
  ('tl-5-5', 'seed-5', 'Moved from Technical interview to Onsite', '2024-01-18T08:00:00Z'),
  ('tl-5-6', 'seed-5', 'Moved from Onsite to Offer', '2024-01-22T08:00:00Z'),
  ('tl-6-1', 'seed-6', 'Saved opportunity', '2024-01-02T09:00:00Z'),
  ('tl-6-2', 'seed-6', 'Moved from Saved to Applied', '2024-01-03T09:00:00Z'),
  ('tl-6-3', 'seed-6', 'Moved from Applied to Rejected', '2024-01-07T09:00:00Z'),
  ('tl-7-1', 'seed-7', 'Saved opportunity', '2024-01-04T10:00:00Z'),
  ('tl-7-2', 'seed-7', 'Moved from Saved to Applied', '2024-01-05T10:00:00Z'),
  ('tl-7-3', 'seed-7', 'Moved from Applied to Withdrawn', '2024-01-08T10:00:00Z');

-- Interviews
INSERT INTO interviews (id, application_id, type, scheduled_at, notes, outcome, created_at) VALUES
  ('iv-3-1', 'seed-3', 'Recruiter screen', '2024-01-10T14:00:00Z', 'Initial screening call', 'Passed', '2024-01-09T10:00:00Z'),
  ('iv-4-1', 'seed-4', 'Recruiter screen', '2024-01-12T15:00:00Z', 'HR screen', 'Passed', '2024-01-11T09:00:00Z'),
  ('iv-4-2', 'seed-4', 'Technical', '2024-01-15T10:00:00Z', 'System design + coding', 'Passed', '2024-01-13T09:00:00Z'),
  ('iv-4-3', 'seed-4', 'Onsite', '2024-01-18T09:00:00Z', 'Full day loop', 'Scheduled', '2024-01-16T09:00:00Z');

-- Follow-up reminders
INSERT INTO follow_up_reminders (id, application_id, due_at, note, completed_at, created_at) VALUES
  ('fu-2-1', 'seed-2', '2024-02-01T09:00:00Z', 'Follow up on application status', NULL, '2024-01-04T09:00:00Z'),
  ('fu-3-1', 'seed-3', '2024-01-18T09:00:00Z', 'Send thank-you email after screen', '2024-01-12T10:00:00Z', '2024-01-09T10:00:00Z');

-- Application notes
INSERT INTO application_notes (id, application_id, body, created_at) VALUES
  ('n-4-1', 'seed-4', 'Great culture fit from recruiter call. Team works on distributed systems.', '2024-01-11T09:00:00Z'),
  ('n-4-2', 'seed-4', 'System design round went well. Focused on rate limiting architecture.', '2024-01-15T11:00:00Z'),
  ('n-5-1', 'seed-5', 'Referral from ex-colleague. Compensation is very strong.', '2024-01-10T08:00:00Z');
