import type { QueryClient } from "@tanstack/react-query";

import type {
  AIArtifact,
  CandidateMemoryRecord,
  CandidateProfile,
  OwnerReference
} from "../../domain/candidateContext";

export const candidateContextQueryKeys = {
  all: ["candidate-context"] as const,
  profile: () => [...candidateContextQueryKeys.all, "profile"] as const,
  memory: () => [...candidateContextQueryKeys.all, "memory"] as const,
  grounding: () => [...candidateContextQueryKeys.all, "grounding"] as const,
  artifacts: (owner: OwnerReference) =>
    [...candidateContextQueryKeys.all, "artifacts", owner.type, owner.id] as const
};

export const candidateContextMutationKeys = {
  updateProfile: () => ["candidate-context", "update-profile"] as const,
  createMemory: () => ["candidate-context", "create-memory"] as const,
  updateMemory: () => ["candidate-context", "update-memory"] as const,
  archiveMemory: () => ["candidate-context", "archive-memory"] as const,
  supersedeMemory: () => ["candidate-context", "supersede-memory"] as const,
  createArtifact: () => ["candidate-context", "create-artifact"] as const,
  editArtifact: () => ["candidate-context", "edit-artifact"] as const,
  updateArtifactStatus: () =>
    ["candidate-context", "update-artifact-status"] as const,
  supersedeArtifact: () => ["candidate-context", "supersede-artifact"] as const
};

export function replaceCachedCandidateProfile(
  queryClient: QueryClient,
  profile: CandidateProfile
) {
  queryClient.setQueryData(candidateContextQueryKeys.profile(), profile);
}

export function upsertCachedMemoryRecord(
  queryClient: QueryClient,
  record: CandidateMemoryRecord
) {
  queryClient.setQueryData<CandidateMemoryRecord[]>(
    candidateContextQueryKeys.memory(),
    (current = []) => upsertById(current, record)
  );
  void queryClient.invalidateQueries({
    queryKey: candidateContextQueryKeys.grounding()
  });
}

export function upsertCachedAIArtifact(
  queryClient: QueryClient,
  artifact: AIArtifact
) {
  queryClient.setQueryData<AIArtifact[]>(
    candidateContextQueryKeys.artifacts(artifact.owner),
    (current = []) => upsertById(current, artifact)
  );
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  return items.some((candidate) => candidate.id === item.id)
    ? items.map((candidate) => (candidate.id === item.id ? item : candidate))
    : [item, ...items];
}
