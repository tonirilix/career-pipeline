import type { ApplicationStage } from "../domain/applicationStage";
import { isActiveApplication } from "../domain/closedWork";
import type { JobApplication } from "../domain/jobOpportunity";
import type { RoleRecord } from "../domain/roleDiscovery";

export const todayItemTypes = [
  "Follow-up",
  "Prep",
  "Approval",
  "Offer",
  "Triage"
] as const;

export type TodayItemType = (typeof todayItemTypes)[number];

export type TodayItem = {
  id: string;
  type: TodayItemType;
  /** The single thing to do, phrased as an imperative. */
  action: string;
  company: string;
  roleTitle: string;
  /** Null for items that do not belong to a job application. */
  stage: ApplicationStage | null;
  /** Computed from stored data only. Never model output. */
  rationale: string;
  /**
   * Only a date the item is genuinely working towards: a reminder's due date or
   * an interview's scheduled date. Null everywhere else — elapsed time is not a
   * deadline and does not belong in this field.
   */
  dueAt: string | null;
  isOverdue: boolean;
  applicationId: string | null;
  followUpId: string | null;
  interviewId: string | null;
  roleId: string | null;
};

export type TodayProjection = {
  now: TodayItem[];
  thisWeek: TodayItem[];
  waiting: TodayItem[];
  /** Now plus This week — what the rail and the header both count. */
  actionableCount: number;
};

export type TodayProjectionInput = {
  /**
   * The unfiltered application list. Pipeline's search, stage, source, sort, and
   * saved-view controls must not be able to empty the user's day.
   */
  applications: JobApplication[];
  roles?: RoleRecord[];
  now: number;
};

const DAY = 24 * 60 * 60 * 1000;
const NOW_HORIZON = 3 * DAY;
const WEEK_HORIZON = 7 * DAY;

const noRoles: RoleRecord[] = [];

export function projectToday({
  applications,
  roles = noRoles,
  now
}: TodayProjectionInput): TodayProjection {
  const activeApplications = applications.filter(isActiveApplication);

  const items = [
    ...activeApplications.flatMap((application) => followUpItems(application, now)),
    ...activeApplications.flatMap((application) => prepItems(application, now)),
    ...activeApplications.flatMap((application) => approvalItems(application, now)),
    ...activeApplications.flatMap((application) => offerItems(application, now)),
    ...roles.flatMap(triageItems)
  ];

  const grouped = {
    now: [] as TodayItem[],
    thisWeek: [] as TodayItem[],
    waiting: [] as TodayItem[]
  };

  for (const item of items) {
    grouped[groupFor(item, now)].push(item);
  }

  grouped.now.sort(byDueProximity);
  grouped.thisWeek.sort(byDueProximity);
  grouped.waiting.sort(byDueProximity);

  return {
    ...grouped,
    actionableCount: grouped.now.length + grouped.thisWeek.length
  };
}

/**
 * Overdue or due within three days is Now. The remainder of the coming week,
 * plus everything awaiting the user's own review, is This week. A dated item
 * further out has nothing to do until the date approaches, so it waits.
 */
function groupFor(item: TodayItem, now: number): "now" | "thisWeek" | "waiting" {
  const dueTime = timeOrInfinity(item.dueAt);

  if (!Number.isFinite(dueTime)) return "thisWeek";
  if (dueTime <= now + NOW_HORIZON) return "now";
  if (dueTime <= now + WEEK_HORIZON) return "thisWeek";
  return "waiting";
}

function followUpItems(application: JobApplication, now: number): TodayItem[] {
  return application.followUps
    .filter((followUp) => !followUp.completedAt)
    .map((followUp) => {
      const dueTime = timeOrInfinity(followUp.dueAt);
      const isOverdue = Number.isFinite(dueTime) && dueTime < now;

      return {
        id: `follow-up:${followUp.id}`,
        type: "Follow-up" as const,
        action: "Follow up",
        company: application.company,
        roleTitle: application.roleTitle,
        stage: application.stage,
        rationale: joinClauses([
          isOverdue
            ? `Follow-up was due ${elapsedPhrase(dueTime, now)}`
            : `Follow-up due ${upcomingPhrase(dueTime, now)}`,
          lastActivityClause(application, now)
        ]),
        dueAt: Number.isFinite(dueTime) ? followUp.dueAt : null,
        isOverdue,
        applicationId: application.id,
        followUpId: followUp.id,
        interviewId: null,
        roleId: null
      };
    });
}

