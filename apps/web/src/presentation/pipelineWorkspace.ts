import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useMemo, useState } from "react";

import {
  type AddNoteToApplicationResult,
  addNoteToApplication,
  advanceApplicationStage,
  completeApplicationFollowUpReminder,
  type CompleteApplicationFollowUpReminderResult,
  createApplicationFollowUpReminder,
  type CreateApplicationFollowUpReminderResult,
  createSavedOpportunity,
  listApplications,
  type ScheduleApplicationInterviewResult,
  scheduleApplicationInterview
} from "../application/jobApplications";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import {
  applicationStages,
  type ApplicationStage
} from "../domain/applicationStage";
import type { AddApplicationNoteCommand } from "../domain/applicationNote";
import { isActiveApplication } from "../domain/closedWork";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../domain/followUpReminder";
import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  type FollowUpReminder,
  type JobApplication
} from "../domain/jobOpportunity";
import type { ScheduleInterviewCommand } from "../domain/interviewScheduling";
import type {
  PipelineSortOption,
  UsePipelineControls
} from "./ports/pipelineControls";
import type { DetailsCommandError } from "./components/ApplicationDetails";
import {
  addCachedJobApplication,
  jobApplicationQueryKeys,
  replaceCachedJobApplication
} from "../infrastructure/query/jobApplicationQueries";

type BoardCommandError = {
  title: string;
  message: string;
};

type FollowUpWorkItem = {
  application: JobApplication;
  followUp: FollowUpReminder;
};

const emptyForm: CreateSavedJobOpportunityCommand = {
  company: "",
  roleTitle: "",
  postingUrl: "",
  source: "LinkedIn",
  location: "",
  compensation: "",
  employmentType: "Full-time"
};

