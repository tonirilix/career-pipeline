type StatsBarProps = {
  activeCount: number;
  overdueCount: number;
  upcomingCount: number;
};

export function StatsBar({ activeCount, overdueCount, upcomingCount }: StatsBarProps) {
  return (
    <dl className="grid gap-0 divide-y divide-border border-b border-border">
      <StatItem label="Active" value={activeCount} highlight={activeCount > 0} />
      <StatItem label="Overdue" value={overdueCount} highlight={overdueCount > 0} />
      <StatItem label="Upcoming" value={upcomingCount} highlight={false} />
    </dl>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <dt className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={`text-xs font-bold tabular-nums m-0 ${highlight ? "text-accent" : "text-muted-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}
