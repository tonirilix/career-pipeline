import { useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  summary?: ReactNode;
  tools?: ReactNode;
  secondaryNavigation?: ReactNode;
  secondaryNavigationLabel?: string;
  children: ReactNode;
  className?: string;
};

export function WorkspaceShell({
  title,
  description,
  actions,
  summary,
  tools,
  secondaryNavigation,
  secondaryNavigationLabel = "Workspace navigation",
  children,
  className
}: WorkspaceShellProps) {
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);

  return (
    <section className={cn("space-y-5", className)} aria-labelledby="workspace-title">
      <div className="border-b border-border pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="m-0 mb-1 text-xs uppercase tracking-widest text-muted-foreground">
              Workspace
            </p>
            <h2
              id="workspace-title"
              className="m-0 text-2xl font-bold leading-tight text-foreground"
            >
              {title}
            </h2>
            {description ? (
              <p className="m-0 mt-1 max-w-3xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {summary ? <div className="mt-4">{summary}</div> : null}
      </div>

      {tools ? <div>{tools}</div> : null}

      <div className="flex min-w-0 gap-4">
        {secondaryNavigation ? (
          isSecondaryOpen ? (
            <aside
              aria-label={secondaryNavigationLabel}
              className="hidden w-64 shrink-0 border border-border bg-card md:block"
            >
              <div className="flex min-h-11 items-center justify-between border-b border-border px-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Views
                </span>
                <button
                  type="button"
                  aria-label="Collapse secondary navigation"
                  className="flex min-h-8 min-w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setIsSecondaryOpen(false)}
                >
                  <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {secondaryNavigation}
            </aside>
          ) : (
            <button
              type="button"
              aria-label="Expand secondary navigation"
              className="hidden min-h-10 w-10 shrink-0 items-start justify-center border border-border bg-card pt-3 text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
              onClick={() => setIsSecondaryOpen(true)}
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            </button>
          )
        ) : null}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
