import type {
  CreateSavedJobOpportunityCommand,
  JobApplication,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";
import type { StageTransitionCommand } from "../../domain/stageTransition";

export type JobApplicationGateway = {
  listApplications(): Promise<JobApplication[]>;
  createSavedOpportunity(
    command: CreateSavedJobOpportunityCommand
  ): Promise<SavedJobOpportunity>;
  advanceApplicationStage(
    command: StageTransitionCommand
  ): Promise<JobApplication>;
};
