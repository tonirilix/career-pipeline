import type { JobApplicationGateway } from "../../application/ports/jobApplicationGateway";
import type {
  CreateSavedJobOpportunityCommand,
  EmploymentType,
  FollowUpReminder,
  Interview,
  InterviewOutcome,
  InterviewType,
  JobApplication,
  JobSource,
  TimelineEvent,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";
import type { ApplicationStage } from "../../domain/applicationStage";
import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../../domain/followUpReminder";
import type { ScheduleInterviewCommand } from "../../domain/interviewScheduling";
import type { StageTransitionCommand } from "../../domain/stageTransition";

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

type GraphqlTimelineEventDto = {
  __typename?: string;
  id: string;
  occurredAt: string;
  description: string;
};

type GraphqlInterviewDto = {
  __typename?: string;
  id: string;
  type: InterviewType;
  scheduledAt: string;
  notes: string;
  outcome: InterviewOutcome;
};

type GraphqlFollowUpReminderDto = {
  __typename?: string;
  id: string;
  applicationId: string;
  dueAt: string;
  note: string;
  completedAt: string | null;
};

type GraphqlApplicationNoteDto = {
  __typename?: string;
  id: string;
  body: string;
  createdAt: string;
};

type GraphqlJobApplicationDto = {
  __typename?: string;
  id: string;
  company: string;
  roleTitle: string;
  postingUrl: string;
  source: JobSource;
  location: string;
  compensation: string;
  employmentType: EmploymentType;
  stage: ApplicationStage;
  timeline: GraphqlTimelineEventDto[];
  interviews: GraphqlInterviewDto[];
  followUps: GraphqlFollowUpReminderDto[];
  notes: GraphqlApplicationNoteDto[];
};

type GraphqlSavedJobOpportunityDto = GraphqlJobApplicationDto & {
  stage: "Saved";
};

const applicationFields = `
      id
      company
      roleTitle
      postingUrl
      source
      location
      compensation
      employmentType
      stage
      timeline {
        id
        occurredAt
        description
      }
      interviews {
        id
        type
        scheduledAt
        notes
        outcome
      }
      followUps {
        id
        applicationId
        dueAt
        note
        completedAt
      }
      notes {
        id
        body
        createdAt
      }
`;

const listApplicationsQuery = `
  query ListApplications {
    applications {
      ${applicationFields}
    }
  }
`;

const createSavedOpportunityMutation = `
  mutation CreateSavedOpportunity($input: CreateSavedOpportunityInput!) {
    createSavedOpportunity(input: $input) {
      ${applicationFields}
    }
  }
`;

const advanceApplicationStageMutation = `
  mutation AdvanceApplicationStage($input: AdvanceApplicationStageInput!) {
    advanceApplicationStage(input: $input) {
      ${applicationFields}
    }
  }
`;

const scheduleInterviewMutation = `
  mutation ScheduleInterview($input: ScheduleInterviewInput!) {
    scheduleInterview(input: $input) {
      ${applicationFields}
    }
  }
`;

const createFollowUpReminderMutation = `
  mutation CreateFollowUpReminder($input: CreateFollowUpReminderInput!) {
    createFollowUpReminder(input: $input) {
      ${applicationFields}
    }
  }
`;

const completeFollowUpReminderMutation = `
  mutation CompleteFollowUpReminder($input: CompleteFollowUpReminderInput!) {
    completeFollowUpReminder(input: $input) {
      ${applicationFields}
    }
  }
`;

const addApplicationNoteMutation = `
  mutation AddApplicationNote($input: AddApplicationNoteInput!) {
    addApplicationNote(input: $input) {
      ${applicationFields}
    }
  }
`;

export function createJobApplicationGraphqlGateway(
  endpoint = graphqlEndpoint()
): JobApplicationGateway {
  return {
    async listApplications() {
      const response = await requestGraphql<{
        applications: GraphqlJobApplicationDto[];
      }>(endpoint, {
        query: listApplicationsQuery,
        operationName: "ListApplications"
      });

      return response.applications.map(mapJobApplication);
    },

    async createSavedOpportunity(command: CreateSavedJobOpportunityCommand) {
      const response = await requestGraphql<{
        createSavedOpportunity: GraphqlSavedJobOpportunityDto;
      }>(endpoint, {
        query: createSavedOpportunityMutation,
        operationName: "CreateSavedOpportunity",
        variables: {
          input: command
        }
      });

      return mapSavedJobOpportunity(response.createSavedOpportunity);
    },

    async advanceApplicationStage(command: StageTransitionCommand) {
      const response = await requestGraphql<{
        advanceApplicationStage: GraphqlJobApplicationDto;
      }>(endpoint, {
        query: advanceApplicationStageMutation,
        operationName: "AdvanceApplicationStage",
        variables: {
          input: command
        }
      });

      return mapJobApplication(response.advanceApplicationStage);
    },

    async scheduleInterview(command: ScheduleInterviewCommand) {
      const response = await requestGraphql<{
        scheduleInterview: GraphqlJobApplicationDto;
      }>(endpoint, {
        query: scheduleInterviewMutation,
        operationName: "ScheduleInterview",
        variables: {
          input: command
        }
      });

      return mapJobApplication(response.scheduleInterview);
    },

    async createFollowUpReminder(command: CreateFollowUpReminderCommand) {
      const response = await requestGraphql<{
        createFollowUpReminder: GraphqlJobApplicationDto;
      }>(endpoint, {
        query: createFollowUpReminderMutation,
        operationName: "CreateFollowUpReminder",
        variables: {
          input: command
        }
      });

      return mapJobApplication(response.createFollowUpReminder);
    },

    async completeFollowUpReminder(command: CompleteFollowUpReminderCommand) {
      const response = await requestGraphql<{
        completeFollowUpReminder: GraphqlJobApplicationDto;
      }>(endpoint, {
        query: completeFollowUpReminderMutation,
        operationName: "CompleteFollowUpReminder",
        variables: {
          input: command
        }
      });

      return mapJobApplication(response.completeFollowUpReminder);
    },

    async addApplicationNote(command: AddApplicationNoteCommand) {
      const response = await requestGraphql<{
        addApplicationNote: GraphqlJobApplicationDto;
      }>(endpoint, {
        query: addApplicationNoteMutation,
        operationName: "AddApplicationNote",
        variables: {
          input: command
        }
      });

      return mapJobApplication(response.addApplicationNote);
    }
  };
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
    source: dto.source,
    location: dto.location,
    compensation: dto.compensation,
    employmentType: dto.employmentType,
    stage: dto.stage,
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
    type: dto.type,
    scheduledAt: dto.scheduledAt,
    notes: dto.notes,
    outcome: dto.outcome
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
    variables?: Record<string, unknown>;
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
  if (typeof window === "undefined") {
    return "http://localhost/graphql";
  }

  return new URL("/graphql", window.location.origin).toString();
}
