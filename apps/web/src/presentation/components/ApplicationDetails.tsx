import { useState } from "react";

import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import { isClosedApplication } from "../../domain/closedWork";
import type { CreateFollowUpReminderCommand } from "../../domain/followUpReminder";
import type {
  RecordInterviewOutcomeCommand,
  ScheduleInterviewCommand
} from "../../domain/interviewScheduling";
import type { JobApplication } from "../../domain/jobOpportunity";
import type { CommandStatus } from "../pipelineWorkspace";
import {
  detailsActionState,
  followUpState,
  outcomeState,
  scheduleState
} from "./application-details/actionStates";
import { ApplicationSummary } from "./application-details/ApplicationSummary";
import {
  compareFollowUps,
  compareInterviews,
  compareNotes,
  compareTimelineEvents
} from "./application-details/dateHelpers";
import { FollowUpsSection, useFollowUpWorkflow } from "./application-details/FollowUpsSection";
import { InterviewsSection, useInterviewWorkflow } from "./application-details/InterviewsSection";
import { NotesSection, useNoteWorkflow } from "./application-details/NotesSection";
import { OverviewSection } from "./application-details/OverviewSection";
import { SectionButton } from "./application-details/primitives";
import { TimelineSection } from "./application-details/TimelineSection";
import type {
  DetailsAction,
  DetailsCommandError,
  DetailsSection
} from "./application-details/types";

export type { DetailsCommandError } from "./application-details/types";

type ApplicationDetailsProps = {
  application: JobApplication;
  commandError: DetailsCommandError | null;
  addNoteStatus: CommandStatus;
  createFollowUpStatus: CommandStatus;
  scheduleInterviewStatus: CommandStatus;
  recordInterviewOutcomeStatus: CommandStatus;
  onAddNote: (command: AddApplicationNoteCommand) => Promise<boolean>;
  onCreateFollowUp: (command: CreateFollowUpReminderCommand) => Promise<boolean>;
  onScheduleInterview: (command: ScheduleInterviewCommand) => Promise<boolean>;
  onRecordInterviewOutcome: (
    command: RecordInterviewOutcomeCommand
  ) => Promise<boolean>;
};

