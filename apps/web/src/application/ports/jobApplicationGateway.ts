import type {
  CreateSavedJobOpportunityCommand,
  JobApplication,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../../domain/followUpReminder";
import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import type {
  RecordInterviewOutcomeCommand,
  ScheduleInterviewCommand
} from "../../domain/interviewScheduling";
import type { StageTransitionCommand } from "../../domain/stageTransition";

export type JobApplicationGateway = {
  listApplications(): Promise<JobApplication[]>;
  createSavedOpportunity(
    command: CreateSavedJobOpportunityCommand
  ): Promise<SavedJobOpportunity>;
  advanceApplicationStage(
    command: StageTransitionCommand
  ): Promise<JobApplication>;
  scheduleInterview(command: ScheduleInterviewCommand): Promise<JobApplication>;
  recordInterviewOutcome(
    command: RecordInterviewOutcomeCommand
  ): Promise<JobApplication>;
  createFollowUpReminder(
    command: CreateFollowUpReminderCommand
  ): Promise<JobApplication>;
  completeFollowUpReminder(
    command: CompleteFollowUpReminderCommand
  ): Promise<JobApplication>;
  addApplicationNote(command: AddApplicationNoteCommand): Promise<JobApplication>;
};
