import type {
  ArtifactStatus,
  CandidateMemoryRecord,
  CandidateMemoryRecordCommand,
  CandidateProfile,
  CandidateProfileCommand
} from "../../domain/candidateContext";

type GraphqlAIArtifact = {
  id: string;
  artifactType: string;
  owner: {
    type: string;
    id: string;
  };
  title: string;
  sourceInputs: string;
  generatedContent: string;
  userEditedContent: string | null;
  currentContent: string;
  status: ArtifactStatus;
  sensitive: boolean;
  supersededBy: string | null;
  provenance: {
    providerName: string | null;
    modelName: string | null;
    promptId: string | null;
    usageMetadata: string;
    rawProviderId: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export class CandidateContextMockBackend {
  private profile = this.defaultProfile();
  private memoryRecords: CandidateMemoryRecord[] = [];
  private artifacts: GraphqlAIArtifact[] = [];
  private nextMemoryId = 1;
  private nextArtifactId = 1;

  getCandidateProfile() {
    return this.profile;
  }

  updateCandidateProfile(command: CandidateProfileCommand) {
    this.profile = {
      ...this.profile,
      ...command,
      updatedAt: this.now()
    };
    return this.profile;
  }

  listCandidateMemoryRecords() {
    return this.memoryRecords;
  }

  createCandidateMemoryRecord(command: CandidateMemoryRecordCommand) {
    const record: CandidateMemoryRecord = {
      id: `memory-${this.nextMemoryId}`,
      ...command,
      archivedAt: null,
      supersededBy: null,
      createdAt: this.now(),
      updatedAt: this.now()
    };
    this.nextMemoryId += 1;
    this.memoryRecords = [record, ...this.memoryRecords];
    return record;
  }

  updateCandidateMemoryRecord(command: CandidateMemoryRecordCommand & { id: string }) {
    const record = {
      ...this.findMemory(command.id),
      ...command,
      updatedAt: this.now()
    };
    this.replaceMemory(record);
    return record;
  }

  archiveCandidateMemoryRecord(id: string) {
    const record = {
      ...this.findMemory(id),
      archivedAt: this.now(),
      updatedAt: this.now()
    };
    this.replaceMemory(record);
    return record;
  }

  supersedeCandidateMemoryRecord(id: string, supersededBy: string) {
    const record = {
      ...this.findMemory(id),
      supersededBy,
      updatedAt: this.now()
    };
    this.replaceMemory(record);
    return record;
  }

  getCandidateGroundingContext() {
    return {
      profile: this.profile,
      memory: this.memoryRecords.filter(
        (record) => record.approved && !record.archivedAt && !record.supersededBy
      )
    };
  }

  listAIArtifacts(ownerType: string, ownerId: string) {
    return this.artifacts.filter(
      (artifact) => artifact.owner.type === ownerType && artifact.owner.id === ownerId
    );
  }

  createAIArtifact(input: Omit<GraphqlAIArtifact, "id" | "owner" | "currentContent" | "provenance" | "supersededBy" | "createdAt" | "updatedAt"> & {
    ownerType: string;
    ownerId: string;
    providerName: string | null;
    modelName: string | null;
    promptId: string | null;
    usageMetadata: string;
    rawProviderId: string | null;
  }) {
    const artifact: GraphqlAIArtifact = {
      id: `artifact-${this.nextArtifactId}`,
      artifactType: input.artifactType,
      owner: { type: input.ownerType, id: input.ownerId },
      title: input.title,
      sourceInputs: input.sourceInputs,
      generatedContent: input.generatedContent,
      userEditedContent: input.userEditedContent,
      currentContent: input.userEditedContent ?? input.generatedContent,
      status: input.status,
      sensitive: input.sensitive,
      supersededBy: null,
      provenance: {
        providerName: input.providerName,
        modelName: input.modelName,
        promptId: input.promptId,
        usageMetadata: input.usageMetadata,
        rawProviderId: input.rawProviderId
      },
      createdAt: this.now(),
      updatedAt: this.now()
    };
    this.nextArtifactId += 1;
    this.artifacts = [artifact, ...this.artifacts];
    return artifact;
  }

  editAIArtifact(id: string, userEditedContent: string | null) {
    const artifact = this.findArtifact(id);
    const edited = {
      ...artifact,
      userEditedContent,
      currentContent: userEditedContent ?? artifact.generatedContent,
      updatedAt: this.now()
    };
    this.replaceArtifact(edited);
    return edited;
  }

  updateAIArtifactStatus(id: string, status: ArtifactStatus) {
    const artifact = {
      ...this.findArtifact(id),
      status,
      updatedAt: this.now()
    };
    this.replaceArtifact(artifact);
    return artifact;
  }

  supersedeAIArtifact(id: string, supersededBy: string) {
    const artifact = {
      ...this.findArtifact(id),
      status: "Superseded" as ArtifactStatus,
      supersededBy,
      updatedAt: this.now()
    };
    this.replaceArtifact(artifact);
    return artifact;
  }

  reset() {
    this.profile = this.defaultProfile();
    this.memoryRecords = [];
    this.artifacts = [];
    this.nextMemoryId = 1;
    this.nextArtifactId = 1;
  }

  private defaultProfile(): CandidateProfile {
    return {
      id: "default",
      targetRoles: "",
      preferredStack: "",
      compensationExpectations: "",
      locationPreferences: "",
      workConstraints: "",
      companyPreferences: "",
      writingTone: "",
      positioningSummary: "",
      createdAt: this.now(),
      updatedAt: this.now()
    };
  }

  private findMemory(id: string) {
    const record = this.memoryRecords.find((candidate) => candidate.id === id);
    if (!record) throw new Error("Memory record could not be found.");
    return record;
  }

  private replaceMemory(record: CandidateMemoryRecord) {
    this.memoryRecords = this.memoryRecords.map((candidate) =>
      candidate.id === record.id ? record : candidate
    );
  }

  private findArtifact(id: string) {
    const artifact = this.artifacts.find((candidate) => candidate.id === id);
    if (!artifact) throw new Error("AI artifact could not be found.");
    return artifact;
  }

  private replaceArtifact(artifact: GraphqlAIArtifact) {
    this.artifacts = this.artifacts.map((candidate) =>
      candidate.id === artifact.id ? artifact : candidate
    );
  }

  private now() {
    return new Date().toISOString();
  }
}

export const candidateContextMockBackend = new CandidateContextMockBackend();
