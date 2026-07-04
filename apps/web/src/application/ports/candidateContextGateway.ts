import type {
  AIArtifact,
  ArtifactStatus,
  CandidateGroundingContext,
  CandidateMemoryRecord,
  CandidateMemoryRecordCommand,
  CandidateProfile,
  CandidateProfileCommand,
  CreateAIArtifactCommand,
  OwnerReference
} from "../../domain/candidateContext";

export type CandidateContextGateway = {
  getCandidateProfile(): Promise<CandidateProfile>;
  updateCandidateProfile(command: CandidateProfileCommand): Promise<CandidateProfile>;
  listCandidateMemoryRecords(): Promise<CandidateMemoryRecord[]>;
  createCandidateMemoryRecord(
    command: CandidateMemoryRecordCommand
  ): Promise<CandidateMemoryRecord>;
  updateCandidateMemoryRecord(
    id: string,
    command: CandidateMemoryRecordCommand
  ): Promise<CandidateMemoryRecord>;
  archiveCandidateMemoryRecord(id: string): Promise<CandidateMemoryRecord>;
  supersedeCandidateMemoryRecord(
    id: string,
    supersededBy: string
  ): Promise<CandidateMemoryRecord>;
  getCandidateGroundingContext(): Promise<CandidateGroundingContext>;
  listAIArtifacts(owner: OwnerReference): Promise<AIArtifact[]>;
  createAIArtifact(command: CreateAIArtifactCommand): Promise<AIArtifact>;
  editAIArtifact(id: string, userEditedContent: string | null): Promise<AIArtifact>;
  updateAIArtifactStatus(id: string, status: ArtifactStatus): Promise<AIArtifact>;
  supersedeAIArtifact(id: string, supersededBy: string): Promise<AIArtifact>;
};
