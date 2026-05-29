import type { JobApplication } from "../../../domain/jobOpportunity";

export function OverviewSection({ application }: { application: JobApplication }) {
  return (
    <section aria-label="Overview" className="grid gap-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Overview
      </h3>
      <dl className="grid grid-cols-2 border border-border">
        {[
          { label: "Source", value: application.source },
          { label: "Location", value: application.location || "Not set" },
          { label: "Compensation", value: application.compensation || "Not set" },
          { label: "Employment type", value: application.employmentType }
        ].map(({ label, value }, index) => (
          <div
            className={`px-4 py-3 ${index % 2 === 0 ? "border-r border-border" : ""} ${
              index < 2 ? "border-b border-border" : ""
            }`}
            key={label}
          >
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {label}
            </dt>
            <dd className="text-xs text-foreground m-0">{value}</dd>
          </div>
        ))}
        <div className="col-span-2 border-t border-border px-4 py-3">
          <dt className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Posting URL
          </dt>
          <dd className="text-xs text-foreground m-0 break-all">
            <a
              className="text-foreground hover:text-accent underline underline-offset-2"
              href={application.postingUrl}
            >
              {application.postingUrl}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
