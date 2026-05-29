import type { TimelineEvent } from "../../../domain/jobOpportunity";
import { formatDate } from "./dateHelpers";

export function TimelineSection({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <section aria-label="Timeline" className="grid gap-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Timeline
      </h3>
      <TimelineList timeline={timeline} />
    </section>
  );
}

function TimelineList({ timeline }: { timeline: TimelineEvent[] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No timeline events yet</p>;
  }

  return (
    <ol
      aria-label="Timeline events"
      className="list-none p-0 m-0 relative border-l-2 border-border ml-2"
    >
      {timeline.map((event) => (
        <li key={event.id} className="relative pl-5 pb-4 last:pb-0">
          <span className="absolute left-[-5px] top-1.5 w-2 h-2 bg-border" />
          <time
            className="block text-xs font-bold text-muted-foreground uppercase tracking-wide"
            dateTime={event.occurredAt}
          >
            {formatDate(event.occurredAt)}
          </time>
          <span className="text-sm text-foreground">{event.description}</span>
        </li>
      ))}
    </ol>
  );
}
