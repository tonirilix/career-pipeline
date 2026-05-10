import type { Interview, JobApplication, TimelineEvent } from "./jobOpportunity";

export type ScheduleInterviewCommand = {
  applicationId: string;
  type: Interview["type"];
  scheduledAt: string;
  notes: string;
  outcome: Interview["outcome"];
};

export type ScheduleInterviewIds = {
  interviewId: string;
  timelineEventId: string;
  occurredAt: string;
};

export type ScheduleInterviewFailure = {
  message: string;
};

export type ScheduleInterviewResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: ScheduleInterviewFailure };

export function scheduleInterview(
  application: JobApplication,
  command: ScheduleInterviewCommand,
  ids: ScheduleInterviewIds
): ScheduleInterviewResult {
  if (application.id !== command.applicationId) {
    return {
      ok: false,
      failure: { message: "Application could not be found." }
    };
  }

  if (application.stage === "Saved") {
    return {
      ok: false,
      failure: {
        message:
          "Interviews can only be scheduled after an opportunity has been applied to."
      }
    };
  }

  if (!command.scheduledAt.trim()) {
    return {
      ok: false,
      failure: { message: "Interview date and time is required." }
    };
  }

  const interview: Interview = {
    id: ids.interviewId,
    type: command.type,
    scheduledAt: command.scheduledAt,
    notes: command.notes,
    outcome: command.outcome
  };
  const event: TimelineEvent = {
    id: ids.timelineEventId,
    occurredAt: ids.occurredAt,
    description: `Scheduled ${command.type} interview`
  };

  return {
    ok: true,
    application: {
      ...application,
      interviews: [...application.interviews, interview],
      timeline: [...application.timeline, event]
    }
  };
}
