import type { JobApplicationGateway } from "../../application/ports/jobApplicationGateway";
import type {
  CreateSavedJobOpportunityCommand,
  SavedJobOpportunity
} from "../../domain/jobOpportunity";

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

const listSavedOpportunitiesQuery = `
  query ListSavedOpportunities {
    savedOpportunities {
      id
      company
      roleTitle
      postingUrl
      source
      location
      compensation
      employmentType
      stage
    }
  }
`;

const createSavedOpportunityMutation = `
  mutation CreateSavedOpportunity($input: CreateSavedOpportunityInput!) {
    createSavedOpportunity(input: $input) {
      id
      company
      roleTitle
      postingUrl
      source
      location
      compensation
      employmentType
      stage
    }
  }
`;

export function createJobApplicationGraphqlGateway(
  endpoint = graphqlEndpoint()
): JobApplicationGateway {
  return {
    async listSavedOpportunities() {
      const response = await requestGraphql<{
        savedOpportunities: SavedJobOpportunity[];
      }>(endpoint, {
        query: listSavedOpportunitiesQuery,
        operationName: "ListSavedOpportunities"
      });

      return response.savedOpportunities;
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
