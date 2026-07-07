/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AddApplicationNoteInput = {
  readonly applicationId: string;
  readonly body: string;
};

export type AdvanceApplicationStageInput = {
  readonly applicationId: string;
  readonly toStage: string;
};

export type CompleteFollowUpReminderInput = {
  readonly applicationId: string;
  readonly reminderId: string;
};

export type CreateAiArtifactInput = {
  readonly artifactType: string;
  readonly generatedContent: string;
  readonly modelName: string | null | undefined;
  readonly ownerId: string;
  readonly ownerType: string;
  readonly promptId: string | null | undefined;
  readonly providerName: string | null | undefined;
  readonly rawProviderId: string | null | undefined;
  readonly sensitive: boolean;
  readonly sourceInputs: string;
  readonly status: string;
  readonly title: string;
  readonly usageMetadata: string;
  readonly userEditedContent: string | null | undefined;
};

export type CreateCandidateMemoryRecordInput = {
  readonly approved: boolean;
  readonly body: string;
  readonly memoryType: string;
  readonly metadata: string;
  readonly sensitive: boolean;
  readonly source: string;
  readonly title: string;
};

export type CreateFollowUpReminderInput = {
  readonly applicationId: string;
  readonly dueAt: string;
  readonly note: string;
};

export type CreateSavedOpportunityInput = {
  readonly company: string;
  readonly compensation: string;
  readonly employmentType: string;
  readonly location: string;
  readonly postingUrl: string;
  readonly roleTitle: string;
  readonly source: string;
};

export type RecordInterviewOutcomeInput = {
  readonly applicationId: string;
  readonly interviewId: string;
  readonly outcome: string;
};

export type RoleRecordInput = {
  readonly company: string;
  readonly companyType: string;
  readonly compensation: string;
  readonly description: string;
  readonly employmentType: string;
  readonly freshnessStatus: string | null | undefined;
  readonly location: string;
  readonly metadata: string;
  readonly postingUrl: string;
  readonly providerSource: string | null | undefined;
  readonly rawSourceText: string | null | undefined;
  readonly remoteEligibility: string;
  readonly searchTopicId: string | null | undefined;
  readonly seniority: string;
  readonly source: string;
  readonly sourceKind: string | null | undefined;
  readonly stack: string;
  readonly title: string;
};

export type RoleRecordsFilterInput = {
  readonly decisionStatus: string | null | undefined;
  readonly freshnessStatus: string | null | undefined;
  readonly searchTerm: string | null | undefined;
  readonly sourceKind: string | null | undefined;
};

export type ScheduleInterviewInput = {
  readonly applicationId: string;
  readonly notes: string;
  readonly scheduledAt: string;
  readonly type: string;
};

export type UpdateCandidateMemoryRecordInput = {
  readonly approved: boolean;
  readonly body: string;
  readonly id: string;
  readonly memoryType: string;
  readonly metadata: string;
  readonly sensitive: boolean;
  readonly source: string;
  readonly title: string;
};

export type UpdateCandidateProfileInput = {
  readonly companyPreferences: string;
  readonly compensationExpectations: string;
  readonly locationPreferences: string;
  readonly positioningSummary: string;
  readonly preferredStack: string;
  readonly targetRoles: string;
  readonly workConstraints: string;
  readonly writingTone: string;
};

export type UpsertRoleSearchTopicInput = {
  readonly companyType: string;
  readonly compensation: string;
  readonly employmentType: string;
  readonly id: string | null | undefined;
  readonly location: string;
  readonly name: string;
  readonly notes: string;
  readonly preferredStack: string;
  readonly remotePreference: string;
  readonly seniority: string;
  readonly targetTitles: string;
};

export type AddApplicationNoteMutationVariables = Exact<{
  input: AddApplicationNoteInput;
}>;


