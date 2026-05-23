import { ResponsiveFunnel } from "@nivo/funnel";
import type { ApplicationStage } from "../../domain/applicationStage";

type StageCount = {
  stage: ApplicationStage;
  count: number;
};

type FunnelChartProps = {
  stageCounts: StageCount[];
  activeStage: ApplicationStage | "All";
  onStageClick: (stage: ApplicationStage | "All") => void;
};

// Blue → indigo → purple gradient across the 8 stages
const STAGE_COLORS = [
  "#4f83e8",
  "#5b74e2",
  "#6764dc",
  "#7355d6",
  "#7f47d0",
  "#8b38ca",
  "#972bc4",
  "#a31ebe",
] as const;

// Nivo theme: transparent background so the card bg shows through
const NIVO_THEME = {
  background: "transparent",
} as const;

export function FunnelChart({ stageCounts, activeStage, onStageClick }: FunnelChartProps) {
  const firstCount = stageCounts[0]?.count ?? 0;

  const data = stageCounts.map(({ stage, count }) => ({
    id: stage,
    label: stage,
    // nivo can't render a 0-value part — use epsilon so shape stays visible
    value: count > 0 ? count : 0.01,
  }));

  return (
    <section aria-label="Application funnel" className="border-b border-border bg-card">
      {/* Section heading */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          Pipeline overview
        </span>
        {activeStage !== "All" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Filtering board to:</span>
            <button
              type="button"
              aria-label={`Clear ${activeStage} filter`}
              onClick={() => onStageClick("All")}
              className="flex items-center gap-1 text-[11px] font-medium text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full hover:bg-accent/20 transition-colors"
            >
              <span aria-hidden="true">{activeStage}</span>
              <span aria-hidden="true" className="text-accent/70 font-bold">×</span>
            </button>
          </div>
        )}
      </div>

      {/* Clickable stage header buttons — accessible and testable */}
      <div className="flex items-start px-6">
        {stageCounts.map(({ stage, count }, i) => {
          const isActive = activeStage === stage;
          // Only show conversion when this stage and the previous both have real data
          const prevCount = i > 0 ? stageCounts[i - 1].count : null;
          const conversionPct =
            prevCount != null && prevCount > 0 && count > 0
              ? Math.round((count / prevCount) * 100)
              : null;

          return (
            <button
              key={stage}
              type="button"
              title={stage}
              aria-pressed={isActive}
              onClick={() => onStageClick(isActive ? "All" : stage)}
              className={[
                "flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent/10 border-b-2 border-accent"
                  : "border-b-2 border-transparent hover:bg-muted",
              ].join(" ")}
            >
              <span className="text-[10px] uppercase tracking-normal md:tracking-wide text-muted-foreground leading-tight text-center w-full truncate">
                {stage}
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${isActive ? "text-accent" : "text-foreground"}`}
              >
                {count.toLocaleString()}
              </span>
              {conversionPct !== null ? (
                <span
                  className={`text-[10px] leading-none ${conversionPct < 50 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {conversionPct}% conv.
                </span>
              ) : (
                // Reserve space so all buttons stay the same height; hidden from AT
                <span className="text-[10px] leading-none invisible" aria-hidden="true">—</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Nivo chart — purely visual, aria-hidden */}
      <div style={{ height: 160 }} className="px-2 pb-4" aria-hidden="true">
        <ResponsiveFunnel
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
          direction="horizontal"
          interpolation="smooth"
          shapeBlending={0.6}
          colors={[...STAGE_COLORS].slice(0, stageCounts.length)}
          fillOpacity={0.88}
          borderWidth={0}
          enableLabel={false}
          // Remove all separator lines for a clean flowing shape
          layers={["parts", "labels", "annotations"]}
          isInteractive={true}
          currentPartSizeExtension={10}
          currentBorderWidth={2}
          theme={NIVO_THEME}
          animate={true}
          motionConfig="gentle"
          onClick={(part) => {
            const stage = part.data.id as ApplicationStage;
            onStageClick(activeStage === stage ? "All" : stage);
          }}
          tooltip={({ part }) => {
            const idx = stageCounts.findIndex((s) => s.stage === part.data.id);
            const count = stageCounts[idx]?.count ?? 0;
            const prevCount = idx > 0 ? stageCounts[idx - 1].count : null;
            const pctOfPipeline =
              firstCount > 0 ? Math.round((count / firstCount) * 100) : 0;
            const convFromPrev =
              prevCount != null && prevCount > 0 && count > 0
                ? Math.round((count / prevCount) * 100)
                : null;

            return (
              <div className="bg-card border border-border shadow-md px-3 py-2 text-xs rounded-sm min-w-[160px]">
                <p className="font-bold text-foreground mb-1.5">{String(part.data.id)}</p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">{count.toLocaleString()}</span>{" "}
                    applications
                  </p>
                  <p>{pctOfPipeline}% of pipeline</p>
                  {convFromPrev !== null && (
                    <p>
                      {convFromPrev}% conversion from {stageCounts[idx - 1].stage}
                    </p>
                  )}
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground/60 italic">
                  Click to {activeStage === part.data.id ? "clear filter" : "filter board"}
                </p>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
