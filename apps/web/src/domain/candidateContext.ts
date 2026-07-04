export type CandidateProfile = {
  id: string;
  targetRoles: string;
  preferredStack: string;
  compensationExpectations: string;
  locationPreferences: string;
  workConstraints: string;
  companyPreferences: string;
  writingTone: string;
  positioningSummary: string;
  createdAt: string;
  updatedAt: string;
};

export type CandidateProfileCommand = Omit<
  CandidateProfile,
  "id" | "createdAt" | "updatedAt"
>;

export const memoryTypes = [
  "Approved fact",
  "Skill",
  "Weak area",
  "Preference",
  "Interview story",
  "Compensation",
  "Red flag",
  "Recruiter context",
  "Process lesson",
  "Other"
] as const;

export type MemoryType = (typeof memoryTypes)[number];

export type CandidateMemoryRecord = {
  id: string;
  memoryType: MemoryType;
  title: string;
  body: string;
  source: string;
  approved: boolean;
  sensitive: boolean;
  archivedAt: string | null;
  supersededBy: string | null;
  metadata: string;
  createdAt: string;
  updatedAt: string;
};

export type CandidateMemoryRecordCommand = {
  memoryType: MemoryType;
  title: string;
  body: string;
  source: string;
  approved: boolean;
  sensitive: boolean;
  metadata: string;
};

export type CandidateGroundingContext = {
  profile: CandidateProfile;
  memory: CandidateMemoryRecord[];
};

export type OwnerReference = {
  type: string;
  id: string;
};

export const artifactStatuses = [
  "Draft",
  "Approved",
  "Rejected",
  "Superseded"
] as const;

export type ArtifactStatus = (typeof artifactStatuses)[number];

export type ArtifactProvenance = {
  providerName: string | null;
  modelName: string | null;
  promptId: string | null;
  usageMetadata: string;
  rawProviderId: string | null;
};

export type AIArtifact = {
  id: string;
  artifactType: string;
  owner: OwnerReference;
  title: string;
  sourceInputs: string;
  modelContent: string;
  userEditedContent: string | null;
  currentContent: string;
  status: ArtifactStatus;
  sensitive: boolean;
  supersededBy: string | null;
  provenance: ArtifactProvenance;
  createdAt: string;
  updatedAt: string;
};

export type CreateAIArtifactCommand = {
  artifactType: string;
  ownerType: string;
  ownerId: string;
  title: string;
  sourceInputs: string;
  modelContent: string;
  userEditedContent: string | null;
  status: ArtifactStatus;
  sensitive: boolean;
  providerName: string | null;
  modelName: string | null;
  promptId: string | null;
  usageMetadata: string;
  rawProviderId: string | null;
};
