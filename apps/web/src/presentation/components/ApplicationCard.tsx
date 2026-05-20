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
      className={`rounded-lg border p-3 bg-white shadow-sm transition-shadow hover:shadow-md ${
        isClosed ? "border-red-200 bg-red-50/40 opacity-80" : "border-[var(--color-border)]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)] leading-tight">
          {application.company}
        </h3>
        {isClosed ? (
          <Badge variant="destructive" className="text-[0.65rem] px-1.5 py-0 shrink-0">
            Closed
          </Badge>
        ) : null}
      </div>

      <p className="text-xs text-[var(--color-muted-foreground)] mb-2 leading-tight">
        {application.roleTitle}
      </p>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1 mb-3">
        <span className="inline-flex items-center rounded-full bg-[var(--color-muted)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--color-muted-foreground)]">
          {application.source}
        </span>
        {application.location ? (
          <span className="inline-flex items-center rounded-full bg-[var(--color-muted)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--color-muted-foreground)]">
            {application.location}
          </span>
        ) : null}
      </div>

      {/* Actions */}
      <Button
        className="w-full h-7 text-xs mb-1.5"
        variant="outline"
        onClick={() => onViewDetails(application.id)}
        type="button"
      >
        View {application.company} details
      </Button>

      {primaryNextStage ? (
        <Button
          className="w-full h-7 text-xs mb-2"
          onClick={() => void onStageChange(application, primaryNextStage)}
          type="button"
        >
          {stageActionLabel(application, primaryNextStage)}
        </Button>
      ) : null}

      {/* Stage update */}
      <div className="border-t border-[var(--color-border)] pt-2 mt-1">
        <label className="grid gap-1 text-[0.65rem] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
          Move {application.company} to stage
          <Select
            className="h-8 text-xs"
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
          className="w-full h-7 text-xs mt-1.5"
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
