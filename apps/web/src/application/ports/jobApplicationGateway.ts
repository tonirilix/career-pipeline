import type {
  CreateSavedJobOpportunityCommand,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";

export type JobApplicationGateway = {
  listSavedOpportunities(): Promise<SavedJobOpportunity[]>;
  createSavedOpportunity(
    command: CreateSavedJobOpportunityCommand
  ): Promise<SavedJobOpportunity>;
};
