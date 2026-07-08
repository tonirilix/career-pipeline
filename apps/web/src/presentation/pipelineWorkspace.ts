import { type FormEvent, useMemo, useState } from "react";

import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { ApplicationStage } from "../domain/applicationStage";
import type { AddApplicationNoteCommand } from "../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../domain/followUpReminder";
import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  type JobApplication
} from "../domain/jobOpportunity";
import type {
  RecordInterviewOutcomeCommand,
  ScheduleInterviewCommand
} from "../domain/interviewScheduling";
import type { DetailsCommandError } from "./components/ApplicationDetails";
import { projectJobApplications } from "./jobApplicationProjections";
import {
  getPipelineSavedViewLabel,
  type PipelineSavedView
} from "./pipelineSavedViews";
import type { UsePipelineControls } from "./ports/pipelineControls";
import { useJobApplications } from "./useJobApplications";
export type { CommandStatus } from "./useJobApplications";

type BoardCommandError = {
  title: string;
  message: string;
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
  const jobApps = useJobApplications(gateway);

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [commandError, setCommandError] = useState<BoardCommandError | null>(null);
  const [formCommandError, setFormCommandError] = useState<string | null>(null);
  const [detailsCommandError, setDetailsCommandError] =
    useState<DetailsCommandError | null>(null);
  const [form, setForm] = useState<CreateSavedJobOpportunityCommand>(emptyForm);
  const [savedView, setSavedView] = useState<PipelineSavedView>("all");

  const controls = usePipelineControls();

  const { applications } = jobApps;

  const {
    activeApplicationCount,
    overdueFollowUpItems,
    selectedApplication,
    savedViewCounts,
    stageCounts,
    upcomingFollowUpItems,
    visibleApplications
  } = useMemo(
    () =>
      projectJobApplications({
        applications,
        controls,
        now: Date.now(),
        selectedApplicationId,
        savedView
      }),
    [
      applications,
      savedView,
      controls.searchTerm,
      controls.sortBy,
      controls.sourceFilter,
      controls.stageFilter,
      selectedApplicationId
    ]
  );

  async function submitOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors([]);
    setFormCommandError(null);

    try {
      const result = await jobApps.submitOpportunityCommand(form);

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

  function clearFilters() {
    controls.setSearchTerm("");
    controls.setStageFilter("All");
    controls.setSourceFilter("All");
    controls.setSortBy("created");
  }

  function clearOpportunityFormErrors() {
    setFieldErrors([]);
    setFormCommandError(null);
  }

  async function changeStage(application: JobApplication, toStage: ApplicationStage) {
    setCommandError(null);
    const result = await jobApps.changeStageCommand(application, toStage);
    if (!result.ok) {
      setCommandError({
        title: "Stage update failed",
        message: result.failure.message
      });
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
    const result = await jobApps.scheduleInterviewCommand(command);
    if (!result.ok) {
      setDetailsCommandError({
        workflow: "interview",
        message: result.failure.message
      });
      return false;
    }
    return true;
  }

  async function recordInterviewOutcome(command: RecordInterviewOutcomeCommand) {
    setDetailsCommandError(null);
    const result = await jobApps.recordInterviewOutcomeCommand(command);
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
    const result = await jobApps.createFollowUpCommand(command);
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
    const result = await jobApps.completeFollowUpCommand(command);
    if (!result.ok) {
      setCommandError({
        title: "Follow-up was not completed",
        message: result.failure.message
      });
    }
  }

  async function addNote(command: AddApplicationNoteCommand) {
    setDetailsCommandError(null);
    const result = await jobApps.addNoteCommand(command);
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
    addNoteStatus: jobApps.addNoteStatus,
    changeStage,
    changingStageApplicationIds: jobApps.changingStageApplicationIds,
    clearFilters,
    clearOpportunityFormErrors,
    closeDetails,
    commandError: commandError ?? loadCommandError(jobApps.isLoadError),
    completeFollowUp,
    completingFollowUpReminderIds: jobApps.completingFollowUpReminderIds,
    createFollowUp,
    createFollowUpStatus: jobApps.createFollowUpStatus,
    detailsCommandError,
    fieldErrors,
    form,
    formCommandError,
    isLoadingApplications: jobApps.isLoadingApplications,
    overdueFollowUpItems,
    recordInterviewOutcome,
    recordInterviewOutcomeStatus: jobApps.recordInterviewOutcomeStatus,
    scheduleInterview,
    scheduleInterviewStatus: jobApps.scheduleInterviewStatus,
    selectedApplication,
    selectedApplicationId,
    savedView,
    savedViewCounts,
    savedViewLabel: getPipelineSavedViewLabel(savedView),
    setSavedView,
    setForm,
    stageCounts,
    submitOpportunity,
    submitOpportunityStatus: jobApps.submitOpportunityStatus,
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
