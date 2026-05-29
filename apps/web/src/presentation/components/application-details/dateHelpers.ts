import type {
  ApplicationNote,
  FollowUpReminder,
  Interview,
  TimelineEvent
} from "../../../domain/jobOpportunity";

export function compareTimelineEvents(left: TimelineEvent, right: TimelineEvent) {
  return new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime();
}

export function compareNotes(left: ApplicationNote, right: ApplicationNote) {
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

export function compareInterviews(left: Interview, right: Interview) {
  return new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime();
}

export function compareFollowUps(left: FollowUpReminder, right: FollowUpReminder) {
  return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
}

export function combineDateAndTime(date: string, time: string) {
  return `${date}T${time}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
