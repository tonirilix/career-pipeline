import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  type SavedJobOpportunity,
  validateSavedJobOpportunity
} from "../domain/jobOpportunity";
import type { JobApplicationGateway } from "./ports/jobApplicationGateway";

export type CreateSavedOpportunityResult =
  | { ok: true; opportunity: SavedJobOpportunity }
  | { ok: false; errors: FieldError[] };

export function listSavedOpportunities(gateway: JobApplicationGateway) {
  return gateway.listSavedOpportunities();
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
