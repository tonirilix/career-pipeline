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
  completingFollowUpReminderIds: Set<string>;
  onCompleteFollowUp: (command: CompleteFollowUpReminderCommand) => Promise<void>;
};

export function FollowUpWork({
  overdueItems,
  upcomingItems,
  completingFollowUpReminderIds,
  onCompleteFollowUp
}: FollowUpWorkProps) {
  const totalCount = overdueItems.length + upcomingItems.length;

  if (overdueItems.length === 0 && upcomingItems.length === 0) {
    return (
      <section
        aria-label="Follow-up work"
        className="border border-border bg-card px-3 py-2"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          No follow-ups need attention.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Follow-up work"
      className="border border-border bg-card"
    >
      <div className="flex min-h-11 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="m-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Follow-up work
        </h2>
        <span className="ml-auto text-xs font-bold text-foreground">
          {totalCount}
        </span>
        {overdueItems.length > 0 ? (
          <span className="border border-border px-2 py-1 text-xs font-bold text-accent">
            {overdueItems.length} overdue
          </span>
        ) : null}
        {upcomingItems.length > 0 ? (
          <span className="border border-border px-2 py-1 text-xs font-bold text-muted-foreground">
            {upcomingItems.length} upcoming
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 p-3 xl:grid-cols-2">
      {overdueItems.length > 0 ? (
      <div className="min-w-0 border border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Overdue follow-ups
          </h3>
          <span className="ml-auto text-xs font-bold text-accent">
            {overdueItems.length}
          </span>
        </div>
        <FollowUpWorkList
          items={overdueItems}
          label="Overdue follow-ups"
          completingFollowUpReminderIds={completingFollowUpReminderIds}
          onCompleteFollowUp={onCompleteFollowUp}
          urgent
        />
      </div>
      ) : null}

      {upcomingItems.length > 0 ? (
      <div className="min-w-0 border border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Upcoming follow-ups
          </h3>
          <span className="ml-auto text-xs font-bold text-muted-foreground">
            {upcomingItems.length}
          </span>
        </div>
        <FollowUpWorkList
          items={upcomingItems}
          label="Upcoming follow-ups"
          completingFollowUpReminderIds={completingFollowUpReminderIds}
          onCompleteFollowUp={onCompleteFollowUp}
          urgent={false}
        />
      </div>
      ) : null}
      </div>
    </section>
  );
}

type FollowUpWorkListProps = {
  items: FollowUpWorkItem[];
  label: string;
  urgent: boolean;
  completingFollowUpReminderIds: Set<string>;
  onCompleteFollowUp: (command: CompleteFollowUpReminderCommand) => Promise<void>;
};

function FollowUpWorkList({ items, label, urgent, completingFollowUpReminderIds, onCompleteFollowUp }: FollowUpWorkListProps) {
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
            disabled={completingFollowUpReminderIds.has(followUp.id)}
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
