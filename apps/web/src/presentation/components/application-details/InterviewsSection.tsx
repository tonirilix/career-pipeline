import { type FormEvent, useState } from "react";

import type {
  RecordInterviewOutcomeCommand,
  ScheduleInterviewCommand
} from "../../../domain/interviewScheduling";
import {
  type Interview,
  interviewOutcomes,
  interviewTypes
} from "../../../domain/jobOpportunity";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { combineDateAndTime, formatDate } from "./dateHelpers";
import {
  DateTimeFields,
  DetailsError,
  FormActions,
  SectionHeader
} from "./primitives";
import type {
  DetailsCommandError,
  InterviewFormState,
  OutcomeRecordingState,
  OutcomeFormState,
  ScheduleInterviewState
} from "./types";

const emptyInterviewForm: InterviewFormState = {
  type: "Recruiter screen",
  scheduledDate: "",
  scheduledTime: "",
  notes: ""
};

const emptyOutcomeForm: OutcomeFormState = {
  interviewId: "",
  outcome: "Passed"
};

const finalInterviewOutcomes = interviewOutcomes.filter(
  (outcome): outcome is Exclude<Interview["outcome"], "Scheduled"> =>
    outcome !== "Scheduled"
);

export function useInterviewWorkflow({
  applicationId,
  onComplete,
  onRecordInterviewOutcome,
  onScheduleInterview
}: {
  applicationId: string;
  onComplete: () => void;
  onRecordInterviewOutcome: (
    command: RecordInterviewOutcomeCommand
  ) => Promise<boolean>;
  onScheduleInterview: (command: ScheduleInterviewCommand) => Promise<boolean>;
}) {
  const [interviewForm, setInterviewForm] =
    useState<InterviewFormState>(emptyInterviewForm);
  const [outcomeForm, setOutcomeForm] =
    useState<OutcomeFormState>(emptyOutcomeForm);
  const [localError, setLocalError] = useState<DetailsCommandError | null>(null);

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!interviewForm.scheduledDate || !interviewForm.scheduledTime) {
      setLocalError({
        workflow: "interview",
        message: "Interview date and time are required."
      });
      return;
    }

    const didSchedule = await onScheduleInterview({
      applicationId,
      type: interviewForm.type,
      scheduledAt: combineDateAndTime(
        interviewForm.scheduledDate,
        interviewForm.scheduledTime
      ),
      notes: interviewForm.notes
    });
    if (didSchedule) {
      setInterviewForm(emptyInterviewForm);
      onComplete();
    }
  }

  async function handleOutcomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const didRecord = await onRecordInterviewOutcome({
      applicationId,
      interviewId: outcomeForm.interviewId,
      outcome: outcomeForm.outcome
    });
    if (didRecord) {
      setOutcomeForm(emptyOutcomeForm);
      onComplete();
    }
  }

  return {
    handleOutcomeSubmit,
    handleScheduleSubmit,
    interviewForm,
    localError,
    outcomeForm,
    setInterviewNotes: (notes: string) =>
      setInterviewForm((current) => ({ ...current, notes })),
    setInterviewScheduledDate: (scheduledDate: string) =>
      setInterviewForm((current) => ({ ...current, scheduledDate })),
    setInterviewScheduledTime: (scheduledTime: string) =>
      setInterviewForm((current) => ({ ...current, scheduledTime })),
    setInterviewType: (type: Interview["type"]) =>
      setInterviewForm((current) => ({ ...current, type })),
    setOutcome: (outcome: Exclude<Interview["outcome"], "Scheduled">) =>
      setOutcomeForm((current) => ({ ...current, outcome })),
    startOutcome: (interview: Interview) =>
      setOutcomeForm({ interviewId: interview.id, outcome: "Passed" }),
    clearLocalError: () => setLocalError(null)
  };
}

