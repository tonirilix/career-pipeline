import type { CompleteFollowUpReminderCommand } from "../../domain/followUpReminder";
import type { FollowUpReminder, JobApplication } from "../../domain/jobOpportunity";
import { Button } from "./ui/button";

type FollowUpWorkItem = {
  application: JobApplication;
  followUp: FollowUpReminder;
};

type FollowUpWorkProps = {
  overdueItems: FollowUpWorkItem[];
  upcomingItems: FollowUpWorkItem[];
  onCompleteFollowUp: (command: CompleteFollowUpReminderCommand) => Promise<void>;
};

export function FollowUpWork({
  overdueItems,
  upcomingItems,
  onCompleteFollowUp
}: FollowUpWorkProps) {
  if (overdueItems.length === 0 && upcomingItems.length === 0) {
    return (
      <section
        aria-label="Follow-up work"
        className="border-b border-border px-4 py-3"
      >
        <p className="m-0 text-sm text-muted-foreground">
          No follow-ups need attention.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Follow-up work"
      className="grid gap-3 grid-cols-1 px-4 py-3"
    >
      {overdueItems.length > 0 ? (
      <div className="border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest m-0">
            Overdue follow-ups
          </h2>
          <span className="ml-auto text-xs font-bold text-accent">
            {overdueItems.length}
          </span>
        </div>
        <FollowUpWorkList
          items={overdueItems}
          label="Overdue follow-ups"
          onCompleteFollowUp={onCompleteFollowUp}
          urgent
        />
      </div>
      ) : null}

      {upcomingItems.length > 0 ? (
      <div className="border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest m-0">
            Upcoming follow-ups
          </h2>
          <span className="ml-auto text-xs font-bold text-muted-foreground">
            {upcomingItems.length}
          </span>
        </div>
        <FollowUpWorkList
          items={upcomingItems}
          label="Upcoming follow-ups"
          onCompleteFollowUp={onCompleteFollowUp}
          urgent={false}
        />
      </div>
      ) : null}
    </section>
  );
}

type FollowUpWorkListProps = {
  items: FollowUpWorkItem[];
  label: string;
  urgent: boolean;
  onCompleteFollowUp: (command: CompleteFollowUpReminderCommand) => Promise<void>;
};

function FollowUpWorkList({ items, label, urgent, onCompleteFollowUp }: FollowUpWorkListProps) {
  return (
    <ol aria-label={label} className="grid gap-0 m-0 list-none p-0 divide-y divide-border">
      {items.map(({ application, followUp }) => (
        <li key={followUp.id} className="py-3 first:pt-0 min-w-0 overflow-hidden">
          <div className="mb-1">
            <strong className="block text-xs font-bold text-foreground truncate">
              {application.company}
            </strong>
            <time
              className={`text-xs font-bold uppercase tracking-widest ${
                urgent ? "text-accent" : "text-muted-foreground"
              }`}
              dateTime={followUp.dueAt}
            >
              {formatDate(followUp.dueAt)}
            </time>
          </div>
          <span className="block text-xs text-muted-foreground mb-2">
            {followUp.note}
          </span>
          <Button
            className="w-full min-w-0 min-h-8 text-xs rounded-none bg-transparent hover:bg-muted overflow-hidden [white-space:normal]"
            variant="outline"
            onClick={() =>
              void onCompleteFollowUp({
                applicationId: application.id,
                reminderId: followUp.id
              })
            }
            type="button"
          >
            <span className="truncate">Complete follow-up for {application.company}</span>
          </Button>
        </li>
      ))}
    </ol>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
