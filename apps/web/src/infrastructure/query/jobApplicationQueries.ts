import type { QueryClient } from "@tanstack/react-query";

import type { JobApplication } from "../../domain/jobOpportunity";

export const jobApplicationQueryKeys = {
  all: ["job-applications"] as const,
  list: () => [...jobApplicationQueryKeys.all, "list"] as const
};

export function replaceCachedJobApplication(
  queryClient: QueryClient,
  application: JobApplication
) {
  queryClient.setQueryData<JobApplication[]>(
    jobApplicationQueryKeys.list(),
    (current = []) =>
      current.map((candidate) =>
        candidate.id === application.id ? application : candidate
      )
  );
}

export function addCachedJobApplication(
  queryClient: QueryClient,
  application: JobApplication
) {
  queryClient.setQueryData<JobApplication[]>(
    jobApplicationQueryKeys.list(),
    (current = []) => [...current, application]
  );
}
