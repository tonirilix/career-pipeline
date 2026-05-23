import { graphql, HttpResponse } from "msw";

import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../../domain/followUpReminder";
import type { CreateSavedJobOpportunityCommand } from "../../domain/jobOpportunity";
import type { ScheduleInterviewCommand } from "../../domain/interviewScheduling";
import type { StageTransitionCommand } from "../../domain/stageTransition";
import { jobApplicationMockBackend } from "../mockBackend/jobApplicationMockBackend";

export const jobApplicationHandlers = [
  graphql.query("ListApplications", () => {
    return HttpResponse.json({
      data: {
        applications: jobApplicationMockBackend.listApplications()
      }
    });
  }),

  graphql.mutation("CreateSavedOpportunity", ({ variables }) => {
    const { input } = variables as {
      input: CreateSavedJobOpportunityCommand;
    };
    const opportunity = jobApplicationMockBackend.createSavedOpportunity(input);

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
    try {
      const application = jobApplicationMockBackend.advanceApplicationStage(input);
      return HttpResponse.json({
        data: {
          advanceApplicationStage: application
        }
      });
    } catch (error) {
      return HttpResponse.json({
        errors: [{ message: errorMessage(error) }]
      });
    }
  }),

  graphql.mutation("ScheduleInterview", ({ variables }) => {
    const { input } = variables as {
      input: ScheduleInterviewCommand;
    };
    try {
      const application = jobApplicationMockBackend.scheduleInterview(input);
      return HttpResponse.json({
        data: {
          scheduleInterview: application
        }
      });
    } catch (error) {
      return HttpResponse.json({
        errors: [{ message: errorMessage(error) }]
      });
    }
  }),

  graphql.mutation("CreateFollowUpReminder", ({ variables }) => {
    const { input } = variables as {
      input: CreateFollowUpReminderCommand;
    };
    try {
      const application = jobApplicationMockBackend.createFollowUpReminder(input);
      return HttpResponse.json({
        data: {
          createFollowUpReminder: application
        }
      });
    } catch (error) {
      return HttpResponse.json({
        errors: [{ message: errorMessage(error) }]
      });
    }
  }),

  graphql.mutation("CompleteFollowUpReminder", ({ variables }) => {
    const { input } = variables as {
      input: CompleteFollowUpReminderCommand;
    };
    try {
      const application = jobApplicationMockBackend.completeFollowUpReminder(input);
      return HttpResponse.json({
        data: {
          completeFollowUpReminder: application
        }
      });
    } catch (error) {
      return HttpResponse.json({
        errors: [{ message: errorMessage(error) }]
      });
    }
  }),

  graphql.mutation("AddApplicationNote", ({ variables }) => {
    const { input } = variables as {
      input: AddApplicationNoteCommand;
    };
    try {
      const application = jobApplicationMockBackend.addApplicationNote(input);
      return HttpResponse.json({
        data: {
          addApplicationNote: application
        }
      });
    } catch (error) {
      return HttpResponse.json({
        errors: [{ message: errorMessage(error) }]
      });
    }
  })
];

export function resetJobApplicationMockData() {
  jobApplicationMockBackend.reset();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Mock backend request failed.";
}
