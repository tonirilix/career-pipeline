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
  return (
    <section
      aria-label="Follow-up work"
      className="grid gap-3 grid-cols-1 px-4 py-3"
    >
      <div className="border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest m-0">
            Overdue follow-ups
          </h2>
          {overdueItems.length > 0 && (
            <span className="ml-auto text-[0.65rem] font-bold text-accent">
              {overdueItems.length}
            </span>
          )}
        </div>
        {overdueItems.length > 0 ? (
          <FollowUpWorkList
            items={overdueItems}
            label="Overdue follow-ups"
            onCompleteFollowUp={onCompleteFollowUp}
            urgent
          />
        ) : (
          <p className="text-[0.65rem] text-muted-foreground italic">No overdue follow-ups</p>
        )}
      </div>

      <div className="border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest m-0">
            Upcoming follow-ups
          </h2>
          {upcomingItems.length > 0 && (
            <span className="ml-auto text-[0.65rem] font-bold text-muted-foreground">
              {upcomingItems.length}
            </span>
          )}
        </div>
        {upcomingItems.length > 0 ? (
          <FollowUpWorkList
            items={upcomingItems}
            label="Upcoming follow-ups"
            onCompleteFollowUp={onCompleteFollowUp}
            urgent={false}
          />
        ) : (
          <p className="text-[0.65rem] text-muted-foreground italic">No upcoming follow-ups</p>
        )}
      </div>
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
              className={`text-[0.55rem] font-bold uppercase tracking-widest ${
                urgent ? "text-accent" : "text-muted-foreground"
              }`}
              dateTime={followUp.dueAt}
            >
              {formatDate(followUp.dueAt)}
            </time>
          </div>
          <span className="block text-[0.65rem] text-muted-foreground mb-2">
            {followUp.note}
          </span>
          <Button
            className="w-full min-w-0 h-7 text-[0.65rem] rounded-none bg-transparent hover:bg-muted overflow-hidden [white-space:normal]"
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
