import type { QueryClient } from "@tanstack/react-query";

import type { JobApplication } from "../../domain/jobOpportunity";

export const jobApplicationQueryKeys = {
  all: ["job-applications"] as const,
  list: () => [...jobApplicationQueryKeys.all, "list"] as const
};

export const jobApplicationMutationKeys = {
  advanceStage: () => ["job-applications", "advance-stage"] as const,
  completeFollowUp: () => ["job-applications", "complete-follow-up"] as const,
  submitOpportunity: () => ["job-applications", "submit-opportunity"] as const,
  scheduleInterview: () => ["job-applications", "schedule-interview"] as const,
  createFollowUp: () => ["job-applications", "create-follow-up"] as const,
  addNote: () => ["job-applications", "add-note"] as const
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
