import {
  type ApplicationStage,
  applicationStages
} from "../../domain/applicationStage";
import type { JobApplication } from "../../domain/jobOpportunity";
import { ApplicationCard } from "./ApplicationCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type PipelineBoardProps = {
  applications: JobApplication[];
  onStageChange: (
    application: JobApplication,
    toStage: ApplicationStage
  ) => Promise<void>;
  onViewDetails: (applicationId: string) => void;
};

export function PipelineBoard({
  applications,
  onStageChange,
  onViewDetails
}: PipelineBoardProps) {
  return (
    <section
      aria-label="Application pipeline"
      className="grid gap-0 grid-cols-[repeat(8,minmax(200px,1fr))] overflow-x-auto border border-border divide-x divide-border mb-5"
    >
      {applicationStages.map((stage) => {
        const stageApplications = applications.filter(
          (application) => application.stage === stage
        );

        return (
          <article key={stage}>
            <Card className="min-h-[320px] rounded-none shadow-none border-0">
              <CardHeader className="flex-row items-center justify-between space-y-0 py-2 px-3 border-b border-border">
                <CardTitle className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                  {stage}
                </CardTitle>
                <span
                  aria-label={`${stage} applications`}
                  className={`text-[0.65rem] font-bold tabular-nums ${
                    stageApplications.length > 0
                      ? "text-accent"
                      : "text-muted-foreground"
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
    </section>
  );
}
