type StatsBarProps = {
  activeCount: number;
  overdueCount: number;
  upcomingCount: number;
  className?: string;
};

export function StatsBar({
  activeCount,
  overdueCount,
  upcomingCount,
  className = ""
}: StatsBarProps) {
  return (
    <dl className={`flex flex-wrap gap-2 ${className}`}>
      <StatItem label="Active" value={activeCount} highlight={activeCount > 0} />
      <StatItem label="Overdue" value={overdueCount} highlight={overdueCount > 0} />
      <StatItem label="Upcoming" value={upcomingCount} highlight={false} />
    </dl>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  return (
    <div className="flex min-h-9 items-center gap-2 border border-border bg-card px-3">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={`m-0 text-sm font-bold tabular-nums ${highlight ? "text-accent" : "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}
