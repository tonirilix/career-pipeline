import type {
  FollowUpReminder,
  JobApplication,
  TimelineEvent
} from "./jobOpportunity";

export type CreateFollowUpReminderCommand = {
  applicationId: string;
  dueAt: string;
  note: string;
};

export type CreateFollowUpReminderIds = {
  reminderId: string;
  timelineEventId: string;
  occurredAt: string;
};

export type FollowUpReminderFailure = {
  message: string;
};

export type CreateFollowUpReminderResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: FollowUpReminderFailure };

export type CompleteFollowUpReminderCommand = {
  applicationId: string;
  reminderId: string;
};

export type CompleteFollowUpReminderIds = {
  timelineEventId: string;
  completedAt: string;
};

export type CompleteFollowUpReminderResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: FollowUpReminderFailure };

export type ActiveFollowUpGroups = {
  overdue: FollowUpReminder[];
  upcoming: FollowUpReminder[];
};

export function createFollowUpReminder(
  application: JobApplication,
  command: CreateFollowUpReminderCommand,
  ids: CreateFollowUpReminderIds
): CreateFollowUpReminderResult {
  if (!command.dueAt.trim()) {
    return {
      ok: false,
      failure: { message: "Follow-up due date is required." }
    };
  }

  const latestInteractionAt = latestTimelineInteractionAt(application);

  if (
    latestInteractionAt &&
    new Date(command.dueAt).getTime() <= latestInteractionAt.getTime()
  ) {
    return {
      ok: false,
      failure: {
        message: "Follow-up due date must be after the latest interaction."
      }
    };
  }

  const reminder: FollowUpReminder = {
    id: ids.reminderId,
    applicationId: command.applicationId,
    dueAt: command.dueAt,
    note: command.note,
    completedAt: null
  };
  const event: TimelineEvent = {
    id: ids.timelineEventId,
    occurredAt: ids.occurredAt,
    description: "Created follow-up reminder"
  };

  return {
    ok: true,
    application: {
      ...application,
      followUps: [...application.followUps, reminder],
      timeline: [...application.timeline, event]
    }
  };
}

export function classifyActiveFollowUps(
  followUps: FollowUpReminder[],
  now: string
): ActiveFollowUpGroups {
  const nowTime = new Date(now).getTime();

  return sortFollowUpsByDueDate(
    followUps.filter((followUp) => !followUp.completedAt)
  ).reduce<ActiveFollowUpGroups>(
    (groups, followUp) => {
      if (new Date(followUp.dueAt).getTime() < nowTime) {
        return { ...groups, overdue: [...groups.overdue, followUp] };
      }

      return { ...groups, upcoming: [...groups.upcoming, followUp] };
    },
    { overdue: [], upcoming: [] }
  );
}

export function completeFollowUpReminder(
  application: JobApplication,
  command: CompleteFollowUpReminderCommand,
  ids: CompleteFollowUpReminderIds
): CompleteFollowUpReminderResult {
  const event: TimelineEvent = {
    id: ids.timelineEventId,
    occurredAt: ids.completedAt,
    description: "Completed follow-up reminder"
  };

  return {
    ok: true,
    application: {
      ...application,
      followUps: application.followUps.map((followUp) =>
        followUp.id === command.reminderId
          ? { ...followUp, completedAt: ids.completedAt }
          : followUp
      ),
      timeline: [...application.timeline, event]
    }
  };
}

export function sortFollowUpsByDueDate(followUps: FollowUpReminder[]) {
  return [...followUps].sort(
    (left, right) =>
      new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
  );
}

function latestTimelineInteractionAt(application: JobApplication) {
  const latest = application.timeline.reduce<Date | null>((current, event) => {
    const occurredAt = new Date(event.occurredAt);

    if (!current || occurredAt.getTime() > current.getTime()) {
      return occurredAt;
    }

    return current;
  }, null);

  return latest;
}
