import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  type JobApplication,
  type SavedJobOpportunity,
  validateSavedJobOpportunity
} from "../domain/jobOpportunity";
import type {
  StageTransitionCommand,
  StageTransitionFailure
} from "../domain/stageTransition";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand,
  FollowUpReminderFailure
} from "../domain/followUpReminder";
import type {
  ScheduleInterviewCommand,
  ScheduleInterviewFailure
} from "../domain/interviewScheduling";
import type { JobApplicationGateway } from "./ports/jobApplicationGateway";

export type CreateSavedOpportunityResult =
  | { ok: true; opportunity: SavedJobOpportunity }
  | { ok: false; errors: FieldError[] };

export type AdvanceApplicationStageResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: StageTransitionFailure };

export type ScheduleApplicationInterviewResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: ScheduleInterviewFailure };

export type CreateApplicationFollowUpReminderResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: FollowUpReminderFailure };

export type CompleteApplicationFollowUpReminderResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: FollowUpReminderFailure };

export function listApplications(gateway: JobApplicationGateway) {
  return gateway.listApplications();
}

export async function createSavedOpportunity(
  gateway: JobApplicationGateway,
  command: CreateSavedJobOpportunityCommand
): Promise<CreateSavedOpportunityResult> {
  const validation = validateSavedJobOpportunity(command);

  if (!validation.ok) {
    return { ok: false, errors: validation.errors };
  }

  return {
    ok: true,
    opportunity: await gateway.createSavedOpportunity(validation.value)
  };
}

export async function advanceApplicationStage(
  gateway: JobApplicationGateway,
  command: StageTransitionCommand
): Promise<AdvanceApplicationStageResult> {
  try {
    return {
      ok: true,
      application: await gateway.advanceApplicationStage(command)
    };
  } catch (error) {
    return {
      ok: false,
      failure: {
        message:
          error instanceof Error
            ? error.message
            : "Could not update the application stage."
      }
    };
  }
}

export async function scheduleApplicationInterview(
  gateway: JobApplicationGateway,
  command: ScheduleInterviewCommand
): Promise<ScheduleApplicationInterviewResult> {
  try {
    return {
      ok: true,
      application: await gateway.scheduleInterview(command)
    };
  } catch (error) {
    return {
      ok: false,
      failure: {
        message:
          error instanceof Error
            ? error.message
            : "Could not schedule the interview."
      }
    };
  }
}

export async function createApplicationFollowUpReminder(
  gateway: JobApplicationGateway,
  command: CreateFollowUpReminderCommand
): Promise<CreateApplicationFollowUpReminderResult> {
  try {
    return {
      ok: true,
      application: await gateway.createFollowUpReminder(command)
    };
  } catch (error) {
    return {
      ok: false,
      failure: {
        message:
          error instanceof Error
            ? error.message
            : "Could not create the follow-up reminder."
      }
    };
  }
}

export async function completeApplicationFollowUpReminder(
  gateway: JobApplicationGateway,
  command: CompleteFollowUpReminderCommand
): Promise<CompleteApplicationFollowUpReminderResult> {
  try {
    return {
      ok: true,
      application: await gateway.completeFollowUpReminder(command)
    };
  } catch (error) {
    return {
      ok: false,
      failure: {
        message:
          error instanceof Error
            ? error.message
            : "Could not complete the follow-up reminder."
      }
    };
  }
}