function prepItems(application: JobApplication, now: number): TodayItem[] {
  return application.interviews
    .filter((interview) => timeOrInfinity(interview.scheduledAt) >= now)
    .map((interview) => ({
      id: `prep:${interview.id}`,
      type: "Prep" as const,
      action: `Prepare for ${interview.type}`,
      company: application.company,
      roleTitle: application.roleTitle,
      stage: application.stage,
      rationale: joinClauses([
        `Interview ${upcomingPhrase(timeOrInfinity(interview.scheduledAt), now)}`,
        lastActivityClause(application, now)
      ]),
      dueAt: interview.scheduledAt,
      // A scheduled date in the future cannot be overdue.
      isOverdue: false,
      applicationId: application.id,
      followUpId: null,
      interviewId: interview.id,
      roleId: null
    }));
}

function approvalItems(application: JobApplication, now: number): TodayItem[] {
  if (application.stage !== "Saved") return [];

  return [
    {
      id: `approval:${application.id}`,
      type: "Approval" as const,
      action: "Submit application",
      company: application.company,
      roleTitle: application.roleTitle,
      stage: application.stage,
      rationale: joinClauses([savedClause(application, now), "not submitted yet"]),
      dueAt: null,
      isOverdue: false,
      applicationId: application.id,
      followUpId: null,
      interviewId: null,
      roleId: null
    }
  ];
}

function offerItems(application: JobApplication, now: number): TodayItem[] {
  if (application.stage !== "Offer") return [];

  return [
    {
      id: `offer:${application.id}`,
      type: "Offer" as const,
      action: "Decide on offer",
      company: application.company,
      roleTitle: application.roleTitle,
      stage: application.stage,
      // The domain holds no offer deadline, so this carries no date and says so
      // only in elapsed terms.
      rationale: joinClauses([
        "Offer stage",
        lastActivityClause(application, now),
        "no decision recorded"
      ]),
      dueAt: null,
      isOverdue: false,
      applicationId: application.id,
      followUpId: null,
      interviewId: null,
      roleId: null
    }
  ];
}

function triageItems(role: RoleRecord): TodayItem[] {
  if (role.decisionStatus !== "New") return [];

  return [
    {
      id: `triage:${role.id}`,
      type: "Triage" as const,
      action: "Triage role",
      company: role.company,
      roleTitle: role.title,
      stage: null,
      rationale: joinClauses(["No decision recorded"]),
      dueAt: null,
      isOverdue: false,
      applicationId: null,
      followUpId: null,
      interviewId: null,
      roleId: role.id
    }
  ];
}

function byDueProximity(left: TodayItem, right: TodayItem) {
  return timeOrInfinity(left.dueAt) - timeOrInfinity(right.dueAt);
}

function lastActivityClause(application: JobApplication, now: number) {
  const latest = Math.max(
    ...application.timeline.map((event) => timeOrZero(event.occurredAt)),
    0
  );

  if (latest === 0) return null;

  return `last activity ${elapsedPhrase(latest, now)}`;
}

function savedClause(application: JobApplication, now: number) {
  const times = application.timeline
    .map((event) => timeOrZero(event.occurredAt))
    .filter((time) => time > 0);

  if (times.length === 0) return null;

  return `Saved ${elapsedPhrase(Math.min(...times), now)}`;
}

function joinClauses(clauses: (string | null)[]) {
  const kept = clauses.filter((clause): clause is string => !!clause);

  if (kept.length === 0) return "";

  return `${kept.join("; ")}.`;
}

function elapsedPhrase(time: number, now: number) {
  const days = Math.floor((now - time) / DAY);

  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function upcomingPhrase(time: number, now: number) {
  if (!Number.isFinite(time)) return "with no date set";

  const days = Math.floor((time - now) / DAY);

  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function timeOrInfinity(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function timeOrZero(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