export function InterviewsSection({
  error,
  interviews,
  interviewForm,
  outcome,
  outcomeState,
  scheduleState,
  onAction,
  onCancel,
  onCancelOutcome,
  onInterviewDateChange,
  onInterviewNotesChange,
  onInterviewTimeChange,
  onInterviewTypeChange,
  onOutcomeChange,
  onRecordOutcome,
  onScheduleSubmit,
  onSubmitOutcome
}: {
  error: DetailsCommandError | null;
  interviews: Interview[];
  interviewForm: InterviewFormState;
  outcome: Exclude<Interview["outcome"], "Scheduled">;
  outcomeState: OutcomeRecordingState;
  scheduleState: ScheduleInterviewState;
  onAction: () => void;
  onCancel: () => void;
  onCancelOutcome: () => void;
  onInterviewDateChange: (value: string) => void;
  onInterviewNotesChange: (value: string) => void;
  onInterviewTimeChange: (value: string) => void;
  onInterviewTypeChange: (value: Interview["type"]) => void;
  onOutcomeChange: (outcome: Exclude<Interview["outcome"], "Scheduled">) => void;
  onRecordOutcome: (interview: Interview) => void;
  onScheduleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitOutcome: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const canSchedule = scheduleState.kind !== "blocked";
  const isScheduleActive = scheduleState.kind === "active";
  const isSchedulePending =
    isScheduleActive && scheduleState.status === "pending";

  return (
    <section aria-label="Interviews" className="grid gap-4">
      <SectionHeader
        actionLabel="Schedule interview"
        canAct={canSchedule}
        disabledReason={
          scheduleState.kind === "blocked" ? scheduleState.reason : undefined
        }
        hideAction={isScheduleActive}
        title="Interviews"
        onAction={onAction}
      />
      {error ? (
        <DetailsError error={error} title="Interview action failed">
          Your interview details are still here. Adjust them and try again.
        </DetailsError>
      ) : null}
      {isScheduleActive ? (
        <form className="grid gap-3" onSubmit={onScheduleSubmit}>
          <label className="grid min-w-0 gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Interview type
            <Select
              onChange={(e) => onInterviewTypeChange(e.target.value as Interview["type"])}
              value={interviewForm.type}
            >
              {interviewTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </label>
          <DateTimeFields
            date={interviewForm.scheduledDate}
            groupLabel="Date and time"
            time={interviewForm.scheduledTime}
            onDateChange={onInterviewDateChange}
            onTimeChange={onInterviewTimeChange}
          />
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Interview notes
            <Textarea
              className="min-h-[80px]"
              onChange={(e) => onInterviewNotesChange(e.target.value)}
              value={interviewForm.notes}
            />
          </label>
          <FormActions
            isPending={isSchedulePending}
            submitLabel="Schedule interview"
            onCancel={onCancel}
          />
        </form>
      ) : null}
      <InterviewList
        interviews={interviews}
        outcome={outcome}
        outcomeState={outcomeState}
        onCancelOutcome={onCancelOutcome}
        onOutcomeChange={onOutcomeChange}
        onRecordOutcome={onRecordOutcome}
        onSubmitOutcome={onSubmitOutcome}
      />
    </section>
  );
}

function InterviewList({
  interviews,
  outcome,
  outcomeState,
  onCancelOutcome,
  onOutcomeChange,
  onRecordOutcome,
  onSubmitOutcome
}: {
  interviews: Interview[];
  outcome: Exclude<Interview["outcome"], "Scheduled">;
  outcomeState: OutcomeRecordingState;
  onCancelOutcome: () => void;
  onOutcomeChange: (outcome: Exclude<Interview["outcome"], "Scheduled">) => void;
  onRecordOutcome: (interview: Interview) => void;
  onSubmitOutcome: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (interviews.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No interviews scheduled</p>;
  }

  return (
    <ol aria-label="Scheduled interviews" className="list-none p-0 m-0 grid gap-2">
      {interviews.map((interview) => (
        <li key={interview.id} className="border border-border px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <strong className="text-sm font-semibold">{interview.type}</strong>
            <span className="text-xs font-bold text-muted-foreground border border-border px-1.5 py-0.5 uppercase tracking-wider">
              {interview.outcome}
            </span>
          </div>
          <time
            className="block text-xs font-bold text-muted-foreground uppercase tracking-wide"
            dateTime={interview.scheduledAt}
          >
            {formatDate(interview.scheduledAt)}
          </time>
          {interview.notes ? (
            <p className="text-xs text-muted-foreground mt-1">{interview.notes}</p>
          ) : null}
          {outcomeState.kind === "active" &&
          outcomeState.interviewId === interview.id ? (
            <form className="mt-3 grid gap-2" onSubmit={onSubmitOutcome}>
              <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Outcome
                <Select
                  onChange={(event) =>
                    onOutcomeChange(
                      event.target.value as Exclude<Interview["outcome"], "Scheduled">
                    )
                  }
                  value={outcome}
                >
                  {finalInterviewOutcomes.map((candidate) => (
                    <option key={candidate} value={candidate}>
                      {candidate}
                    </option>
                  ))}
                </Select>
              </label>
              <FormActions
                isPending={outcomeState.status === "pending"}
                submitLabel="Record outcome"
                onCancel={onCancelOutcome}
              />
            </form>
          ) : (
            <Button
              className="mt-3 h-8 px-3 text-xs"
              type="button"
              variant="outline"
              onClick={() => onRecordOutcome(interview)}
            >
              Record outcome
            </Button>
          )}
        </li>
      ))}
    </ol>
  );
}
