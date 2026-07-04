export type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

export async function requestGraphql<TData>(
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

export function graphqlEndpoint() {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    return apiUrl.replace(/\/$/, "") + "/graphql";
  }
  return "http://localhost:8080/graphql";
}
