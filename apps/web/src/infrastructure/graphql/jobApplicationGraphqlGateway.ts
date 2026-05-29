import type { JobApplicationGateway } from "../../application/ports/jobApplicationGateway";
import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import type { ApplicationStage } from "../../domain/applicationStage";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../../domain/followUpReminder";
import type {
  RecordInterviewOutcomeCommand,
  ScheduleInterviewCommand
} from "../../domain/interviewScheduling";
import type {
  CreateSavedJobOpportunityCommand,
  FollowUpReminder,
  Interview,
  InterviewOutcome,
  InterviewType,
  JobApplication,
  JobSource,
  SavedJobOpportunity,
  TimelineEvent
} from "../../domain/jobOpportunity";
import type { StageTransitionCommand } from "../../domain/stageTransition";
import type {
  AddApplicationNoteMutation,
  AddApplicationNoteMutationVariables,
  AdvanceApplicationStageMutation,
  AdvanceApplicationStageMutationVariables,
  CompleteFollowUpReminderMutation,
  CompleteFollowUpReminderMutationVariables,
  CreateFollowUpReminderMutation,
  CreateFollowUpReminderMutationVariables,
  CreateSavedOpportunityMutation,
  CreateSavedOpportunityMutationVariables,
  JobApplicationFieldsFragment,
  ListApplicationsQuery,
  RecordInterviewOutcomeMutation,
  RecordInterviewOutcomeMutationVariables,
  ScheduleInterviewMutation,
  ScheduleInterviewMutationVariables
} from "./generated";
import addApplicationNoteDocument from "./addApplicationNote.graphql?raw";
import advanceApplicationStageDocument from "./advanceApplicationStage.graphql?raw";
import completeFollowUpReminderDocument from "./completeFollowUpReminder.graphql?raw";
import createFollowUpReminderDocument from "./createFollowUpReminder.graphql?raw";
import createSavedOpportunityDocument from "./createSavedOpportunity.graphql?raw";
import jobApplicationFieldsDocument from "./jobApplicationFields.graphql?raw";
import listApplicationsDocument from "./listApplications.graphql?raw";
import recordInterviewOutcomeDocument from "./recordInterviewOutcome.graphql?raw";
import scheduleInterviewDocument from "./scheduleInterview.graphql?raw";

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

type GraphqlJobApplicationDto = JobApplicationFieldsFragment;
type GraphqlSavedJobOpportunityDto = GraphqlJobApplicationDto & {
  stage: "Saved";
};
type GraphqlTimelineEventDto = GraphqlJobApplicationDto["timeline"][number];
type GraphqlInterviewDto = GraphqlJobApplicationDto["interviews"][number];
type GraphqlFollowUpReminderDto = GraphqlJobApplicationDto["followUps"][number];
type GraphqlApplicationNoteDto = GraphqlJobApplicationDto["notes"][number];

export const jobApplicationGraphqlOperations = [
  operationDocument(listApplicationsDocument),
  operationDocument(createSavedOpportunityDocument),
  operationDocument(advanceApplicationStageDocument),
  operationDocument(scheduleInterviewDocument),
  operationDocument(recordInterviewOutcomeDocument),
  operationDocument(createFollowUpReminderDocument),
  operationDocument(completeFollowUpReminderDocument),
  operationDocument(addApplicationNoteDocument)
] as const;

