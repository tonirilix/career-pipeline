import { pipelineSavedViews, type PipelineSavedView } from "../pipelineSavedViews";

type PipelineSavedViewsProps = {
  activeView: PipelineSavedView;
  counts: Record<PipelineSavedView, number>;
  onSelectView: (view: PipelineSavedView) => void;
};

export function PipelineSavedViews({
  activeView,
  counts,
  onSelectView
}: PipelineSavedViewsProps) {
  return (
    <nav aria-label="Pipeline saved views" className="p-2">
      <ul className="m-0 grid list-none gap-1 p-0">
        {pipelineSavedViews.map((view) => {
          const isActive = activeView === view.id;

          return (
            <li key={view.id}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={`grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 text-left transition-colors ${
                  isActive
                    ? "border border-border bg-primary text-primary-foreground"
                    : "border border-transparent text-foreground hover:bg-muted"
                }`}
                onClick={() => onSelectView(view.id)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {view.label}
                  </span>
                  <span
                    className={`block truncate text-xs ${
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {view.description}
                  </span>
                </span>
                <span className="text-xs font-bold tabular-nums">
                  {counts[view.id]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
