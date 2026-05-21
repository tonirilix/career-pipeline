import { useEffect, useState } from "react";

import {
  type ApplicationStage,
  applicationStages
} from "../../domain/applicationStage";
import { isClosedApplication } from "../../domain/closedWork";
import type { JobApplication } from "../../domain/jobOpportunity";
import { getNextStages } from "../../domain/stageTransition";
import { Button } from "./ui/button";
import { Select } from "./ui/select";

type ApplicationCardProps = {
  application: JobApplication;
  onStageChange: (
    application: JobApplication,
    toStage: ApplicationStage
  ) => Promise<void>;
  onViewDetails: (applicationId: string) => void;
};

export function ApplicationCard({
  application,
  onStageChange,
  onViewDetails
}: ApplicationCardProps) {
  const [selectedStage, setSelectedStage] = useState<ApplicationStage>(
    application.stage
  );
  const nextStages = getNextStages(application.stage);
  const primaryNextStage = nextStages[0];
  const isClosed = isClosedApplication(application);
  const metadata = [
    application.source,
    application.location,
    application.compensation || application.employmentType
  ].filter(Boolean);

  useEffect(() => {
    setSelectedStage(application.stage);
  }, [application.stage]);

  return (
    <div
      className={`border border-border border-l-2 bg-card px-3 py-2.5 transition-colors hover:bg-muted/30 hover:border-muted-foreground ${
        isClosed ? "border-l-muted-foreground opacity-75" : "border-l-accent"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[0.8rem] font-bold text-foreground leading-tight">
            {application.company}
          </h3>
          <p className="text-[0.68rem] text-muted-foreground leading-tight mt-0.5">
            {application.roleTitle}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center border border-border px-1 py-0 text-[0.55rem] font-semibold uppercase tracking-wider ${
            isClosed ? "text-muted-foreground" : "text-accent"
          }`}
        >
          {isClosed ? "Closed" : application.stage}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[0.6rem] text-muted-foreground">
        {metadata.map((item) => (
          <span
            className="inline-flex max-w-full items-center gap-1 truncate before:h-1 before:w-1 before:shrink-0 before:bg-border"
            key={item}
          >
            <span className="truncate">{item}</span>
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Button
          aria-label={`View ${application.company} details`}
          className="h-11 md:h-7 px-3 text-[0.65rem] rounded-none bg-transparent hover:bg-muted"
          variant="outline"
          onClick={() => onViewDetails(application.id)}
          type="button"
        >
          Details
        </Button>
        {primaryNextStage ? (
          <Button
            aria-label={stageActionLabel(application, primaryNextStage)}
            className="h-11 md:h-7 px-3 text-[0.65rem] rounded-none"
            onClick={() => void onStageChange(application, primaryNextStage)}
            type="button"
          >
            {compactStageActionLabel(application, primaryNextStage)}
          </Button>
        ) : null}
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto] items-end gap-1.5 border-t border-border pt-2">
        <div className="grid gap-0.5">
          <span
            aria-hidden="true"
            className="text-[0.55rem] font-bold text-muted-foreground uppercase tracking-widest"
          >
            Stage
          </span>
          <Select
            aria-label={`Move ${application.company} to stage`}
            className="h-11 md:h-8 text-[0.65rem] rounded-none px-2"
            onChange={(e) =>
              setSelectedStage(e.target.value as ApplicationStage)
            }
            value={selectedStage}
          >
            {applicationStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </Select>
        </div>
        <Button
          aria-label={`Update ${application.company} stage`}
          className="self-end h-11 md:h-8 px-2 text-[0.65rem] rounded-none bg-transparent hover:bg-muted"
          variant="outline"
          onClick={() => void onStageChange(application, selectedStage)}
          type="button"
        >
          Set
        </Button>
      </div>
    </div>
  );
}

function stageActionLabel(
  application: JobApplication,
  nextStage: ApplicationStage
) {
  if (application.stage === "Saved" && nextStage === "Applied") {
    return `Mark ${application.company} as applied`;
  }

  if (
    (application.stage === "Rejected" || application.stage === "Withdrawn") &&
    nextStage === "Applied"
  ) {
    return `Reopen ${application.company}`;
  }

  return `Move ${application.company} to ${nextStage}`;
}

function compactStageActionLabel(
  application: JobApplication,
  nextStage: ApplicationStage
) {
  if (application.stage === "Saved" && nextStage === "Applied") {
    return "Apply";
  }

  if (
    (application.stage === "Rejected" || application.stage === "Withdrawn") &&
    nextStage === "Applied"
  ) {
    return "Reopen";
  }

  return "Advance";
}
