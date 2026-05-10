import type { ApplicationStage } from "./applicationStage";

export const jobSources = [
  "LinkedIn",
  "Referral",
  "Recruiter",
  "Company site",
  "Other"
] as const;

export const employmentTypes = [
  "Full-time",
  "Contract",
  "Part-time",
  "Internship",
  "Other"
] as const;

export type JobSource = (typeof jobSources)[number];
export type EmploymentType = (typeof employmentTypes)[number];

export type TimelineEvent = {
  id: string;
  occurredAt: string;
  description: string;
};

export const interviewTypes = [
  "Recruiter screen",
  "Hiring manager",
  "Technical",
  "Onsite",
  "Other"
] as const;

export const interviewOutcomes = [
  "Scheduled",
  "Passed",
  "Rejected",
  "No decision"
] as const;

export type InterviewType = (typeof interviewTypes)[number];
export type InterviewOutcome = (typeof interviewOutcomes)[number];

export type Interview = {
  id: string;
  type: InterviewType;
  scheduledAt: string;
  notes: string;
  outcome: InterviewOutcome;
};

export type FollowUpReminder = {
  id: string;
  applicationId: string;
  dueAt: string;
  note: string;
  completedAt: string | null;
};

export type JobApplication = {
  id: string;
  company: string;
  roleTitle: string;
  postingUrl: string;
  source: JobSource;
  location: string;
  compensation: string;
  employmentType: EmploymentType;
  stage: ApplicationStage;
  timeline: TimelineEvent[];
  interviews: Interview[];
  followUps: FollowUpReminder[];
};

export type SavedJobOpportunity = JobApplication & { stage: "Saved" };

export type CreateSavedJobOpportunityCommand = {
  company: string;
  roleTitle: string;
  postingUrl: string;
  source: JobSource;
  location: string;
  compensation: string;
  employmentType: EmploymentType;
};

export type FieldError = {
  field: keyof CreateSavedJobOpportunityCommand;
  message: string;
};

export type ValidationResult =
  | { ok: true; value: CreateSavedJobOpportunityCommand }
  | { ok: false; errors: FieldError[] };

export function validateSavedJobOpportunity(
  command: CreateSavedJobOpportunityCommand
): ValidationResult {
  const errors: FieldError[] = [];
  const trimmed = {
    ...command,
    company: command.company.trim(),
    roleTitle: command.roleTitle.trim(),
    postingUrl: command.postingUrl.trim(),
    location: command.location.trim(),
    compensation: command.compensation.trim()
  };

  if (!trimmed.company) {
    errors.push({ field: "company", message: "Company is required" });
  }

  if (!trimmed.roleTitle) {
    errors.push({ field: "roleTitle", message: "Role title is required" });
  }

  try {
    const url = new URL(trimmed.postingUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push({
        field: "postingUrl",
        message: "Posting URL must start with http:// or https://"
      });
    }
  } catch {
    errors.push({
      field: "postingUrl",
      message: "Posting URL must be a valid URL"
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: trimmed };
}
