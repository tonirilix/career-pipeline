import type { JobApplicationGateway } from "../../application/ports/jobApplicationGateway";
import type {
  CreateSavedJobOpportunityCommand,
  JobApplication,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";
import type { StageTransitionCommand } from "../../domain/stageTransition";

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
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

export function createJobApplicationGraphqlGateway(
  endpoint = graphqlEndpoint()
): JobApplicationGateway {
  return {
    async listApplications() {
      const response = await requestGraphql<{
        applications: JobApplication[];
      }>(endpoint, {
        query: listApplicationsQuery,
        operationName: "ListApplications"
      });

      return response.applications;
    },

    async createSavedOpportunity(command: CreateSavedJobOpportunityCommand) {
      const response = await requestGraphql<{
        createSavedOpportunity: SavedJobOpportunity;
      }>(endpoint, {
        query: createSavedOpportunityMutation,
        operationName: "CreateSavedOpportunity",
        variables: {
          input: command
        }
      });

      return response.createSavedOpportunity;
    },

    async advanceApplicationStage(command: StageTransitionCommand) {
      const response = await requestGraphql<{
        advanceApplicationStage: JobApplication;
      }>(endpoint, {
        query: advanceApplicationStageMutation,
        operationName: "AdvanceApplicationStage",
        variables: {
          input: command
        }
      });

      return response.advanceApplicationStage;
    }
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
