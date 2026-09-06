type TodayEmptyStateProps = {
  onGoToPipeline: () => void;
};

export function TodayLoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading today"
      className="border border-border bg-card"
    >
      <span className="sr-only">Loading today...</span>
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          aria-hidden="true"
          className="grid grid-cols-[76px_minmax(0,1fr)_76px] items-center gap-2 border-b border-border-subtle px-3 py-4 last:border-b-0"
        >
          <span className="h-4 animate-pulse bg-selected" />
          <span className="h-4 animate-pulse bg-selected" />
          <span className="h-4 animate-pulse bg-selected" />
        </div>
      ))}
    </div>
  );
}

export function TodayEmptyState({ onGoToPipeline }: TodayEmptyStateProps) {
  return (
    <section
      aria-label="Nothing to do"
      className="border border-border bg-card px-4 py-8 text-center"
    >
      <p className="m-0 text-sm font-bold text-foreground">
        Nothing needs your attention.
      </p>
      <p className="m-0 mt-1 text-xs text-foreground-secondary">
        No follow-ups, interviews, or decisions are outstanding.
      </p>
      <button
        type="button"
        onClick={onGoToPipeline}
        className="mt-4 min-h-9 border border-border-strong px-3 text-xs font-bold meta-label tracking-wide text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Go to Pipeline
      </button>
    </section>
  );
}
