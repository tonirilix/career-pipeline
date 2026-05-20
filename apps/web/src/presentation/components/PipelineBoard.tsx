import {
  type ApplicationStage,
  applicationStages
} from "../../domain/applicationStage";
import type { JobApplication } from "../../domain/jobOpportunity";
import { ApplicationCard } from "./ApplicationCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const stageAccent: Record<ApplicationStage, string> = {
  Saved: "border-t-slate-400",
  Applied: "border-t-blue-400",
  Screening: "border-t-indigo-400",
  "Technical interview": "border-t-violet-500",
  Onsite: "border-t-purple-500",
  Offer: "border-t-emerald-500",
  Rejected: "border-t-red-400",
  Withdrawn: "border-t-gray-400"
};

const stageBadge: Record<ApplicationStage, string> = {
  Saved: "bg-slate-100 text-slate-700",
  Applied: "bg-blue-100 text-blue-700",
  Screening: "bg-indigo-100 text-indigo-700",
  "Technical interview": "bg-violet-100 text-violet-700",
  Onsite: "bg-purple-100 text-purple-700",
  Offer: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Withdrawn: "bg-gray-100 text-gray-600"
};

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
      className="grid gap-3 grid-cols-[repeat(8,minmax(200px,1fr))] overflow-x-auto pb-2"
    >
      {applicationStages.map((stage) => {
        const stageApplications = applications.filter(
          (application) => application.stage === stage
        );

        return (
          <article key={stage}>
            <Card className={`min-h-[320px] border-t-4 shadow-sm ${stageAccent[stage]}`}>
              <CardHeader className="flex-row items-center justify-between space-y-0 py-3 px-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  {stage}
                </CardTitle>
                <span
                  aria-label={`${stage} applications`}
                  className={`inline-flex items-center justify-center rounded-full text-xs font-bold h-5 min-w-5 px-1.5 ${stageBadge[stage]}`}
                >
                  {stageApplications.length}
                </span>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
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
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-3 text-center italic">
                    No applications yet
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
