import type { ApplicationStage } from "../../../domain/applicationStage";
import type { StageCount } from "../../jobApplicationProjections";

/** The stages a live application can be sitting in. Closed stages are not work. */
const ACTIVE_STAGES: ApplicationStage[] = [
  "Saved",
  "Applied",
  "Screening",
  "Technical interview",
  "Onsite",
  "Offer"
];

type TodayHeaderProps = {
  date: Date;
  nowCount: number;
  thisWeekCount: number;
  stageCounts: StageCount[];
  onSelectStage: (stage: ApplicationStage) => void;
};

export function TodayHeader({
  date,
  nowCount,
  thisWeekCount,
  stageCounts,
  onSelectStage
}: TodayHeaderProps) {
  const countByStage = new Map(
    stageCounts.map(({ stage, count }) => [stage, count])
  );

  return (
    <header className="border-b border-border pb-4">
      <p className="m-0 mb-1 text-xs meta-label tracking-widest text-muted-foreground">
        <time dateTime={toDateOnly(date)}>{formatHeaderDate(date)}</time>
      </p>
      <h2
        id="workspace-title"
        className="m-0 text-2xl font-bold leading-tight text-foreground"
      >
        Today
      </h2>
      <p className="m-0 mt-1 text-sm text-foreground-secondary">
        {summarise(nowCount, thisWeekCount)}
      </p>

      <div
        className="mt-4 grid grid-cols-3 border border-border-strong bg-card @2xl:grid-cols-6"
        role="group"
        aria-label="Pipeline stages"
      >
        {ACTIVE_STAGES.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => onSelectStage(stage)}
            aria-label={`Show ${stage} applications in Pipeline`}
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 border-b border-r border-border-subtle px-1 py-2 transition-colors last:border-r-0 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring @2xl:border-b-0"
          >
            <span className="w-full truncate text-center text-[10px] meta-label tracking-normal text-muted-foreground @2xl:tracking-wide">
              {stage}
            </span>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {countByStage.get(stage) ?? 0}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
}

function summarise(nowCount: number, thisWeekCount: number) {
  if (nowCount === 0 && thisWeekCount === 0) {
    return "Nothing needs your attention.";
  }

  return `${countPhrase(nowCount, "item")} need${
    nowCount === 1 ? "s" : ""
  } you now · ${thisWeekCount} more this week`;
}

function countPhrase(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function formatHeaderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
