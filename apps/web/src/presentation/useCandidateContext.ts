import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  archiveCandidateMemoryRecord,
  createCandidateMemoryRecord,
  editAIArtifact,
  getCandidateProfile,
  listAIArtifacts,
  listCandidateMemoryRecords,
  supersedeCandidateMemoryRecord,
  updateAIArtifactStatus,
  updateCandidateMemoryRecord,
  updateCandidateProfile
} from "../application/candidateContext";
import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type {
  AIArtifact,
  ArtifactStatus,
  CandidateMemoryRecord,
  CandidateMemoryRecordCommand,
  CandidateProfileCommand,
  OwnerReference
} from "../domain/candidateContext";
import {
  candidateContextMutationKeys,
  candidateContextQueryKeys,
  replaceCachedCandidateProfile,
  upsertCachedAIArtifact,
  upsertCachedMemoryRecord
} from "../infrastructure/query/candidateContextQueries";
import type { CommandStatus } from "./useJobApplications";

const emptyMemoryRecords: CandidateMemoryRecord[] = [];
const emptyArtifacts: AIArtifact[] = [];

export const profileArtifactOwner: OwnerReference = {
  type: "CandidateProfile",
  id: "default"
};

export function useCandidateContext(gateway: CandidateContextGateway) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: candidateContextQueryKeys.profile(),
    queryFn: () => getCandidateProfile(stableGateway)
  });

  const memoryQuery = useQuery({
    queryKey: candidateContextQueryKeys.memory(),
    queryFn: () => listCandidateMemoryRecords(stableGateway)
  });

  const artifactsQuery = useQuery({
    queryKey: candidateContextQueryKeys.artifacts(profileArtifactOwner),
    queryFn: () => listAIArtifacts(stableGateway, profileArtifactOwner)
  });

  const updateProfileMutation = useMutation({
    mutationKey: candidateContextMutationKeys.updateProfile(),
    mutationFn: (command: CandidateProfileCommand) =>
      updateCandidateProfile(stableGateway, command),
    onSuccess: (profile) => replaceCachedCandidateProfile(queryClient, profile)
  });

  const createMemoryMutation = useMutation({
    mutationKey: candidateContextMutationKeys.createMemory(),
    mutationFn: (command: CandidateMemoryRecordCommand) =>
      createCandidateMemoryRecord(stableGateway, command),
    onSuccess: (record) => upsertCachedMemoryRecord(queryClient, record)
  });

  const updateMemoryMutation = useMutation({
    mutationKey: candidateContextMutationKeys.updateMemory(),
    mutationFn: ({
      id,
      command
    }: {
      id: string;
      command: CandidateMemoryRecordCommand;
    }) => updateCandidateMemoryRecord(stableGateway, id, command),
    onSuccess: (record) => upsertCachedMemoryRecord(queryClient, record)
  });

  const archiveMemoryMutation = useMutation({
    mutationKey: candidateContextMutationKeys.archiveMemory(),
    mutationFn: (id: string) => archiveCandidateMemoryRecord(stableGateway, id),
    onSuccess: (record) => upsertCachedMemoryRecord(queryClient, record)
  });

  const supersedeMemoryMutation = useMutation({
    mutationKey: candidateContextMutationKeys.supersedeMemory(),
    mutationFn: ({ id, supersededBy }: { id: string; supersededBy: string }) =>
      supersedeCandidateMemoryRecord(stableGateway, id, supersededBy),
    onSuccess: (record) => upsertCachedMemoryRecord(queryClient, record)
  });

  const editArtifactMutation = useMutation({
    mutationKey: candidateContextMutationKeys.editArtifact(),
    mutationFn: ({
      id,
      userEditedContent
    }: {
      id: string;
      userEditedContent: string | null;
    }) => editAIArtifact(stableGateway, id, userEditedContent),
    onSuccess: (artifact) => upsertCachedAIArtifact(queryClient, artifact)
  });

  const updateArtifactStatusMutation = useMutation({
    mutationKey: candidateContextMutationKeys.updateArtifactStatus(),
    mutationFn: ({ id, status }: { id: string; status: ArtifactStatus }) =>
      updateAIArtifactStatus(stableGateway, id, status),
    onSuccess: (artifact) => upsertCachedAIArtifact(queryClient, artifact)
  });

  return {
    artifacts: artifactsQuery.data ?? emptyArtifacts,
    archiveMemory: (id: string) => archiveMemoryMutation.mutateAsync(id),
    archiveMemoryStatus: archiveMemoryMutation.status as CommandStatus,
    createMemory: (command: CandidateMemoryRecordCommand) =>
      createMemoryMutation.mutateAsync(command),
    createMemoryStatus: createMemoryMutation.status as CommandStatus,
    editArtifact: (id: string, userEditedContent: string | null) =>
      editArtifactMutation.mutateAsync({ id, userEditedContent }),
    editArtifactStatus: editArtifactMutation.status as CommandStatus,
    isError:
      profileQuery.isError || memoryQuery.isError || artifactsQuery.isError,
    isLoading:
      profileQuery.isPending || memoryQuery.isPending || artifactsQuery.isPending,
    memoryRecords: memoryQuery.data ?? emptyMemoryRecords,
    profile: profileQuery.data ?? null,
    supersedeMemory: (id: string, supersededBy: string) =>
      supersedeMemoryMutation.mutateAsync({ id, supersededBy }),
    supersedeMemoryStatus: supersedeMemoryMutation.status as CommandStatus,
    updateArtifactStatus: (id: string, status: ArtifactStatus) =>
      updateArtifactStatusMutation.mutateAsync({ id, status }),
    updateArtifactStatusStatus:
      updateArtifactStatusMutation.status as CommandStatus,
    updateMemory: (id: string, command: CandidateMemoryRecordCommand) =>
      updateMemoryMutation.mutateAsync({ id, command }),
    updateMemoryStatus: updateMemoryMutation.status as CommandStatus,
    updateProfile: (command: CandidateProfileCommand) =>
      updateProfileMutation.mutateAsync(command),
    updateProfileStatus: updateProfileMutation.status as CommandStatus
  };
}
