import type {
  ApplicationNote,
  JobApplication,
  TimelineEvent
} from "./jobOpportunity";

export type AddApplicationNoteCommand = {
  applicationId: string;
  body: string;
};

export type AddApplicationNoteIds = {
  noteId: string;
  timelineEventId: string;
  occurredAt: string;
};

export type ApplicationNoteFailure = {
  message: string;
};

export type AddApplicationNoteResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: ApplicationNoteFailure };

export function addApplicationNote(
  application: JobApplication,
  command: AddApplicationNoteCommand,
  ids: AddApplicationNoteIds
): AddApplicationNoteResult {
  const note: ApplicationNote = {
    id: ids.noteId,
    body: command.body,
    createdAt: ids.occurredAt
  };
  const event: TimelineEvent = {
    id: ids.timelineEventId,
    occurredAt: ids.occurredAt,
    description: "Added note"
  };

  return {
    ok: true,
    application: {
      ...application,
      notes: [...application.notes, note],
      timeline: [...application.timeline, event]
    }
  };
}
