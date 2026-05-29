import { applicationStages, type ApplicationStage } from "../domain/applicationStage";
import { isActiveApplication } from "../domain/closedWork";
import type {
  FollowUpReminder,
  JobApplication,
  JobSource
} from "../domain/jobOpportunity";
import type { PipelineSortOption } from "./ports/pipelineControls";

export type FollowUpWorkItem = {
  application: JobApplication;
  followUp: FollowUpReminder;
};

export type StageCount = {
  stage: ApplicationStage;
  count: number;
};

export type JobApplicationProjectionControls = {
  stageFilter: ApplicationStage | "All";
  sourceFilter: JobSource | "All";
  searchTerm: string;
  sortBy: PipelineSortOption;
};

export type JobApplicationProjectionInput = {
  applications: JobApplication[];
  controls: JobApplicationProjectionControls;
  now: number;
  selectedApplicationId: string | null;
};

export type JobApplicationProjection = {
  activeApplicationCount: number;
  overdueFollowUpItems: FollowUpWorkItem[];
  selectedApplication: JobApplication | undefined;
  stageCounts: StageCount[];
  upcomingFollowUpItems: FollowUpWorkItem[];
  visibleApplications: JobApplication[];
};

export function projectJobApplications({
  applications,
  controls,
  now,
  selectedApplicationId
}: JobApplicationProjectionInput): JobApplicationProjection {
  const normalizedSearchTerm = controls.searchTerm.trim().toLowerCase();
  const visibleApplications = sortApplications(
    applications.filter(
      (application) =>
        matchesStageFilter(application, controls.stageFilter) &&
        matchesSourceFilter(application, controls.sourceFilter) &&
        matchesSearchTerm(application, normalizedSearchTerm)
    ),
    controls.sortBy
  );
  const activeFollowUpItems = applications
    .filter(isActiveApplication)
    .flatMap((application) =>
      application.followUps
        .filter((followUp) => !followUp.completedAt)
        .map((followUp) => ({ application, followUp }))
    )
    .sort(compareFollowUpItems);

  return {
    activeApplicationCount: applications.filter(isActiveApplication).length,
    overdueFollowUpItems: activeFollowUpItems.filter(({ followUp }) =>
      isBeforeTime(followUp.dueAt, now)
    ),
    selectedApplication: applications.find(
      (application) => application.id === selectedApplicationId
    ),
    stageCounts: applicationStages.map((stage) => ({
      stage,
      count: applications.filter((application) => application.stage === stage).length
    })),
    upcomingFollowUpItems: activeFollowUpItems.filter(({ followUp }) =>
      isAtOrAfterTime(followUp.dueAt, now)
    ),
    visibleApplications
  };
}

function matchesStageFilter(
  application: JobApplication,
  stageFilter: ApplicationStage | "All"
) {
  return stageFilter === "All" || application.stage === stageFilter;
}

function matchesSourceFilter(
  application: JobApplication,
  sourceFilter: JobSource | "All"
) {
  return sourceFilter === "All" || application.source === sourceFilter;
}

function matchesSearchTerm(application: JobApplication, normalizedSearchTerm: string) {
  return (
    !normalizedSearchTerm ||
    application.company.toLowerCase().includes(normalizedSearchTerm) ||
    application.roleTitle.toLowerCase().includes(normalizedSearchTerm)
  );
}

function compareFollowUpItems(left: FollowUpWorkItem, right: FollowUpWorkItem) {
  return dateTimeOrInfinity(left.followUp.dueAt) - dateTimeOrInfinity(right.followUp.dueAt);
}

function sortApplications(
  applications: JobApplication[],
  sortBy: PipelineSortOption
) {
  if (sortBy === "created") return applications;

  return [...applications].sort((left, right) => {
    if (sortBy === "lastActivity") {
      return latestActivityTime(right) - latestActivityTime(left);
    }
    return earliestActiveFollowUpTime(left) - earliestActiveFollowUpTime(right);
  });
}

function latestActivityTime(application: JobApplication) {
  return Math.max(
    ...application.timeline.map((event) => dateTimeOrZero(event.occurredAt)),
    0
  );
}

function earliestActiveFollowUpTime(application: JobApplication) {
  const activeDueTimes = application.followUps
    .filter((followUp) => !followUp.completedAt)
    .map((followUp) => dateTimeOrInfinity(followUp.dueAt));

  if (activeDueTimes.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...activeDueTimes);
}

function isBeforeTime(value: string, referenceTime: number) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time < referenceTime;
}

function isAtOrAfterTime(value: string, referenceTime: number) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= referenceTime;
}

function dateTimeOrZero(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function dateTimeOrInfinity(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}