export type AddApplicationNoteMutation = { readonly addApplicationNote: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type AdvanceApplicationStageMutationVariables = Exact<{
  input: AdvanceApplicationStageInput;
}>;


export type AdvanceApplicationStageMutation = { readonly advanceApplicationStage: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type AiArtifactFieldsFragment = { readonly id: string, readonly artifactType: string, readonly title: string, readonly sourceInputs: string, readonly generatedContent: string, readonly userEditedContent: string | null, readonly currentContent: string, readonly status: string, readonly sensitive: boolean, readonly supersededBy: string | null, readonly createdAt: string, readonly updatedAt: string, readonly owner: { readonly type: string, readonly id: string }, readonly provenance: { readonly providerName: string | null, readonly modelName: string | null, readonly promptId: string | null, readonly usageMetadata: string, readonly rawProviderId: string | null } };

export type ArchiveCandidateMemoryRecordMutationVariables = Exact<{
  id: string;
}>;


export type ArchiveCandidateMemoryRecordMutation = { readonly archiveCandidateMemoryRecord: { readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type CandidateMemoryRecordFieldsFragment = { readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string };

export type CandidateProfileFieldsFragment = { readonly id: string, readonly targetRoles: string, readonly preferredStack: string, readonly compensationExpectations: string, readonly locationPreferences: string, readonly workConstraints: string, readonly companyPreferences: string, readonly writingTone: string, readonly positioningSummary: string, readonly createdAt: string, readonly updatedAt: string };

export type CompleteFollowUpReminderMutationVariables = Exact<{
  input: CompleteFollowUpReminderInput;
}>;


export type CompleteFollowUpReminderMutation = { readonly completeFollowUpReminder: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type CreateAiArtifactMutationVariables = Exact<{
  input: CreateAiArtifactInput;
}>;


export type CreateAiArtifactMutation = { readonly createAIArtifact: { readonly id: string, readonly artifactType: string, readonly title: string, readonly sourceInputs: string, readonly generatedContent: string, readonly userEditedContent: string | null, readonly currentContent: string, readonly status: string, readonly sensitive: boolean, readonly supersededBy: string | null, readonly createdAt: string, readonly updatedAt: string, readonly owner: { readonly type: string, readonly id: string }, readonly provenance: { readonly providerName: string | null, readonly modelName: string | null, readonly promptId: string | null, readonly usageMetadata: string, readonly rawProviderId: string | null } } };

export type CreateCandidateMemoryRecordMutationVariables = Exact<{
  input: CreateCandidateMemoryRecordInput;
}>;


export type CreateCandidateMemoryRecordMutation = { readonly createCandidateMemoryRecord: { readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type CreateFollowUpReminderMutationVariables = Exact<{
  input: CreateFollowUpReminderInput;
}>;


export type CreateFollowUpReminderMutation = { readonly createFollowUpReminder: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type CreateRoleFromPasteMutationVariables = Exact<{
  input: RoleRecordInput;
}>;


export type CreateRoleFromPasteMutation = { readonly createRoleFromPaste: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type CreateRoleFromUrlMutationVariables = Exact<{
  input: RoleRecordInput;
}>;


export type CreateRoleFromUrlMutation = { readonly createRoleFromUrl: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type CreateRoleSearchTopicMutationVariables = Exact<{
  input: UpsertRoleSearchTopicInput;
}>;


export type CreateRoleSearchTopicMutation = { readonly createRoleSearchTopic: { readonly id: string, readonly name: string, readonly targetTitles: string, readonly preferredStack: string, readonly location: string, readonly remotePreference: string, readonly employmentType: string, readonly companyType: string, readonly compensation: string, readonly seniority: string, readonly notes: string, readonly createdAt: string, readonly updatedAt: string } };

export type CreateSavedOpportunityMutationVariables = Exact<{
  input: CreateSavedOpportunityInput;
}>;


export type CreateSavedOpportunityMutation = { readonly createSavedOpportunity: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type EditAiArtifactMutationVariables = Exact<{
  id: string;
  userEditedContent: string | null | undefined;
}>;


export type EditAiArtifactMutation = { readonly editAIArtifact: { readonly id: string, readonly artifactType: string, readonly title: string, readonly sourceInputs: string, readonly generatedContent: string, readonly userEditedContent: string | null, readonly currentContent: string, readonly status: string, readonly sensitive: boolean, readonly supersededBy: string | null, readonly createdAt: string, readonly updatedAt: string, readonly owner: { readonly type: string, readonly id: string }, readonly provenance: { readonly providerName: string | null, readonly modelName: string | null, readonly promptId: string | null, readonly usageMetadata: string, readonly rawProviderId: string | null } } };

export type GetCandidateGroundingContextQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCandidateGroundingContextQuery = { readonly candidateGroundingContext: { readonly profile: { readonly id: string, readonly targetRoles: string, readonly preferredStack: string, readonly compensationExpectations: string, readonly locationPreferences: string, readonly workConstraints: string, readonly companyPreferences: string, readonly writingTone: string, readonly positioningSummary: string, readonly createdAt: string, readonly updatedAt: string }, readonly memory: ReadonlyArray<{ readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string }> } };

export type GetCandidateProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCandidateProfileQuery = { readonly candidateProfile: { readonly id: string, readonly targetRoles: string, readonly preferredStack: string, readonly compensationExpectations: string, readonly locationPreferences: string, readonly workConstraints: string, readonly companyPreferences: string, readonly writingTone: string, readonly positioningSummary: string, readonly createdAt: string, readonly updatedAt: string } };

export type GetRoleRecordQueryVariables = Exact<{
  id: string;
}>;


export type GetRoleRecordQuery = { readonly roleRecord: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type JobApplicationFieldsFragment = { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> };

export type ListAiArtifactsQueryVariables = Exact<{
  ownerType: string;
  ownerId: string;
}>;


export type ListAiArtifactsQuery = { readonly aiArtifacts: ReadonlyArray<{ readonly id: string, readonly artifactType: string, readonly title: string, readonly sourceInputs: string, readonly generatedContent: string, readonly userEditedContent: string | null, readonly currentContent: string, readonly status: string, readonly sensitive: boolean, readonly supersededBy: string | null, readonly createdAt: string, readonly updatedAt: string, readonly owner: { readonly type: string, readonly id: string }, readonly provenance: { readonly providerName: string | null, readonly modelName: string | null, readonly promptId: string | null, readonly usageMetadata: string, readonly rawProviderId: string | null } }> };

export type ListApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListApplicationsQuery = { readonly applications: ReadonlyArray<{ readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> }> };

export type ListCandidateMemoryRecordsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListCandidateMemoryRecordsQuery = { readonly candidateMemoryRecords: ReadonlyArray<{ readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string }> };

export type ListRoleRecordsQueryVariables = Exact<{
  filter: RoleRecordsFilterInput | null | undefined;
}>;


export type ListRoleRecordsQuery = { readonly roleRecords: ReadonlyArray<{ readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string }> };

export type ListRoleSearchTopicsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListRoleSearchTopicsQuery = { readonly roleSearchTopics: ReadonlyArray<{ readonly id: string, readonly name: string, readonly targetTitles: string, readonly preferredStack: string, readonly location: string, readonly remotePreference: string, readonly employmentType: string, readonly companyType: string, readonly compensation: string, readonly seniority: string, readonly notes: string, readonly createdAt: string, readonly updatedAt: string }> };

export type PromoteRoleMutationVariables = Exact<{
  id: string;
}>;


export type PromoteRoleMutation = { readonly promoteRole: { readonly role: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string }, readonly application: { readonly id: string } } };

export type RecordInterviewOutcomeMutationVariables = Exact<{
  input: RecordInterviewOutcomeInput;
}>;


export type RecordInterviewOutcomeMutation = { readonly recordInterviewOutcome: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type RoleRecordFieldsFragment = { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string };

export type RoleSearchTopicFieldsFragment = { readonly id: string, readonly name: string, readonly targetTitles: string, readonly preferredStack: string, readonly location: string, readonly remotePreference: string, readonly employmentType: string, readonly companyType: string, readonly compensation: string, readonly seniority: string, readonly notes: string, readonly createdAt: string, readonly updatedAt: string };

export type RunRoleSearchMutationVariables = Exact<{
  topicId: string;
  maxRoles: number | null | undefined;
}>;


export type RunRoleSearchMutation = { readonly runRoleSearch: { readonly topicId: string, readonly importedCount: number, readonly skippedCount: number, readonly imported: ReadonlyArray<{ readonly roleId: string, readonly company: string, readonly title: string, readonly postingUrl: string }>, readonly skipped: ReadonlyArray<{ readonly company: string, readonly title: string, readonly postingUrl: string, readonly reason: string }> } };

export type ScheduleInterviewMutationVariables = Exact<{
  input: ScheduleInterviewInput;
}>;


export type ScheduleInterviewMutation = { readonly scheduleInterview: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type SupersedeAiArtifactMutationVariables = Exact<{
  id: string;
  supersededBy: string;
}>;


export type SupersedeAiArtifactMutation = { readonly supersedeAIArtifact: { readonly id: string, readonly artifactType: string, readonly title: string, readonly sourceInputs: string, readonly generatedContent: string, readonly userEditedContent: string | null, readonly currentContent: string, readonly status: string, readonly sensitive: boolean, readonly supersededBy: string | null, readonly createdAt: string, readonly updatedAt: string, readonly owner: { readonly type: string, readonly id: string }, readonly provenance: { readonly providerName: string | null, readonly modelName: string | null, readonly promptId: string | null, readonly usageMetadata: string, readonly rawProviderId: string | null } } };

export type SupersedeCandidateMemoryRecordMutationVariables = Exact<{
  id: string;
  supersededBy: string;
}>;


export type SupersedeCandidateMemoryRecordMutation = { readonly supersedeCandidateMemoryRecord: { readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type UpdateAiArtifactStatusMutationVariables = Exact<{
  id: string;
  status: string;
}>;


export type UpdateAiArtifactStatusMutation = { readonly updateAIArtifactStatus: { readonly id: string, readonly artifactType: string, readonly title: string, readonly sourceInputs: string, readonly generatedContent: string, readonly userEditedContent: string | null, readonly currentContent: string, readonly status: string, readonly sensitive: boolean, readonly supersededBy: string | null, readonly createdAt: string, readonly updatedAt: string, readonly owner: { readonly type: string, readonly id: string }, readonly provenance: { readonly providerName: string | null, readonly modelName: string | null, readonly promptId: string | null, readonly usageMetadata: string, readonly rawProviderId: string | null } } };

export type UpdateCandidateMemoryRecordMutationVariables = Exact<{
  input: UpdateCandidateMemoryRecordInput;
}>;


export type UpdateCandidateMemoryRecordMutation = { readonly updateCandidateMemoryRecord: { readonly id: string, readonly memoryType: string, readonly title: string, readonly body: string, readonly source: string, readonly approved: boolean, readonly sensitive: boolean, readonly archivedAt: string | null, readonly supersededBy: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type UpdateCandidateProfileMutationVariables = Exact<{
  input: UpdateCandidateProfileInput;
}>;


export type UpdateCandidateProfileMutation = { readonly updateCandidateProfile: { readonly id: string, readonly targetRoles: string, readonly preferredStack: string, readonly compensationExpectations: string, readonly locationPreferences: string, readonly workConstraints: string, readonly companyPreferences: string, readonly writingTone: string, readonly positioningSummary: string, readonly createdAt: string, readonly updatedAt: string } };

export type UpdateRoleDecisionMutationVariables = Exact<{
  id: string;
  status: string;
  rejectionReason: string | null | undefined;
}>;


export type UpdateRoleDecisionMutation = { readonly updateRoleDecision: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type UpdateRoleFreshnessMutationVariables = Exact<{
  id: string;
  status: string;
  checkedAt: string | null | undefined;
}>;


export type UpdateRoleFreshnessMutation = { readonly updateRoleFreshness: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type UpdateRoleRecordMutationVariables = Exact<{
  id: string;
  input: RoleRecordInput;
}>;


export type UpdateRoleRecordMutation = { readonly updateRoleRecord: { readonly id: string, readonly searchTopicId: string | null, readonly company: string, readonly title: string, readonly postingUrl: string, readonly source: string, readonly sourceKind: string, readonly providerSource: string, readonly description: string, readonly rawSourceText: string, readonly location: string, readonly remoteEligibility: string, readonly employmentType: string, readonly seniority: string, readonly compensation: string, readonly stack: string, readonly companyType: string, readonly freshnessStatus: string, readonly freshnessCheckedAt: string | null, readonly decisionStatus: string, readonly rejectionReason: string, readonly promotedApplicationId: string | null, readonly metadata: string, readonly createdAt: string, readonly updatedAt: string } };

export type UpdateRoleSearchTopicMutationVariables = Exact<{
  input: UpsertRoleSearchTopicInput;
}>;


export type UpdateRoleSearchTopicMutation = { readonly updateRoleSearchTopic: { readonly id: string, readonly name: string, readonly targetTitles: string, readonly preferredStack: string, readonly location: string, readonly remotePreference: string, readonly employmentType: string, readonly companyType: string, readonly compensation: string, readonly seniority: string, readonly notes: string, readonly createdAt: string, readonly updatedAt: string } };
