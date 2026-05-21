import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ErrorNoticeProps = {
  title: string;
  message?: string;
  children?: ReactNode;
  className?: string;
};

export function ErrorNotice({
  title,
  message,
  children,
  className
}: ErrorNoticeProps) {
  return (
    <div
      className={cn(
        "border border-border border-l-2 border-l-destructive bg-card px-4 py-3 text-sm text-foreground",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        />
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold uppercase tracking-widest text-destructive">
            {title}
          </p>
          {message ? (
            <p className="m-0 mt-1 text-sm leading-5 text-foreground">
              {message}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
