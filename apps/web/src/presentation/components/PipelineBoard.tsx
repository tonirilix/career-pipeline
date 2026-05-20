import { useState } from "react";

import { type ApplicationStage } from "../../domain/applicationStage";
import type { JobApplication } from "../../domain/jobOpportunity";
import { ApplicationCard } from "./ApplicationCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const PHASES: { label: string; stages: ApplicationStage[] }[] = [
  { label: "Active", stages: ["Saved", "Applied"] },
  { label: "Interviewing", stages: ["Screening", "Technical interview", "Onsite"] },
  { label: "Closed", stages: ["Offer", "Rejected", "Withdrawn"] }
];

const CLOSED_STAGES: ApplicationStage[] = ["Offer", "Rejected", "Withdrawn"];

type PipelineBoardProps = {
  applications: JobApplication[];
  onStageChange: (application: JobApplication, toStage: ApplicationStage) => Promise<void>;
  onViewDetails: (applicationId: string) => void;
};

export function PipelineBoard({ applications, onStageChange, onViewDetails }: PipelineBoardProps) {
  const [closedCollapsed, setClosedCollapsed] = useState(true);
  const hasClosedApps = applications.some((a) => CLOSED_STAGES.includes(a.stage));

  // Force-expand when apps exist in closed stages; otherwise respect toggle
  const isClosedCollapsed = hasClosedApps ? false : closedCollapsed;

  return (
    <section aria-label="Application pipeline" className="overflow-x-auto pb-2">
      {PHASES.map(({ label, stages }) => {
        const isClosed = label === "Closed";
        const collapsed = isClosed && isClosedCollapsed;

        return (
          <section key={label} aria-label={`${label} phase`} className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              {isClosed ? (
                <button
                  type="button"
                  onClick={() => setClosedCollapsed((c) => !c)}
                  className="flex items-center gap-2 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                  <span>{collapsed ? "▶" : "▼"}</span>
                  {label}
                </button>
              ) : (
                <span className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">
                  {label}
                </span>
              )}
            </div>

            {!collapsed && (
              <div
                className="grid gap-0 overflow-x-auto border border-border divide-x divide-border"
                style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(200px, 1fr))` }}
              >
                {stages.map((stage) => {
                  const stageApplications = applications.filter((a) => a.stage === stage);
                  return (
                    <article key={stage}>
                      <Card className="min-h-[280px] rounded-none shadow-none border-0">
                        <CardHeader className="flex-row items-center justify-between space-y-0 py-2 px-3 border-b border-border">
                          <CardTitle className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                            {stage}
                          </CardTitle>
                          <span
                            aria-label={`${stage} applications`}
                            className={`text-[0.65rem] font-bold tabular-nums ${
                              stageApplications.length > 0 ? "text-accent" : "text-muted-foreground"
                            }`}
                          >
                            {stageApplications.length}
                          </span>
                        </CardHeader>
                        <CardContent className="px-2 pb-2 pt-2">
                          {stageApplications.length > 0 ? (
                            <div className="grid gap-2">
                              {stageApplications.map((application) => (
                                <ApplicationCard
                                  application={application}
                                  key={application.id}
                                  onStageChange={onStageChange}
                                  onViewDetails={onViewDetails}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-[0.6rem] text-muted-foreground mt-3 text-center uppercase tracking-widest">
                              empty
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </section>
  );
}
