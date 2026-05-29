import type { JobApplication } from "../../../domain/jobOpportunity";

export function ApplicationSummary({
  application
}: {
  application: JobApplication;
}) {
  return (
    <div className="border-b border-border px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest m-0 mb-0.5">
            Application details
          </p>
          <h2 className="text-lg font-bold text-foreground m-0 truncate">
            {application.company}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0">
            {application.roleTitle}
          </p>
        </div>
        <span className="border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest px-2 py-1 whitespace-nowrap mt-1">
          {application.stage}
        </span>
      </div>
    </div>
  );
}
