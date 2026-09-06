import type { ReactNode } from "react";

type TodayGroupProps = {
  label: string;
  hint: string;
  count: number;
  children: ReactNode;
};

export function TodayGroup({ label, hint, count, children }: TodayGroupProps) {
  return (
    <section aria-label={label} className="border border-border bg-card">
      <div className="flex min-h-11 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <h3 className="m-0 text-xs font-bold meta-label tracking-widest text-muted-foreground">
          {label}
        </h3>
        <span className="text-xs font-bold tabular-nums text-foreground">{count}</span>
        <span className="text-xs text-foreground-secondary">{hint}</span>
      </div>
      <ol aria-label={`${label} items`} className="m-0 list-none p-0">
        {children}
      </ol>
    </section>
  );
}
