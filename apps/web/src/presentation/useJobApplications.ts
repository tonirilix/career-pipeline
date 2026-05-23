import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  type AddNoteToApplicationResult,
  addNoteToApplication,
  advanceApplicationStage,
  type AdvanceApplicationStageResult,
  completeApplicationFollowUpReminder,
  type CompleteApplicationFollowUpReminderResult,
  createApplicationFollowUpReminder,
  type CreateApplicationFollowUpReminderResult,
  createSavedOpportunity,
  type CreateSavedOpportunityResult,
  listApplications,
  type ScheduleApplicationInterviewResult,
  scheduleApplicationInterview
} from "../application/jobApplications";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { ApplicationStage } from "../domain/applicationStage";
import type { AddApplicationNoteCommand } from "../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../domain/followUpReminder";
import type { ScheduleInterviewCommand } from "../domain/interviewScheduling";
import type {
  CreateSavedJobOpportunityCommand,
  JobApplication
} from "../domain/jobOpportunity";
import {
  addCachedJobApplication,
  jobApplicationMutationKeys,
  jobApplicationQueryKeys,
  replaceCachedJobApplication
} from "../infrastructure/query/jobApplicationQueries";
import { useInFlightIds } from "../infrastructure/query/useInFlightIds";

export type CommandStatus = "idle" | "pending" | "error" | "success";

export function useJobApplications(gateway: JobApplicationGateway) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: jobApplicationQueryKeys.list(),
    queryFn: () => listApplications(stableGateway)
  });

  const createOpportunityMutation = useMutation({
    mutationKey: jobApplicationMutationKeys.submitOpportunity(),
    mutationFn: (command: CreateSavedJobOpportunityCommand) =>
      createSavedOpportunity(stableGateway, command),
    onSuccess: (result: CreateSavedOpportunityResult) => {
      if (result.ok) {
        addCachedJobApplication(queryClient, result.opportunity);
      }
    }
  });

  const advanceStageMutation = useMutation({
    mutationKey: jobApplicationMutationKeys.advanceStage(),
    mutationFn: ({
      application,
      toStage
    }: {
      application: JobApplication;
      toStage: ApplicationStage;
    }) =>
      advanceApplicationStage(stableGateway, {
        applicationId: application.id,
        toStage
      }),
    onSuccess: (result: AdvanceApplicationStageResult) => {
      if (result.ok) {
        replaceCachedJobApplication(queryClient, result.application);
      }
    }
  });

  const scheduleInterviewMutation = useMutation({
    mutationKey: jobApplicationMutationKeys.scheduleInterview(),
    mutationFn: (command: ScheduleInterviewCommand) =>
      scheduleApplicationInterview(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  const createFollowUpMutation = useMutation({
    mutationKey: jobApplicationMutationKeys.createFollowUp(),
    mutationFn: (command: CreateFollowUpReminderCommand) =>
      createApplicationFollowUpReminder(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  const completeFollowUpMutation = useMutation({
    mutationKey: jobApplicationMutationKeys.completeFollowUp(),
    mutationFn: (command: CompleteFollowUpReminderCommand) =>
      completeApplicationFollowUpReminder(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  const addNoteMutation = useMutation({
    mutationKey: jobApplicationMutationKeys.addNote(),
    mutationFn: (command: AddApplicationNoteCommand) =>
      addNoteToApplication(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  function replaceApplicationFromResult(
    result:
      | ScheduleApplicationInterviewResult
      | CreateApplicationFollowUpReminderResult
      | CompleteApplicationFollowUpReminderResult
      | AddNoteToApplicationResult
  ) {
    if (result.ok) {
      replaceCachedJobApplication(queryClient, result.application);
    }
  }

  // Per-item in-flight IDs derived from the mutation cache — no local state
  const changingStageApplicationIds = useInFlightIds(
    jobApplicationMutationKeys.advanceStage(),
    (vars: { application: JobApplication }) => vars.application.id
  );

  const completingFollowUpReminderIds = useInFlightIds(
    jobApplicationMutationKeys.completeFollowUp(),
    (vars: { reminderId: string }) => vars.reminderId
  );

  return {
    applications: (applicationsQuery.data ?? []) as JobApplication[],
    isLoadingApplications: applicationsQuery.isPending,
    isLoadError: applicationsQuery.isError,
    // Per-item in-flight ID sets (list mutations — O(1) lookup per item)
    changingStageApplicationIds,
    completingFollowUpReminderIds,
    // Global status transitions (single-item contexts: details panel)
    submitOpportunityStatus: createOpportunityMutation.status as CommandStatus,
    scheduleInterviewStatus: scheduleInterviewMutation.status as CommandStatus,
    createFollowUpStatus: createFollowUpMutation.status as CommandStatus,
    addNoteStatus: addNoteMutation.status as CommandStatus,
    // Raw commands (cache updates baked in via onSuccess)
    submitOpportunityCommand: (command: CreateSavedJobOpportunityCommand) =>
      createOpportunityMutation.mutateAsync(command),
    changeStageCommand: (application: JobApplication, toStage: ApplicationStage) =>
      advanceStageMutation.mutateAsync({ application, toStage }),
    scheduleInterviewCommand: (command: ScheduleInterviewCommand) =>
      scheduleInterviewMutation.mutateAsync(command),
    createFollowUpCommand: (command: CreateFollowUpReminderCommand) =>
      createFollowUpMutation.mutateAsync(command),
    completeFollowUpCommand: (command: CompleteFollowUpReminderCommand) =>
      completeFollowUpMutation.mutateAsync(command),
    addNoteCommand: (command: AddApplicationNoteCommand) =>
      addNoteMutation.mutateAsync(command)
  };
}
