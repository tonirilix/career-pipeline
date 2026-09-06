import type { TodayItem } from "../../todayProjections";
import { Button } from "../ui/button";

type TodayInspectorBodyProps = {
  item: TodayItem;
  onOpenApplication: (applicationId: string) => void;
};

/**
 * One scrolling column, ordered by what the user is expected to do: why this is
 * here, what it refers to, and where to go for everything else.
 */
export function TodayInspectorBody({
  item,
  onOpenApplication
}: TodayInspectorBodyProps) {
  return (
    <div className="grid gap-4 px-4 py-4">
      <section>
        <h3 className="m-0 mb-1 text-xs font-bold meta-label tracking-widest text-muted-foreground">
          Why this is here
        </h3>
        <p className="m-0 text-sm text-foreground-secondary">{item.rationale}</p>
      </section>

      <section>
        <h3 className="m-0 mb-1 text-xs font-bold meta-label tracking-widest text-muted-foreground">
          Next action
        </h3>
        <p className="m-0 text-sm text-foreground">{item.action}</p>
      </section>

      <section>
        <h3 className="m-0 mb-1 text-xs font-bold meta-label tracking-widest text-muted-foreground">
          Due
        </h3>
        {item.dueAt ? (
          <time
            dateTime={item.dueAt}
            className={`text-sm font-bold tabular-nums ${
              item.isOverdue ? "text-accent" : "text-foreground"
            }`}
          >
            {formatDue(item.dueAt)}
          </time>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">
            No date is being worked towards.
          </p>
        )}
      </section>

      {item.applicationId ? (
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent hover:bg-muted"
          onClick={() => onOpenApplication(item.applicationId as string)}
        >
          Open the full application
        </Button>
      ) : null}
    </div>
  );
}

function formatDue(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