export function usePipelineWorkspace(
  gateway: JobApplicationGateway,
  usePipelineControls: UsePipelineControls
) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const queryClient = useQueryClient();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [commandError, setCommandError] = useState<BoardCommandError | null>(null);
  const [formCommandError, setFormCommandError] = useState<string | null>(null);
  const [detailsCommandError, setDetailsCommandError] =
    useState<DetailsCommandError | null>(null);
  const [form, setForm] = useState<CreateSavedJobOpportunityCommand>(emptyForm);

  const controls = usePipelineControls();

  const applicationsQuery = useQuery({
    queryKey: jobApplicationQueryKeys.list(),
    queryFn: () => listApplications(stableGateway)
  });
  const applications = applicationsQuery.data ?? [];

  const createOpportunityMutation = useMutation({
    mutationFn: (command: CreateSavedJobOpportunityCommand) =>
      createSavedOpportunity(stableGateway, command),
    onSuccess: (result) => {
      if (result.ok) {
        addCachedJobApplication(queryClient, result.opportunity);
      }
    }
  });

  const advanceStageMutation = useMutation({
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
    onSuccess: (result) => {
      if (result.ok) {
        replaceCachedJobApplication(queryClient, result.application);
      }
    }
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: (command: ScheduleInterviewCommand) =>
      scheduleApplicationInterview(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  const createFollowUpMutation = useMutation({
    mutationFn: (command: CreateFollowUpReminderCommand) =>
      createApplicationFollowUpReminder(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  const completeFollowUpMutation = useMutation({
    mutationFn: (command: CompleteFollowUpReminderCommand) =>
      completeApplicationFollowUpReminder(stableGateway, command),
    onSuccess: replaceApplicationFromResult
  });

  const addNoteMutation = useMutation({
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

  const activeApplicationCount = applications.filter(isActiveApplication).length;
  const stageCounts = useMemo(
    () =>
      applicationStages.map((stage) => ({
        stage,
        count: applications.filter((application) => application.stage === stage).length
      })),
    [applications]
  );

  const normalizedSearchTerm = controls.searchTerm.trim().toLowerCase();
  const visibleApplications = sortApplications(
    applications.filter(
      (application) =>
        (controls.stageFilter === "All" || application.stage === controls.stageFilter) &&
        (controls.sourceFilter === "All" || application.source === controls.sourceFilter) &&
        (!normalizedSearchTerm ||
          application.company.toLowerCase().includes(normalizedSearchTerm) ||
          application.roleTitle.toLowerCase().includes(normalizedSearchTerm))
    ),
    controls.sortBy
  );

  const selectedApplication = applications.find(
    (application) => application.id === selectedApplicationId
  );

  const activeFollowUpItems = applications
    .filter(isActiveApplication)
    .flatMap((application) =>
      application.followUps
        .filter((followUp) => !followUp.completedAt)
        .map((followUp) => ({ application, followUp }))
    )
    .sort(compareFollowUpItems);

  const now = Date.now();
  const overdueFollowUpItems = activeFollowUpItems.filter(
    ({ followUp }) => new Date(followUp.dueAt).getTime() < now
  );
  const upcomingFollowUpItems = activeFollowUpItems.filter(
    ({ followUp }) => new Date(followUp.dueAt).getTime() >= now
  );

  async function submitOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors([]);
    setFormCommandError(null);

    try {
      const result = await createOpportunityMutation.mutateAsync(form);

      if (!result.ok) {
        setFieldErrors(result.errors);
        return false;
      }

      setForm(emptyForm);
      return true;
    } catch {
      setFormCommandError("Could not save the opportunity. Try again.");
      return false;
    }
  }

  function clearOpportunityFormErrors() {
    setFieldErrors([]);
    setFormCommandError(null);
  }

  async function changeStage(application: JobApplication, toStage: ApplicationStage) {
    setCommandError(null);
    const result = await advanceStageMutation.mutateAsync({ application, toStage });
    if (!result.ok) {
      setCommandError({
        title: "Stage update failed",
        message: result.failure.message
      });
      return;
    }
  }

  function viewDetails(applicationId: string) {
    setDetailsCommandError(null);
    setSelectedApplicationId(applicationId);
  }

  function closeDetails() {
    setSelectedApplicationId(null);
    setDetailsCommandError(null);
  }

  async function scheduleInterview(command: ScheduleInterviewCommand) {
    setDetailsCommandError(null);
    const result = await scheduleInterviewMutation.mutateAsync(command);
    if (!result.ok) {
      setDetailsCommandError({
        workflow: "interview",
        message: result.failure.message
      });
      return false;
    }
    return true;
  }

  async function createFollowUp(command: CreateFollowUpReminderCommand) {
    setDetailsCommandError(null);
    const result = await createFollowUpMutation.mutateAsync(command);
    if (!result.ok) {
      setDetailsCommandError({
        workflow: "followUp",
        message: result.failure.message
      });
      return false;
    }
    return true;
  }

  async function completeFollowUp(command: CompleteFollowUpReminderCommand) {
    setCommandError(null);
    const result = await completeFollowUpMutation.mutateAsync(command);
    if (!result.ok) {
      setCommandError({
        title: "Follow-up was not completed",
        message: result.failure.message
      });
      return;
    }
  }

  async function addNote(command: AddApplicationNoteCommand) {
    setDetailsCommandError(null);
    const result = await addNoteMutation.mutateAsync(command);
    if (!result.ok) {
      setDetailsCommandError({
        workflow: "note",
        message: result.failure.message
      });
      return false;
    }
    return true;
  }

  return {
    ...controls,
    activeApplicationCount,
    addNote,
    changeStage,
    clearOpportunityFormErrors,
    closeDetails,
    commandError: commandError ?? loadCommandError(applicationsQuery.isError),
    completeFollowUp,
    createFollowUp,
    detailsCommandError,
    fieldErrors,
    form,
    formCommandError,
    isLoadingApplications: applicationsQuery.isPending,
    overdueFollowUpItems,
    scheduleInterview,
    selectedApplication,
    selectedApplicationId,
    setForm,
    stageCounts,
    submitOpportunity,
    upcomingFollowUpItems,
    viewDetails,
    visibleApplications
  };
}

function loadCommandError(isLoadError: boolean): BoardCommandError | null {
  if (!isLoadError) return null;

  return {
    title: "Applications could not load",
    message: "Refresh the page or try again in a moment."
  };
}

function compareFollowUpItems(left: FollowUpWorkItem, right: FollowUpWorkItem) {
  return new Date(left.followUp.dueAt).getTime() - new Date(right.followUp.dueAt).getTime();
}

function sortApplications(applications: JobApplication[], sortBy: PipelineSortOption) {
  if (sortBy === "created") return applications;

  return [...applications].sort((left, right) => {
    if (sortBy === "lastActivity") {
      return latestActivityTime(right) - latestActivityTime(left);
    }
    return earliestActiveFollowUpTime(left) - earliestActiveFollowUpTime(right);
  });
}

function latestActivityTime(application: JobApplication) {
  return Math.max(
    ...application.timeline.map((event) => dateTimeOrZero(event.occurredAt)),
    0
  );
}

function earliestActiveFollowUpTime(application: JobApplication) {
  const activeDueTimes = application.followUps
    .filter((followUp) => !followUp.completedAt)
    .map((followUp) => dateTimeOrInfinity(followUp.dueAt));

  if (activeDueTimes.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...activeDueTimes);
}

function dateTimeOrZero(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function dateTimeOrInfinity(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}
