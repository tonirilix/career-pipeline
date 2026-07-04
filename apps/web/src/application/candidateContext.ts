import type {
  ArtifactStatus,
  CandidateMemoryRecordCommand,
  CandidateProfileCommand,
  CreateAIArtifactCommand,
  OwnerReference
} from "../domain/candidateContext";
import type { CandidateContextGateway } from "./ports/candidateContextGateway";

export function getCandidateProfile(gateway: CandidateContextGateway) {
  return gateway.getCandidateProfile();
}

export function updateCandidateProfile(
  gateway: CandidateContextGateway,
  command: CandidateProfileCommand
) {
  return gateway.updateCandidateProfile(command);
}

export function listCandidateMemoryRecords(gateway: CandidateContextGateway) {
  return gateway.listCandidateMemoryRecords();
}

export function createCandidateMemoryRecord(
  gateway: CandidateContextGateway,
  command: CandidateMemoryRecordCommand
) {
  return gateway.createCandidateMemoryRecord(withDefaultMetadata(command));
}

export function updateCandidateMemoryRecord(
  gateway: CandidateContextGateway,
  id: string,
  command: CandidateMemoryRecordCommand
) {
  return gateway.updateCandidateMemoryRecord(id, withDefaultMetadata(command));
}

export function archiveCandidateMemoryRecord(
  gateway: CandidateContextGateway,
  id: string
) {
  return gateway.archiveCandidateMemoryRecord(id);
}

export function supersedeCandidateMemoryRecord(
  gateway: CandidateContextGateway,
  id: string,
  supersededBy: string
) {
  return gateway.supersedeCandidateMemoryRecord(id, supersededBy);
}

export function getCandidateGroundingContext(gateway: CandidateContextGateway) {
  return gateway.getCandidateGroundingContext();
}

export function listAIArtifacts(
  gateway: CandidateContextGateway,
  owner: OwnerReference
) {
  return gateway.listAIArtifacts(owner);
}

export function createAIArtifact(
  gateway: CandidateContextGateway,
  command: CreateAIArtifactCommand
) {
  return gateway.createAIArtifact(command);
}

export function editAIArtifact(
  gateway: CandidateContextGateway,
  id: string,
  userEditedContent: string | null
) {
  return gateway.editAIArtifact(id, userEditedContent);
}

export function updateAIArtifactStatus(
  gateway: CandidateContextGateway,
  id: string,
  status: ArtifactStatus
) {
  return gateway.updateAIArtifactStatus(id, status);
}

export function supersedeAIArtifact(
  gateway: CandidateContextGateway,
  id: string,
  supersededBy: string
) {
  return gateway.supersedeAIArtifact(id, supersededBy);
}

function withDefaultMetadata(command: CandidateMemoryRecordCommand) {
  return {
    ...command,
    metadata: command.metadata.trim() || "{}"
  };
}
