import { type ChangeEvent, type FormEvent, type ReactNode, useState } from "react";

import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import { isClosedApplication } from "../../domain/closedWork";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../../domain/followUpReminder";
import type {
  RecordInterviewOutcomeCommand,
  ScheduleInterviewCommand
} from "../../domain/interviewScheduling";
import type { CommandStatus } from "../pipelineWorkspace";
import {
  type ApplicationNote,
  type FollowUpReminder,
  type Interview,
  type JobApplication,
  type TimelineEvent,
  interviewOutcomes,
  interviewTypes
} from "../../domain/jobOpportunity";
import { Button } from "./ui/button";
import { ErrorNotice } from "./ui/error-notice";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

export type DetailsCommandError = {
  workflow: "note" | "followUp" | "interview";
  message: string;
};

type DetailsSection = "overview" | "notes" | "followUps" | "interviews" | "timeline";
type DetailsAction = "note" | "followUp" | "interview" | "outcome" | null;

type FollowUpFormState = {
  dueDate: string;
  dueTime: string;
  note: string;
};

type InterviewFormState = {
  type: Interview["type"];
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
};

type OutcomeFormState = {
  interviewId: string;
  outcome: Exclude<Interview["outcome"], "Scheduled">;
};

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

const finalInterviewOutcomes = interviewOutcomes.filter(
  (outcome): outcome is Exclude<Interview["outcome"], "Scheduled"> =>
    outcome !== "Scheduled"
);

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
  const [localError, setLocalError] = useState<DetailsCommandError | null>(null);

  const [interviewForm, setInterviewForm] = useState<InterviewFormState>({
    type: "Recruiter screen",
    scheduledDate: "",
    scheduledTime: "",
    notes: ""
  });

  const [outcomeForm, setOutcomeForm] = useState<OutcomeFormState>({
    interviewId: "",
    outcome: "Passed"
  });

  const [followUpForm, setFollowUpForm] = useState<FollowUpFormState>({
    dueDate: "",
    dueTime: "",
    note: ""
  });

  const [noteBody, setNoteBody] = useState("");
  const visibleError = localError ?? commandError;

  function showSection(section: DetailsSection) {
    setActiveSection(section);
    setActiveAction(null);
    setLocalError(null);
  }

  async function handleInterviewSubmit(event: FormEvent<HTMLFormElement>) {
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
      applicationId: application.id,
      type: interviewForm.type,
      scheduledAt: combineDateAndTime(
        interviewForm.scheduledDate,
        interviewForm.scheduledTime
      ),
      notes: interviewForm.notes
    });
    if (didSchedule) {
      setInterviewForm({
        type: "Recruiter screen",
        scheduledDate: "",
        scheduledTime: "",
        notes: ""
      });
      setActiveAction(null);
    }
  }

  async function handleOutcomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const didRecord = await onRecordInterviewOutcome({
      applicationId: application.id,
      interviewId: outcomeForm.interviewId,
      outcome: outcomeForm.outcome
    });
    if (didRecord) {
      setOutcomeForm({ interviewId: "", outcome: "Passed" });
      setActiveAction(null);
    }
  }

  async function handleFollowUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!followUpForm.dueDate || !followUpForm.dueTime) {
      setLocalError({
        workflow: "followUp",
        message: "Follow-up date and time are required."
      });
      return;
    }

    const didCreate = await onCreateFollowUp({
      applicationId: application.id,
      dueAt: combineDateAndTime(followUpForm.dueDate, followUpForm.dueTime),
      note: followUpForm.note
    });
    if (didCreate) {
      setFollowUpForm({ dueDate: "", dueTime: "", note: "" });
      setActiveAction(null);
    }
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const didAdd = await onAddNote({ applicationId: application.id, body: noteBody });
    if (didAdd) {
      setNoteBody("");
      setActiveAction(null);
    }
  }

  function startAction(action: DetailsAction) {
    setActiveAction(action);
    setLocalError(null);
  }

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
          <section aria-label="Notes" className="grid gap-4">
            <SectionHeader
              actionLabel="Add note"
              canAct
              hideAction={activeAction === "note"}
              title="Notes"
              onAction={() => startAction("note")}
            />
            {visibleError?.workflow === "note" ? (
              <DetailsError error={visibleError} title="Note was not added">
                Your note is still here. Edit it if needed, then try again.
              </DetailsError>
            ) : null}
            {activeAction === "note" ? (
              <form className="grid gap-2" onSubmit={handleNoteSubmit}>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Application note
                  <Textarea
                    className="min-h-[80px]"
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder="Add a note..."
                    value={noteBody}
                  />
                </label>
                <FormActions
                  isPending={addNoteStatus === "pending"}
                  submitLabel="Add note"
                  onCancel={() => startAction(null)}
                />
              </form>
            ) : null}
            <NoteList notes={notes} />
          </section>
        ) : null}

        {activeSection === "followUps" ? (
          <section aria-label="Follow-ups" className="grid gap-4">
            <SectionHeader
              actionLabel="Create follow-up"
              canAct={!isClosed}
              disabledReason="Reopen this application to create follow-ups."
              hideAction={activeAction === "followUp"}
              title="Follow-ups"
              onAction={() => startAction("followUp")}
            />
            {visibleError?.workflow === "followUp" ? (
              <DetailsError error={visibleError} title="Follow-up was not created">
                Your due date and note are still here. Adjust them and try again.
              </DetailsError>
            ) : null}
            {activeAction === "followUp" && !isClosed ? (
              <form className="grid gap-3" onSubmit={handleFollowUpSubmit}>
                <DateTimeFields
                  date={followUpForm.dueDate}
                  groupLabel="Follow-up due date"
                  time={followUpForm.dueTime}
                  onDateChange={(value) =>
                    setFollowUpForm((current) => ({ ...current, dueDate: value }))
                  }
                  onTimeChange={(value) =>
                    setFollowUpForm((current) => ({ ...current, dueTime: value }))
                  }
                />
                <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Follow-up note
                  <Textarea
                    className="min-h-[80px]"
                    onChange={(e) =>
                      setFollowUpForm((current) => ({
                        ...current,
                        note: e.target.value
                      }))
                    }
                    value={followUpForm.note}
                  />
                </label>
                <FormActions
                  isPending={createFollowUpStatus === "pending"}
                  submitLabel="Create follow-up"
                  onCancel={() => startAction(null)}
                />
              </form>
            ) : null}
            <FollowUpList followUps={followUps} />
          </section>
        ) : null}

        {activeSection === "interviews" ? (
          <section aria-label="Interviews" className="grid gap-4">
            <SectionHeader
              actionLabel="Schedule interview"
              canAct={
                !isClosed &&
                application.stage !== "Saved" &&
                application.stage !== "Offer"
              }
              disabledReason="Interviews can only be scheduled for active applications before the offer stage."
              hideAction={activeAction === "interview"}
              title="Interviews"
              onAction={() => startAction("interview")}
            />
            {visibleError?.workflow === "interview" ? (
              <DetailsError error={visibleError} title="Interview action failed">
                Your interview details are still here. Adjust them and try again.
              </DetailsError>
            ) : null}
            {activeAction === "interview" ? (
              <form className="grid gap-3" onSubmit={handleInterviewSubmit}>
                <label className="grid min-w-0 gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Interview type
                  <Select
                    onChange={(e) =>
                      setInterviewForm((current) => ({
                        ...current,
                        type: e.target.value as Interview["type"]
                      }))
                    }
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
                  onDateChange={(value) =>
                    setInterviewForm((current) => ({
                      ...current,
                      scheduledDate: value
                    }))
                  }
                  onTimeChange={(value) =>
                    setInterviewForm((current) => ({
                      ...current,
                      scheduledTime: value
                    }))
                  }
                />
                <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Interview notes
                  <Textarea
                    className="min-h-[80px]"
                    onChange={(e) =>
                      setInterviewForm((current) => ({
                        ...current,
                        notes: e.target.value
                      }))
                    }
                    value={interviewForm.notes}
                  />
                </label>
                <FormActions
                  isPending={scheduleInterviewStatus === "pending"}
                  submitLabel="Schedule interview"
                  onCancel={() => startAction(null)}
                />
              </form>
            ) : null}
            <InterviewList
              activeOutcomeInterviewId={
                activeAction === "outcome" ? outcomeForm.interviewId : null
              }
              interviews={interviews}
              outcome={outcomeForm.outcome}
              recordStatus={recordInterviewOutcomeStatus}
              onCancelOutcome={() => startAction(null)}
              onOutcomeChange={(outcome) =>
                setOutcomeForm((current) => ({ ...current, outcome }))
              }
              onRecordOutcome={(interview) => {
                setOutcomeForm({ interviewId: interview.id, outcome: "Passed" });
                startAction("outcome");
              }}
              onSubmitOutcome={handleOutcomeSubmit}
            />
          </section>
        ) : null}

        {activeSection === "timeline" ? (
          <section aria-label="Timeline" className="grid gap-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Timeline
            </h3>
            <TimelineList timeline={timeline} />
          </section>
        ) : null}
      </div>
    </aside>
  );
}

