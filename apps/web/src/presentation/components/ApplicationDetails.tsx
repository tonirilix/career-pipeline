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
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type ApplicationDetailsProps = {
  application: JobApplication;
  onAddNote: (command: AddApplicationNoteCommand) => Promise<void>;
  onCreateFollowUp: (command: CreateFollowUpReminderCommand) => Promise<void>;
  onScheduleInterview: (command: ScheduleInterviewCommand) => Promise<void>;
};

export function ApplicationDetails({
  application,
  onAddNote,
  onCreateFollowUp,
  onScheduleInterview
}: ApplicationDetailsProps) {
  const timeline = [...application.timeline].sort(compareTimelineEvents);
  const notes = [...application.notes].sort(compareNotes);
  const interviews = [...application.interviews].sort(compareInterviews);
  const followUps = [...application.followUps].sort(compareFollowUps);

  const [interviewForm, setInterviewForm] = useState<
    Omit<ScheduleInterviewCommand, "applicationId">
  >({ type: "Recruiter screen", scheduledAt: "", notes: "", outcome: "Scheduled" });

  const [followUpForm, setFollowUpForm] = useState<
    Omit<CreateFollowUpReminderCommand, "applicationId">
  >({ dueAt: "", note: "" });

  const [noteBody, setNoteBody] = useState("");

  async function handleInterviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onScheduleInterview({ applicationId: application.id, ...interviewForm });
    setInterviewForm({ type: "Recruiter screen", scheduledAt: "", notes: "", outcome: "Scheduled" });
  }

  async function handleFollowUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateFollowUp({ applicationId: application.id, ...followUpForm });
    setFollowUpForm({ dueAt: "", note: "" });
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAddNote({ applicationId: application.id, body: noteBody });
    setNoteBody("");
  }

  return (
    <aside
      aria-label="Application details"
      className="mt-5 rounded-xl border border-[var(--color-border)] bg-white shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-6 py-4 flex items-start justify-between">
        <div>
          <p className="text-[0.7rem] font-bold text-[#a7d4c7] uppercase tracking-widest m-0 mb-0.5">
            Application details
          </p>
          <h2 className="text-xl font-bold text-white m-0">{application.company}</h2>
          <p className="text-sm text-[#c8e6df] mt-0.5 mb-0">{application.roleTitle}</p>
        </div>
        <span className="rounded-full bg-white/20 text-white text-xs font-bold px-3 py-1 whitespace-nowrap mt-1">
          {application.stage}
        </span>
      </div>

      {/* Meta grid */}
      <dl className="grid grid-cols-[repeat(5,minmax(120px,1fr))] gap-4 px-6 py-4 bg-[var(--color-primary)]/5 border-b border-[var(--color-border)]">
        {[
          { label: "Source", value: application.source },
          { label: "Location", value: application.location || "Not set" },
          { label: "Compensation", value: application.compensation || "Not set" },
          { label: "Employment type", value: application.employmentType },
          { label: "Posting URL", value: null, url: application.postingUrl }
        ].map(({ label, value, url }) => (
          <div key={label}>
            <dt className="text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide mb-1">
              {label}
            </dt>
            <dd className="text-sm text-[var(--color-foreground)] m-0 break-all">
              {url ? (
                <a className="text-[var(--color-primary)] hover:underline" href={url}>{url}</a>
              ) : value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--color-border)]">
        {/* Left column: Notes + Follow-ups */}
        <div className="divide-y divide-[var(--color-border)]">
          {/* Notes */}
          <section aria-label="Notes" className="p-5">
            <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-3">Notes</h3>
            {notes.length > 0 ? (
              <ol aria-label="Application notes" className="list-none p-0 m-0 grid gap-2 mb-4">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-2">
                    <time className="block text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide mb-1" dateTime={note.createdAt}>
                      {formatDate(note.createdAt)}
                    </time>
                    <span className="text-sm text-[var(--color-foreground)]">{note.body}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)] italic mb-4">No notes yet</p>
            )}
            <form className="grid gap-2 grid-cols-[1fr_auto]" onSubmit={handleNoteSubmit}>
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                Application note
                <Textarea
                  className="min-h-[60px]"
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Add a note…"
                  value={noteBody}
                />
              </label>
              <Button type="submit" className="self-end h-9 text-xs">Add note</Button>
            </form>
          </section>

          {/* Follow-ups */}
          <section aria-label="Follow-ups" className="p-5">
            <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-3">Follow-ups</h3>
            {followUps.length > 0 ? (
              <ol aria-label="Application follow-ups" className="list-none p-0 m-0 grid gap-2 mb-4">
                {followUps.map((followUp) => (
                  <li key={followUp.id} className="rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-2 flex items-start justify-between gap-2">
                    <div>
                      <time className="block text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide mb-0.5" dateTime={followUp.dueAt}>
                        {formatDate(followUp.dueAt)}
                      </time>
                      <span className="text-sm text-[var(--color-foreground)]">{followUp.note}</span>
                    </div>
                    {followUp.completedAt ? (
                      <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5 whitespace-nowrap">Done</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)] italic mb-4">No follow-ups scheduled</p>
            )}
            <form className="grid gap-2 grid-cols-[repeat(2,1fr)_auto]" onSubmit={handleFollowUpSubmit}>
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                Follow-up due date
                <Input
                  onChange={(e) => setFollowUpForm((c) => ({ ...c, dueAt: e.target.value }))}
                  type="datetime-local"
                  value={followUpForm.dueAt}
                />
              </label>
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                Follow-up note
                <Textarea
                  className="min-h-[40px]"
                  onChange={(e) => setFollowUpForm((c) => ({ ...c, note: e.target.value }))}
                  value={followUpForm.note}
                />
              </label>
              <Button type="submit" className="self-end h-9 text-xs">Create follow-up</Button>
            </form>
          </section>
        </div>

        {/* Right column: Interviews + Timeline */}
        <div className="divide-y divide-[var(--color-border)]">
          {/* Interviews */}
          <section aria-label="Interviews" className="p-5">
            <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-3">Interviews</h3>
            {interviews.length > 0 ? (
              <ol aria-label="Scheduled interviews" className="list-none p-0 m-0 grid gap-2 mb-4">
                {interviews.map((interview) => (
                  <li key={interview.id} className="rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <strong className="text-sm font-semibold">{interview.type}</strong>
                      <span className="text-[0.65rem] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-full px-2 py-0.5">{interview.outcome}</span>
                    </div>
                    <time className="block text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide" dateTime={interview.scheduledAt}>
                      {formatDate(interview.scheduledAt)}
                    </time>
                    {interview.notes ? <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{interview.notes}</p> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)] italic mb-4">No interviews scheduled</p>
            )}
            <form className="grid gap-2 grid-cols-[repeat(4,1fr)] items-end" onSubmit={handleInterviewSubmit}>
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
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
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                Date and time
                <Input
                  onChange={(e) =>
                    setInterviewForm((c) => ({ ...c, scheduledAt: e.target.value }))
                  }
                  type="datetime-local"
                  value={interviewForm.scheduledAt}
                />
              </label>
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                Interview notes
                <Textarea
                  className="min-h-[40px]"
                  onChange={(e) =>
                    setInterviewForm((c) => ({ ...c, notes: e.target.value }))
                  }
                  value={interviewForm.notes}
                />
              </label>
              <label className="grid gap-1 text-[0.7rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">
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
              <Button type="submit" className="col-span-4 h-9 text-xs">Schedule interview</Button>
            </form>
          </section>

          {/* Timeline */}
          <section aria-label="Timeline" className="p-5">
            <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-3">Timeline</h3>
            {timeline.length > 0 ? (
              <ol aria-label="Timeline events" className="list-none p-0 m-0 relative border-l-2 border-[var(--color-border)] ml-2">
                {timeline.map((event) => (
                  <li key={event.id} className="relative pl-5 pb-4 last:pb-0">
                    <span className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    <time className="block text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide" dateTime={event.occurredAt}>
                      {formatDate(event.occurredAt)}
                    </time>
                    <span className="text-sm text-[var(--color-foreground)]">{event.description}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)] italic">No timeline events yet</p>
            )}
          </section>
        </div>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
