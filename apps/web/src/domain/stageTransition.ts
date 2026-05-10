import type { ApplicationStage } from "./applicationStage";
import type { JobApplication, TimelineEvent } from "./jobOpportunity";

export type StageTransitionCommand = {
  applicationId: string;
  toStage: ApplicationStage;
};

export type StageTransitionFailure = {
  message: string;
};

export type StageTransitionResult =
  | { ok: true; application: JobApplication }
  | { ok: false; failure: StageTransitionFailure };

const nextStagesByStage: Record<ApplicationStage, ApplicationStage[]> = {
  Saved: ["Applied", "Withdrawn"],
  Applied: ["Screening", "Rejected", "Withdrawn"],
  Screening: ["Technical interview", "Rejected", "Withdrawn"],
  "Technical interview": ["Onsite", "Rejected", "Withdrawn"],
  Onsite: ["Offer", "Rejected", "Withdrawn"],
  Offer: ["Rejected", "Withdrawn"],
  Rejected: ["Applied"],
  Withdrawn: ["Applied"]
};

export function getNextStages(stage: ApplicationStage): ApplicationStage[] {
  return nextStagesByStage[stage];
}

export function transitionApplicationStage(
  application: JobApplication,
  command: StageTransitionCommand,
  event: TimelineEvent
): StageTransitionResult {
  if (application.id !== command.applicationId) {
    return {
      ok: false,
      failure: { message: "Application could not be found." }
    };
  }

  if (!getNextStages(application.stage).includes(command.toStage)) {
    return {
      ok: false,
      failure: {
        message: `Cannot move an application from ${application.stage} to ${command.toStage}.`
      }
    };
  }

  return {
    ok: true,
    application: {
      ...application,
      stage: command.toStage,
      timeline: [...application.timeline, event]
    }
  };
}
