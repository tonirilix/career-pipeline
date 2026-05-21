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

const GRID_COLS: Record<number, string> = {
  2: "md:grid-cols-2 xl:grid-cols-[repeat(2,minmax(260px,380px))]",
  3: "md:grid-cols-3 xl:grid-cols-[repeat(3,minmax(260px,360px))]",
};

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
    <section aria-label="Application pipeline" className="pb-1">
      {PHASES.map(({ label, stages }) => {
        const isClosed = label === "Closed";
        const collapsed = isClosed && isClosedCollapsed;

        return (
          <section key={label} aria-label={`${label} phase`} className="mb-3 last:mb-0">
            <div className="flex items-center gap-2 mb-1.5">
              {isClosed ? (
                <button
                  type="button"
                  onClick={() => setClosedCollapsed((c) => !c)}
                  aria-expanded={!collapsed}
                  className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                  <span aria-hidden="true">{collapsed ? "▶" : "▼"}</span>
                  {label}
                </button>
              ) : (
                <span className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest py-1">
                  {label}
                </span>
              )}
            </div>

            {!collapsed && (
              <div
                className={`grid grid-cols-1 ${GRID_COLS[stages.length] ?? ""} gap-2`}
              >
                {stages.map((stage) => {
                  const stageApplications = applications.filter((a) => a.stage === stage);
                  return (
                    <article key={stage}>
                      <Card className="min-h-[104px] rounded-none shadow-none border border-border bg-background/40">
                        <CardHeader className="flex-row items-center justify-between space-y-0 py-1.5 px-2.5 border-b border-border">
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
                        <CardContent className="px-1.5 pb-1.5 pt-1.5">
                          {stageApplications.length > 0 ? (
                            <div className="grid gap-1.5">
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
                            <p className="text-[0.6rem] text-muted-foreground py-3 text-center uppercase tracking-widest">
                              No applications
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