export function createJobApplicationGraphqlGateway(
  endpoint = graphqlEndpoint()
): JobApplicationGateway {
  return {
    async listApplications() {
      const response = await requestGraphql<ListApplicationsQuery>(endpoint, {
        query: operationDocument(listApplicationsDocument),
        operationName: "ListApplications"
      });

      return response.applications.map(mapJobApplication);
    },

    async createSavedOpportunity(command: CreateSavedJobOpportunityCommand) {
      const variables = {
        input: command
      } satisfies CreateSavedOpportunityMutationVariables;
      const response = await requestGraphql<CreateSavedOpportunityMutation>(
        endpoint,
        {
          query: operationDocument(createSavedOpportunityDocument),
          operationName: "CreateSavedOpportunity",
          variables
        }
      );

      return mapSavedJobOpportunity(
        response.createSavedOpportunity as GraphqlSavedJobOpportunityDto
      );
    },

    async advanceApplicationStage(command: StageTransitionCommand) {
      const variables = {
        input: command
      } satisfies AdvanceApplicationStageMutationVariables;
      const response = await requestGraphql<AdvanceApplicationStageMutation>(
        endpoint,
        {
          query: operationDocument(advanceApplicationStageDocument),
          operationName: "AdvanceApplicationStage",
          variables
        }
      );

      return mapJobApplication(response.advanceApplicationStage);
    },

    async scheduleInterview(command: ScheduleInterviewCommand) {
      const variables = {
        input: command
      } satisfies ScheduleInterviewMutationVariables;
      const response = await requestGraphql<ScheduleInterviewMutation>(endpoint, {
        query: operationDocument(scheduleInterviewDocument),
        operationName: "ScheduleInterview",
        variables
      });

      return mapJobApplication(response.scheduleInterview);
    },

    async recordInterviewOutcome(command: RecordInterviewOutcomeCommand) {
      const variables = {
        input: command
      } satisfies RecordInterviewOutcomeMutationVariables;
      const response = await requestGraphql<RecordInterviewOutcomeMutation>(
        endpoint,
        {
          query: operationDocument(recordInterviewOutcomeDocument),
          operationName: "RecordInterviewOutcome",
          variables
        }
      );

      return mapJobApplication(response.recordInterviewOutcome);
    },

    async createFollowUpReminder(command: CreateFollowUpReminderCommand) {
      const variables = {
        input: command
      } satisfies CreateFollowUpReminderMutationVariables;
      const response = await requestGraphql<CreateFollowUpReminderMutation>(
        endpoint,
        {
          query: operationDocument(createFollowUpReminderDocument),
          operationName: "CreateFollowUpReminder",
          variables
        }
      );

      return mapJobApplication(response.createFollowUpReminder);
    },

    async completeFollowUpReminder(command: CompleteFollowUpReminderCommand) {
      const variables = {
        input: command
      } satisfies CompleteFollowUpReminderMutationVariables;
      const response = await requestGraphql<CompleteFollowUpReminderMutation>(
        endpoint,
        {
          query: operationDocument(completeFollowUpReminderDocument),
          operationName: "CompleteFollowUpReminder",
          variables
        }
      );

      return mapJobApplication(response.completeFollowUpReminder);
    },

    async addApplicationNote(command: AddApplicationNoteCommand) {
      const variables = {
        input: command
      } satisfies AddApplicationNoteMutationVariables;
      const response = await requestGraphql<AddApplicationNoteMutation>(
        endpoint,
        {
          query: operationDocument(addApplicationNoteDocument),
          operationName: "AddApplicationNote",
          variables
        }
      );

      return mapJobApplication(response.addApplicationNote);
    }
  };
}

function operationDocument(operation: string) {
  return `${jobApplicationFieldsDocument}\n\n${operation}`;
}

function mapSavedJobOpportunity(
  dto: GraphqlSavedJobOpportunityDto
): SavedJobOpportunity {
  return {
    ...mapJobApplication(dto),
    stage: "Saved"
  };
}

function mapJobApplication(dto: GraphqlJobApplicationDto): JobApplication {
  return {
    id: dto.id,
    company: dto.company,
    roleTitle: dto.roleTitle,
    postingUrl: dto.postingUrl,
    source: dto.source as JobSource,
    location: dto.location,
    compensation: dto.compensation,
    employmentType: dto.employmentType as JobApplication["employmentType"],
    stage: dto.stage as ApplicationStage,
    timeline: dto.timeline.map(mapTimelineEvent),
    interviews: dto.interviews.map(mapInterview),
    followUps: dto.followUps.map(mapFollowUpReminder),
    notes: dto.notes.map(mapApplicationNote)
  };
}

function mapTimelineEvent(dto: GraphqlTimelineEventDto): TimelineEvent {
  return {
    id: dto.id,
    occurredAt: dto.occurredAt,
    description: dto.description
  };
}

function mapInterview(dto: GraphqlInterviewDto): Interview {
  return {
    id: dto.id,
    type: dto.type as InterviewType,
    scheduledAt: dto.scheduledAt,
    notes: dto.notes,
    outcome: dto.outcome as InterviewOutcome
  };
}

function mapFollowUpReminder(
  dto: GraphqlFollowUpReminderDto
): FollowUpReminder {
  return {
    id: dto.id,
    applicationId: dto.applicationId,
    dueAt: dto.dueAt,
    note: dto.note,
    completedAt: dto.completedAt
  };
}

function mapApplicationNote(
  dto: GraphqlApplicationNoteDto
): JobApplication["notes"][number] {
  return {
    id: dto.id,
    body: dto.body,
    createdAt: dto.createdAt
  };
}

async function requestGraphql<TData>(
  endpoint: string,
  body: {
    query: string;
    operationName: string;
    variables?: object;
  }
): Promise<TData> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("GraphQL request failed");
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not include data");
  }

  return payload.data;
}

function graphqlEndpoint() {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    return apiUrl.replace(/\/$/, "") + "/graphql";
  }
  return "http://localhost:8080/graphql";
}
