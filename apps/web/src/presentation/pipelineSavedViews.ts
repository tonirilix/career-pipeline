import type { JobApplication } from "../domain/jobOpportunity";
import { isActiveApplication, isClosedApplication } from "../domain/closedWork";

export type PipelineSavedView =
  | "needs-attention"
  | "active"
  | "interviewing"
  | "offers"
  | "closed"
  | "all";

export type PipelineSavedViewDefinition = {
  id: PipelineSavedView;
  label: string;
  description: string;
};

export const pipelineSavedViews: PipelineSavedViewDefinition[] = [
  {
    id: "needs-attention",
    label: "Needs attention",
    description: "Applications with open follow-ups."
  },
  {
    id: "active",
    label: "Active",
    description: "Open opportunities across the pipeline."
  },
  {
    id: "interviewing",
    label: "Interviewing",
    description: "Screening, technical, and onsite stages."
  },
  {
    id: "offers",
    label: "Offers",
    description: "Offer-stage opportunities."
  },
  {
    id: "closed",
    label: "Closed",
    description: "Rejected and withdrawn applications."
  },
  {
    id: "all",
    label: "All",
    description: "Every application."
  }
];

export function filterApplicationsBySavedView(
  applications: JobApplication[],
  savedView: PipelineSavedView
) {
  if (savedView === "all") return applications;

  return applications.filter((application) => {
    if (savedView === "needs-attention") {
      return (
        isActiveApplication(application) &&
        application.followUps.some((followUp) => !followUp.completedAt)
      );
    }

    if (savedView === "active") {
      return isActiveApplication(application);
    }

    if (savedView === "interviewing") {
      return ["Screening", "Technical interview", "Onsite"].includes(
        application.stage
      );
    }

    if (savedView === "offers") {
      return application.stage === "Offer";
    }

    return isClosedApplication(application);
  });
}

export function getPipelineSavedViewLabel(savedView: PipelineSavedView) {
  return (
    pipelineSavedViews.find((view) => view.id === savedView)?.label ??
    "Pipeline view"
  );
}
