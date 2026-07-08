import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  summary?: ReactNode;
  tools?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function WorkspaceShell({
  title,
  description,
  actions,
  summary,
  tools,
  children,
  className
}: WorkspaceShellProps) {
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

      <div className="min-w-0">{children}</div>
    </section>
  );
}
