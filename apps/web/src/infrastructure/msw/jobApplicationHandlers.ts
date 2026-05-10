import { graphql, HttpResponse } from "msw";

import type {
  CreateSavedJobOpportunityCommand,
  JobApplication,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";
import {
  type StageTransitionCommand,
  transitionApplicationStage
} from "../../domain/stageTransition";

let applications: JobApplication[] = [];
let nextApplicationId = 1;
let nextTimelineEventId = 1;

export const jobApplicationHandlers = [
  graphql.query("ListApplications", () => {
    return HttpResponse.json({
      data: {
        applications
      }
    });
  }),

  graphql.mutation("CreateSavedOpportunity", ({ variables }) => {
    const { input } = variables as {
      input: CreateSavedJobOpportunityCommand;
    };
    const opportunity: SavedJobOpportunity = {
      id: String(nextApplicationId),
      ...input,
      stage: "Saved",
      timeline: [
        {
          id: String(nextTimelineEventId),
          occurredAt: new Date().toISOString(),
          description: "Saved opportunity"
        }
      ]
    };

    nextApplicationId += 1;
    nextTimelineEventId += 1;
    applications = [...applications, opportunity];

    return HttpResponse.json({
      data: {
        createSavedOpportunity: opportunity
      }
    });
  }),

  graphql.mutation("AdvanceApplicationStage", ({ variables }) => {
    const { input } = variables as {
      input: StageTransitionCommand;
    };
    const application = applications.find(
      (candidate) => candidate.id === input.applicationId
    );

    if (!application) {
      return HttpResponse.json({
        errors: [{ message: "Application could not be found." }]
      });
    }

    const result = transitionApplicationStage(application, input, {
      id: String(nextTimelineEventId),
      occurredAt: new Date().toISOString(),
      description: `Moved from ${application.stage} to ${input.toStage}`
    });

    if (!result.ok) {
      return HttpResponse.json({
        errors: [{ message: result.failure.message }]
      });
    }

    nextTimelineEventId += 1;
    applications = applications.map((candidate) =>
      candidate.id === result.application.id ? result.application : candidate
    );

    return HttpResponse.json({
      data: {
        advanceApplicationStage: result.application
      }
    });
  })
];

export function resetJobApplicationMockData() {
  applications = [];
  nextApplicationId = 1;
  nextTimelineEventId = 1;
}
