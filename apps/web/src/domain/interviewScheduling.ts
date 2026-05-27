import { isClosedApplication } from "./closedWork";
import type { Interview, JobApplication, TimelineEvent } from "./jobOpportunity";

export type ScheduleInterviewCommand = {
  applicationId: string;
  type: Interview["type"];
  scheduledAt: string;
  notes: string;
};

export type RecordInterviewOutcomeCommand = {
  applicationId: string;
  interviewId: string;
  outcome: Exclude<Interview["outcome"], "Scheduled">;
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

export type RecordInterviewOutcomeResult =
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

  if (
    application.stage === "Saved" ||
    application.stage === "Offer" ||
    isClosedApplication(application)
  ) {
    return {
      ok: false,
      failure: {
        message:
          "Interviews can only be scheduled for active applications before the offer stage."
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
    outcome: "Scheduled"
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

export function recordInterviewOutcome(
  application: JobApplication,
  command: RecordInterviewOutcomeCommand,
  ids: { timelineEventId: string; occurredAt: string }
): RecordInterviewOutcomeResult {
  if (application.id !== command.applicationId) {
    return {
      ok: false,
      failure: { message: "Application could not be found." }
    };
  }

  if (!application.interviews.some((interview) => interview.id === command.interviewId)) {
    return {
      ok: false,
      failure: { message: "Interview could not be found." }
    };
  }

  const event: TimelineEvent = {
    id: ids.timelineEventId,
    occurredAt: ids.occurredAt,
    description: `Recorded interview outcome: ${command.outcome}`
  };

  return {
    ok: true,
    application: {
      ...application,
      interviews: application.interviews.map((interview) =>
        interview.id === command.interviewId
          ? { ...interview, outcome: command.outcome }
          : interview
      ),
      timeline: [...application.timeline, event]
    }
  };
}
