import { type FormEvent, useState } from "react";

import type { AddApplicationNoteCommand } from "../../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../../domain/followUpReminder";
import type { ScheduleInterviewCommand } from "../../domain/interviewScheduling";
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
  outcome: Interview["outcome"];
};

type ApplicationDetailsProps = {
  application: JobApplication;
  commandError: DetailsCommandError | null;
  onAddNote: (command: AddApplicationNoteCommand) => Promise<boolean>;
  onCreateFollowUp: (command: CreateFollowUpReminderCommand) => Promise<boolean>;
  onScheduleInterview: (command: ScheduleInterviewCommand) => Promise<boolean>;
};

export function ApplicationDetails({
  application,
  commandError,
  onAddNote,
  onCreateFollowUp,
  onScheduleInterview
}: ApplicationDetailsProps) {
  const timeline = [...application.timeline].sort(compareTimelineEvents);
  const notes = [...application.notes].sort(compareNotes);
  const interviews = [...application.interviews].sort(compareInterviews);
  const followUps = [...application.followUps].sort(compareFollowUps);

  const [interviewForm, setInterviewForm] = useState<InterviewFormState>({
    type: "Recruiter screen",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
    outcome: "Scheduled"
  });

  const [followUpForm, setFollowUpForm] = useState<FollowUpFormState>({
    dueDate: "",
    dueTime: "",
    note: ""
  });

  const [noteBody, setNoteBody] = useState("");

  async function handleInterviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const didSchedule = await onScheduleInterview({
      applicationId: application.id,
      type: interviewForm.type,
      scheduledAt: combineDateAndTime(
        interviewForm.scheduledDate,
        interviewForm.scheduledTime
      ),
      notes: interviewForm.notes,
      outcome: interviewForm.outcome
    });
    if (didSchedule) {
      setInterviewForm({
        type: "Recruiter screen",
        scheduledDate: "",
        scheduledTime: "",
        notes: "",
        outcome: "Scheduled"
      });
    }
  }

  async function handleFollowUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const didCreate = await onCreateFollowUp({
      applicationId: application.id,
      dueAt: combineDateAndTime(followUpForm.dueDate, followUpForm.dueTime),
      note: followUpForm.note
    });
    if (didCreate) setFollowUpForm({ dueDate: "", dueTime: "", note: "" });
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const didAdd = await onAddNote({ applicationId: application.id, body: noteBody });
    if (didAdd) setNoteBody("");
  }

  return (
    <aside aria-label="Application details">
      {/* Header */}
      <div className="border-b border-border px-5 py-4 flex items-start justify-between">
        <div>
          <p className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest m-0 mb-0.5">
            Application details
          </p>
          <h2 className="text-lg font-bold text-foreground m-0">{application.company}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0">{application.roleTitle}</p>
        </div>
        <span className="border border-border text-muted-foreground text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 whitespace-nowrap mt-1">
          {application.stage}
        </span>
      </div>

      {/* Meta: 2-col grid */}
      <dl className="grid grid-cols-2 border-b border-border">
        {[
          { label: "Source", value: application.source },
          { label: "Location", value: application.location || "Not set" },
          { label: "Compensation", value: application.compensation || "Not set" },
          { label: "Employment type", value: application.employmentType },
        ].map(({ label, value }, i) => (
          <div key={label} className={`px-4 py-3 ${i % 2 === 0 ? "border-r border-border" : ""} ${i < 2 ? "border-b border-border" : ""}`}>
            <dt className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</dt>
            <dd className="text-xs text-foreground m-0">{value}</dd>
          </div>
        ))}
        <div className="col-span-2 border-t border-border px-4 py-3">
          <dt className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest mb-1">Posting URL</dt>
          <dd className="text-xs text-foreground m-0 break-all">
            <a className="text-foreground hover:text-accent underline underline-offset-2" href={application.postingUrl}>{application.postingUrl}</a>
          </dd>
        </div>
      </dl>

      {/* Sections: single-column stacked */}
      <div className="divide-y divide-border">
        {/* Notes */}
        <section aria-label="Notes" className="p-5">
          <h3 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest mb-3">Notes</h3>
          {notes.length > 0 ? (
            <ol aria-label="Application notes" className="list-none p-0 m-0 grid gap-2 mb-4">
              {notes.map((note) => (
                <li key={note.id} className="border border-border px-3 py-2">
                  <time className="block text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide mb-1" dateTime={note.createdAt}>
                    {formatDate(note.createdAt)}
                  </time>
                  <span className="text-sm text-foreground">{note.body}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-4">No notes yet</p>
          )}
          {commandError?.workflow === "note" ? (
            <ErrorNotice
              className="mb-3"
              message={commandError.message}
              title="Note was not added"
            >
              <p className="m-0 mt-1 text-xs text-foreground/80">
                Your note is still here. Edit it if needed, then try again.
              </p>
            </ErrorNotice>
          ) : null}
          <form className="grid gap-2" onSubmit={handleNoteSubmit}>
            <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
              Application note
              <Textarea
                className="min-h-[60px]"
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Add a note…"
                value={noteBody}
              />
            </label>
            <Button type="submit" className="h-9 text-xs">Add note</Button>
          </form>
        </section>

        {/* Follow-ups */}
        <section aria-label="Follow-ups" className="p-5">
          <h3 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest mb-3">Follow-ups</h3>
          {followUps.length > 0 ? (
            <ol aria-label="Application follow-ups" className="list-none p-0 m-0 grid gap-2 mb-4">
              {followUps.map((followUp) => (
                <li key={followUp.id} className="bg-background border border-border px-3 py-2 flex items-start justify-between gap-2">
                  <div>
                    <time className="block text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5" dateTime={followUp.dueAt}>
                      {formatDate(followUp.dueAt)}
                    </time>
                    <span className="text-sm text-foreground">{followUp.note}</span>
                  </div>
                  {followUp.completedAt ? (
                    <span className="text-[0.6rem] font-bold text-accent border border-accent/30 px-1.5 py-0.5 whitespace-nowrap uppercase tracking-wider">done</span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-4">No follow-ups scheduled</p>
          )}
          {commandError?.workflow === "followUp" ? (
            <ErrorNotice
              className="mb-3"
              message={commandError.message}
              title="Follow-up was not created"
            >
              <p className="m-0 mt-1 text-xs text-foreground/80">
                Your due date and note are still here. Adjust them and try again.
              </p>
            </ErrorNotice>
          ) : null}
          <form className="grid gap-3" onSubmit={handleFollowUpSubmit}>
            <div
              aria-label="Follow-up due date"
              className="grid grid-cols-[minmax(0,1fr)_minmax(96px,0.55fr)] gap-3"
              role="group"
            >
              <label className="grid min-w-0 gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
                Date
                <Input
                  onChange={(e) =>
                    setFollowUpForm((c) => ({ ...c, dueDate: e.target.value }))
                  }
                  type="date"
                  value={followUpForm.dueDate}
                />
              </label>
              <label className="grid min-w-0 gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
                Time
                <Input
                  onChange={(e) =>
                    setFollowUpForm((c) => ({ ...c, dueTime: e.target.value }))
                  }
                  type="time"
                  value={followUpForm.dueTime}
                />
              </label>
            </div>
            <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
              Follow-up note
              <Textarea
                className="min-h-[60px]"
                onChange={(e) => setFollowUpForm((c) => ({ ...c, note: e.target.value }))}
                value={followUpForm.note}
              />
            </label>
            <Button type="submit" className="h-9 text-xs">Create follow-up</Button>
          </form>
        </section>

        {/* Interviews */}
        <section aria-label="Interviews" className="p-5">
          <h3 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest mb-3">Interviews</h3>
          {interviews.length > 0 ? (
            <ol aria-label="Scheduled interviews" className="list-none p-0 m-0 grid gap-2 mb-4">
              {interviews.map((interview) => (
                <li key={interview.id} className="border border-border px-3 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <strong className="text-sm font-semibold">{interview.type}</strong>
                    <span className="text-[0.6rem] font-bold text-muted-foreground border border-border px-1.5 py-0.5 uppercase tracking-wider">{interview.outcome}</span>
                  </div>
                  <time className="block text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide" dateTime={interview.scheduledAt}>
                    {formatDate(interview.scheduledAt)}
                  </time>
                  {interview.notes ? <p className="text-xs text-muted-foreground mt-1">{interview.notes}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-4">No interviews scheduled</p>
          )}
          {commandError?.workflow === "interview" ? (
            <ErrorNotice
              className="mb-3"
              message={commandError.message}
              title="Interview was not scheduled"
            >
              <p className="m-0 mt-1 text-xs text-foreground/80">
                Your interview details are still here. Adjust them and try again.
              </p>
            </ErrorNotice>
          ) : null}
          <form className="grid gap-3" onSubmit={handleInterviewSubmit}>
            <div className="grid gap-3">
              <label className="grid min-w-0 gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
                Interview type
                <Select
                  onChange={(e) =>
                    setInterviewForm((c) => ({ ...c, type: e.target.value as Interview["type"] }))
                  }
                  value={interviewForm.type}
                >
                  {interviewTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </label>
              <div
                aria-label="Date and time"
                className="grid min-w-0 grid-cols-2 gap-3"
                role="group"
              >
                <label className="grid min-w-0 gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
                  Date
                  <Input
                    onChange={(e) =>
                      setInterviewForm((c) => ({ ...c, scheduledDate: e.target.value }))
                    }
                    type="date"
                    value={interviewForm.scheduledDate}
                  />
                </label>
                <label className="grid min-w-0 gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
                  Time
                  <Input
                    onChange={(e) =>
                      setInterviewForm((c) => ({ ...c, scheduledTime: e.target.value }))
                    }
                    type="time"
                    value={interviewForm.scheduledTime}
                  />
                </label>
              </div>
            </div>
            <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
              Interview notes
              <Textarea
                className="min-h-[60px]"
                onChange={(e) =>
                  setInterviewForm((c) => ({ ...c, notes: e.target.value }))
                }
                value={interviewForm.notes}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 items-end">
              <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
                Outcome
                <Select
                  onChange={(e) =>
                    setInterviewForm((c) => ({
                      ...c,
                      outcome: e.target.value as Interview["outcome"]
                    }))
                  }
                  value={interviewForm.outcome}
                >
                  {interviewOutcomes.map((outcome) => (
                    <option key={outcome} value={outcome}>{outcome}</option>
                  ))}
                </Select>
              </label>
              <Button type="submit" className="h-9 text-xs">Schedule interview</Button>
            </div>
          </form>
        </section>

        {/* Timeline */}
        <section aria-label="Timeline" className="p-5">
          <h3 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest mb-3">Timeline</h3>
          {timeline.length > 0 ? (
            <ol aria-label="Timeline events" className="list-none p-0 m-0 relative border-l-2 border-border ml-2">
              {timeline.map((event) => (
                <li key={event.id} className="relative pl-5 pb-4 last:pb-0">
                  <span className="absolute left-[-5px] top-1.5 w-2 h-2 bg-border" />
                  <time className="block text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide" dateTime={event.occurredAt}>
                    {formatDate(event.occurredAt)}
                  </time>
                  <span className="text-sm text-foreground">{event.description}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground italic">No timeline events yet</p>
          )}
        </section>
      </div>
    </aside>
  );
}

function compareTimelineEvents(left: TimelineEvent, right: TimelineEvent) {
  return new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime();
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
  if (!date || !time) return "";
  return `${date}T${time}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
