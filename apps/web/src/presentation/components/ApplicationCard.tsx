import { useState } from "react";

import {
  type ApplicationStage,
  applicationStages
} from "../../domain/applicationStage";
import { isClosedApplication } from "../../domain/closedWork";
import type { JobApplication } from "../../domain/jobOpportunity";
import { getNextStages } from "../../domain/stageTransition";
import { Badge } from "./ui/badge";
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

  return (
    <div
      className={`border border-border p-3 bg-card transition-colors hover:border-muted-foreground ${
        isClosed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <h3 className="text-xs font-bold text-foreground leading-tight">
          {application.company}
        </h3>
        {isClosed ? (
          <Badge variant="outline" className="text-[0.55rem] px-1 py-0 shrink-0 rounded-none text-muted-foreground border-border uppercase tracking-wider">
            Closed
          </Badge>
        ) : null}
      </div>

      <p className="text-[0.65rem] text-muted-foreground mb-2 leading-tight">
        {application.roleTitle}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        <span className="inline-flex items-center border border-border px-1.5 py-0.5 text-[0.55rem] font-medium text-muted-foreground uppercase tracking-wider">
          {application.source}
        </span>
        {application.location ? (
          <span className="inline-flex items-center border border-border px-1.5 py-0.5 text-[0.55rem] font-medium text-muted-foreground">
            {application.location}
          </span>
        ) : null}
      </div>

      <Button
        className="w-full h-7 text-[0.65rem] mb-1.5 rounded-none bg-transparent hover:bg-muted"
        variant="outline"
        onClick={() => onViewDetails(application.id)}
        type="button"
      >
        View {application.company} details
      </Button>

      {primaryNextStage ? (
        <Button
          className="w-full h-7 text-[0.65rem] mb-2 rounded-none"
          onClick={() => void onStageChange(application, primaryNextStage)}
          type="button"
        >
          {stageActionLabel(application, primaryNextStage)}
        </Button>
      ) : null}

      <div className="border-t border-border pt-2 mt-1">
        <label className="grid gap-1 text-[0.55rem] font-bold text-muted-foreground uppercase tracking-widest">
          Move {application.company} to stage
          <Select
            className="h-7 text-[0.65rem] rounded-none"
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
        </label>
        <Button
          className="w-full h-7 text-[0.65rem] mt-1.5 rounded-none bg-transparent hover:bg-muted"
          variant="outline"
          onClick={() => void onStageChange(application, selectedStage)}
          type="button"
        >
          Update {application.company} stage
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