function ApplicationSummary({ application }: { application: JobApplication }) {
  return (
    <div className="border-b border-border px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest m-0 mb-0.5">
            Application details
          </p>
          <h2 className="text-lg font-bold text-foreground m-0 truncate">
            {application.company}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0">
            {application.roleTitle}
          </p>
        </div>
        <span className="border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest px-2 py-1 whitespace-nowrap mt-1">
          {application.stage}
        </span>
      </div>
    </div>
  );
}

function SectionButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-12 border-r border-border px-2 text-[11px] font-bold uppercase tracking-wide transition-colors last:border-r-0 ${
        active
          ? "bg-muted text-foreground"
          : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="flex flex-col items-center gap-0.5 leading-tight">{children}</span>
    </button>
  );
}

function OverviewSection({ application }: { application: JobApplication }) {
  return (
    <section aria-label="Overview" className="grid gap-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Overview
      </h3>
      <dl className="grid grid-cols-2 border border-border">
        {[
          { label: "Source", value: application.source },
          { label: "Location", value: application.location || "Not set" },
          { label: "Compensation", value: application.compensation || "Not set" },
          { label: "Employment type", value: application.employmentType }
        ].map(({ label, value }, index) => (
          <div
            className={`px-4 py-3 ${index % 2 === 0 ? "border-r border-border" : ""} ${
              index < 2 ? "border-b border-border" : ""
            }`}
            key={label}
          >
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {label}
            </dt>
            <dd className="text-xs text-foreground m-0">{value}</dd>
          </div>
        ))}
        <div className="col-span-2 border-t border-border px-4 py-3">
          <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Posting URL
          </dt>
          <dd className="text-xs text-foreground m-0 break-all">
            <a
              className="text-foreground hover:text-accent underline underline-offset-2"
              href={application.postingUrl}
            >
              {application.postingUrl}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function SectionHeader({
  actionLabel,
  canAct,
  disabledReason,
  hideAction = false,
  title,
  onAction
}: {
  actionLabel: string;
  canAct: boolean;
  disabledReason?: string;
  hideAction?: boolean;
  title: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </h3>
        {!canAct && disabledReason ? (
          <p className="m-0 mt-1 text-xs text-muted-foreground">{disabledReason}</p>
        ) : null}
      </div>
      {canAct && !hideAction ? (
        <Button className="h-8 px-3 text-xs" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function NoteList({ notes }: { notes: ApplicationNote[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No notes yet</p>;
  }

  return (
    <ol aria-label="Application notes" className="list-none p-0 m-0 grid gap-2">
      {notes.map((note) => (
        <li key={note.id} className="border border-border px-3 py-2">
          <time
            className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1"
            dateTime={note.createdAt}
          >
            {formatDate(note.createdAt)}
          </time>
          <span className="text-sm text-foreground">{note.body}</span>
        </li>
      ))}
    </ol>
  );
}

function FollowUpList({ followUps }: { followUps: FollowUpReminder[] }) {
  if (followUps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No follow-ups scheduled</p>
    );
  }

  return (
    <ol aria-label="Application follow-ups" className="list-none p-0 m-0 grid gap-2">
      {followUps.map((followUp) => (
        <li
          key={followUp.id}
          className="bg-background border border-border px-3 py-2 flex items-start justify-between gap-2"
        >
          <div>
            <time
              className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5"
              dateTime={followUp.dueAt}
            >
              {formatDate(followUp.dueAt)}
            </time>
            <span className="text-sm text-foreground">{followUp.note}</span>
          </div>
          {followUp.completedAt ? (
            <span className="text-xs font-bold text-accent border border-accent/30 px-1.5 py-0.5 whitespace-nowrap uppercase tracking-wider">
              done
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function InterviewList({
  activeOutcomeInterviewId,
  interviews,
  outcome,
  recordStatus,
  onCancelOutcome,
  onOutcomeChange,
  onRecordOutcome,
  onSubmitOutcome
}: {
  activeOutcomeInterviewId: string | null;
  interviews: Interview[];
  outcome: Exclude<Interview["outcome"], "Scheduled">;
  recordStatus: CommandStatus;
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
          {activeOutcomeInterviewId === interview.id ? (
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
                isPending={recordStatus === "pending"}
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

function TimelineList({ timeline }: { timeline: TimelineEvent[] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No timeline events yet</p>;
  }

  return (
    <ol
      aria-label="Timeline events"
      className="list-none p-0 m-0 relative border-l-2 border-border ml-2"
    >
      {timeline.map((event) => (
        <li key={event.id} className="relative pl-5 pb-4 last:pb-0">
          <span className="absolute left-[-5px] top-1.5 w-2 h-2 bg-border" />
          <time
            className="block text-xs font-bold text-muted-foreground uppercase tracking-wide"
            dateTime={event.occurredAt}
          >
            {formatDate(event.occurredAt)}
          </time>
          <span className="text-sm text-foreground">{event.description}</span>
        </li>
      ))}
    </ol>
  );
}

function DateTimeFields({
  date,
  groupLabel,
  time,
  onDateChange,
  onTimeChange
}: {
  date: string;
  groupLabel: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  function handleDateInput(
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) {
    onDateChange(event.currentTarget.value);
  }

  function handleTimeInput(
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) {
    onTimeChange(event.currentTarget.value);
  }

  return (
    <div
      aria-label={groupLabel}
      className="grid min-w-0 grid-cols-2 gap-3"
      role="group"
    >
      <label className="grid min-w-0 gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Date
        <Input
          onChange={handleDateInput}
          onInput={handleDateInput}
          type="date"
          value={date}
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Time
        <Input
          onChange={handleTimeInput}
          onInput={handleTimeInput}
          type="time"
          value={time}
        />
      </label>
    </div>
  );
}

function FormActions({
  isPending,
  submitLabel,
  onCancel
}: {
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
    </div>
  );
}

function DetailsError({
  children,
  error,
  title
}: {
  children: string;
  error: DetailsCommandError;
  title: string;
}) {
  return (
    <ErrorNotice className="mb-1" message={error.message} title={title}>
      <p className="m-0 mt-1 text-xs text-foreground/80">{children}</p>
    </ErrorNotice>
  );
}

function compareTimelineEvents(left: TimelineEvent, right: TimelineEvent) {
  return new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime();
}

function compareNotes(left: ApplicationNote, right: ApplicationNote) {
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

function compareInterviews(left: Interview, right: Interview) {
  return new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime();
}

function compareFollowUps(left: FollowUpReminder, right: FollowUpReminder) {
  return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
}

function combineDateAndTime(date: string, time: string) {
  return `${date}T${time}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
