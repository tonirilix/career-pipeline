import { graphql, HttpResponse } from "msw";

import type {
  CreateSavedJobOpportunityCommand,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";

let savedOpportunities: SavedJobOpportunity[] = [];
let nextId = 1;

export const jobApplicationHandlers = [
  graphql.query("ListSavedOpportunities", () => {
    return HttpResponse.json({
      data: {
        savedOpportunities
      }
    });
  }),

  graphql.mutation("CreateSavedOpportunity", ({ variables }) => {
    const { input } = variables as {
      input: CreateSavedJobOpportunityCommand;
    };
    const opportunity: SavedJobOpportunity = {
      id: String(nextId),
      ...input,
      stage: "Saved"
    };

    nextId += 1;
    savedOpportunities = [...savedOpportunities, opportunity];

    return HttpResponse.json({
      data: {
        createSavedOpportunity: opportunity
      }
    });
  })
];

export function resetJobApplicationMockData() {
  savedOpportunities = [];
  nextId = 1;
}
