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

export type ScheduleInterviewInput = {
  readonly applicationId: string;
  readonly notes: string;
  readonly scheduledAt: string;
  readonly type: string;
};

export type AddApplicationNoteMutationVariables = Exact<{
  input: AddApplicationNoteInput;
}>;


export type AddApplicationNoteMutation = { readonly addApplicationNote: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type AdvanceApplicationStageMutationVariables = Exact<{
  input: AdvanceApplicationStageInput;
}>;


export type AdvanceApplicationStageMutation = { readonly advanceApplicationStage: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type CompleteFollowUpReminderMutationVariables = Exact<{
  input: CompleteFollowUpReminderInput;
}>;


export type CompleteFollowUpReminderMutation = { readonly completeFollowUpReminder: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type CreateFollowUpReminderMutationVariables = Exact<{
  input: CreateFollowUpReminderInput;
}>;


export type CreateFollowUpReminderMutation = { readonly createFollowUpReminder: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type CreateSavedOpportunityMutationVariables = Exact<{
  input: CreateSavedOpportunityInput;
}>;


export type CreateSavedOpportunityMutation = { readonly createSavedOpportunity: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type JobApplicationFieldsFragment = { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> };

export type ListApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListApplicationsQuery = { readonly applications: ReadonlyArray<{ readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> }> };

export type RecordInterviewOutcomeMutationVariables = Exact<{
  input: RecordInterviewOutcomeInput;
}>;


export type RecordInterviewOutcomeMutation = { readonly recordInterviewOutcome: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };

export type ScheduleInterviewMutationVariables = Exact<{
  input: ScheduleInterviewInput;
}>;


export type ScheduleInterviewMutation = { readonly scheduleInterview: { readonly id: string, readonly company: string, readonly roleTitle: string, readonly postingUrl: string, readonly source: string, readonly location: string, readonly compensation: string, readonly employmentType: string, readonly stage: string, readonly timeline: ReadonlyArray<{ readonly id: string, readonly occurredAt: string, readonly description: string }>, readonly interviews: ReadonlyArray<{ readonly id: string, readonly type: string, readonly scheduledAt: string, readonly notes: string, readonly outcome: string }>, readonly followUps: ReadonlyArray<{ readonly id: string, readonly applicationId: string, readonly dueAt: string, readonly note: string, readonly completedAt: string | null }>, readonly notes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly createdAt: string }> } };