export function ApplicationDetails({
  application,
  commandError,
  addNoteStatus,
  createFollowUpStatus,
  scheduleInterviewStatus,
  recordInterviewOutcomeStatus,
  onAddNote,
  onCreateFollowUp,
  onScheduleInterview,
  onRecordInterviewOutcome
}: ApplicationDetailsProps) {
  const timeline = [...application.timeline].sort(compareTimelineEvents);
  const notes = [...application.notes].sort(compareNotes);
  const interviews = [...application.interviews].sort(compareInterviews);
  const followUps = [...application.followUps].sort(compareFollowUps);
  const isClosed = isClosedApplication(application);

  const [activeSection, setActiveSection] = useState<DetailsSection>("overview");
  const [activeAction, setActiveAction] = useState<DetailsAction>(null);

  const noteWorkflow = useNoteWorkflow({
    applicationId: application.id,
    onAddNote,
    onComplete: () => setActiveAction(null)
  });
  const followUpWorkflow = useFollowUpWorkflow({
    applicationId: application.id,
    onCreateFollowUp,
    onComplete: () => setActiveAction(null)
  });
  const interviewWorkflow = useInterviewWorkflow({
    applicationId: application.id,
    onRecordInterviewOutcome,
    onScheduleInterview,
    onComplete: () => setActiveAction(null)
  });

  function clearLocalErrors() {
    noteWorkflow.clearLocalError();
    followUpWorkflow.clearLocalError();
    interviewWorkflow.clearLocalError();
  }

  function showSection(section: DetailsSection) {
    setActiveSection(section);
    setActiveAction(null);
    clearLocalErrors();
  }

  function startAction(action: DetailsAction) {
    setActiveAction(action);
    clearLocalErrors();
  }

  function workflowError(
    workflow: DetailsCommandError["workflow"],
    localError: DetailsCommandError | null = null
  ) {
    if (localError?.workflow === workflow) return localError;
    if (commandError?.workflow === workflow) return commandError;
    return null;
  }

  const noteActionState = detailsActionState(
    activeAction === "note",
    addNoteStatus
  );
  const followUpActionState = followUpState({
    isClosed,
    isActive: activeAction === "followUp",
    status: createFollowUpStatus
  });
  const scheduleInterviewState = scheduleState({
    application,
    isClosed,
    isActive: activeAction === "interview",
    status: scheduleInterviewStatus
  });
  const outcomeRecordingState = outcomeState({
    interviewId: interviewWorkflow.outcomeForm.interviewId,
    isActive: activeAction === "outcome",
    status: recordInterviewOutcomeStatus
  });

  return (
    <aside aria-label="Application details">
      <ApplicationSummary application={application} />

      <nav
        aria-label="Application details sections"
        className="grid grid-cols-5 border-b border-border"
      >
        <SectionButton active={activeSection === "overview"} onClick={() => showSection("overview")}>
          Overview
        </SectionButton>
        <SectionButton active={activeSection === "notes"} onClick={() => showSection("notes")}>
          Notes <span aria-label={`${notes.length} notes`}>{notes.length}</span>
        </SectionButton>
        <SectionButton active={activeSection === "followUps"} onClick={() => showSection("followUps")}>
          Follow-ups <span aria-label={`${followUps.length} follow-ups`}>{followUps.length}</span>
        </SectionButton>
        <SectionButton active={activeSection === "interviews"} onClick={() => showSection("interviews")}>
          Interviews <span aria-label={`${interviews.length} interviews`}>{interviews.length}</span>
        </SectionButton>
        <SectionButton active={activeSection === "timeline"} onClick={() => showSection("timeline")}>
          Timeline <span aria-label={`${timeline.length} timeline events`}>{timeline.length}</span>
        </SectionButton>
      </nav>

      <div className="p-5">
        {activeSection === "overview" ? (
          <OverviewSection application={application} />
        ) : null}

        {activeSection === "notes" ? (
          <NotesSection
            actionState={noteActionState}
            error={workflowError("note", noteWorkflow.localError)}
            noteBody={noteWorkflow.noteBody}
            notes={notes}
            onAction={() => startAction("note")}
            onCancel={() => startAction(null)}
            onNoteBodyChange={noteWorkflow.setNoteBody}
            onSubmit={noteWorkflow.handleSubmit}
          />
        ) : null}

        {activeSection === "followUps" ? (
          <FollowUpsSection
            actionState={followUpActionState}
            error={workflowError("followUp", followUpWorkflow.localError)}
            followUps={followUps}
            form={followUpWorkflow.form}
            onAction={() => startAction("followUp")}
            onCancel={() => startAction(null)}
            onDateChange={followUpWorkflow.setDueDate}
            onNoteChange={followUpWorkflow.setNote}
            onSubmit={followUpWorkflow.handleSubmit}
            onTimeChange={followUpWorkflow.setDueTime}
          />
        ) : null}

        {activeSection === "interviews" ? (
          <InterviewsSection
            error={workflowError("interview", interviewWorkflow.localError)}
            interviewForm={interviewWorkflow.interviewForm}
            interviews={interviews}
            outcome={interviewWorkflow.outcomeForm.outcome}
            outcomeState={outcomeRecordingState}
            scheduleState={scheduleInterviewState}
            onAction={() => startAction("interview")}
            onCancel={() => startAction(null)}
            onCancelOutcome={() => startAction(null)}
            onInterviewDateChange={interviewWorkflow.setInterviewScheduledDate}
            onInterviewNotesChange={interviewWorkflow.setInterviewNotes}
            onInterviewTimeChange={interviewWorkflow.setInterviewScheduledTime}
            onInterviewTypeChange={interviewWorkflow.setInterviewType}
            onOutcomeChange={interviewWorkflow.setOutcome}
            onRecordOutcome={(interview) => {
              interviewWorkflow.startOutcome(interview);
              startAction("outcome");
            }}
            onScheduleSubmit={interviewWorkflow.handleScheduleSubmit}
            onSubmitOutcome={interviewWorkflow.handleOutcomeSubmit}
          />
        ) : null}

        {activeSection === "timeline" ? (
          <TimelineSection timeline={timeline} />
        ) : null}
      </div>
    </aside>
  );
}
