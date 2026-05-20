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
      className="grid gap-4 grid-cols-[repeat(2,minmax(240px,1fr))] mb-5"
    >
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          <h2 className="text-sm font-bold text-red-700 m-0">Overdue follow-ups</h2>
          {overdueItems.length > 0 && (
            <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-200 text-red-800 text-xs font-bold h-5 min-w-5 px-1.5">
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
          <p className="text-sm text-red-400 italic">No overdue follow-ups</p>
        )}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-sm font-bold text-amber-700 m-0">Upcoming follow-ups</h2>
          {upcomingItems.length > 0 && (
            <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold h-5 min-w-5 px-1.5">
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
          <p className="text-sm text-amber-500 italic">No upcoming follow-ups</p>
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
    <ol aria-label={label} className="grid gap-3 m-0 list-none p-0">
      {items.map(({ application, followUp }) => (
        <li key={followUp.id} className="bg-white rounded-lg border border-white/80 shadow-xs p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <strong className="text-sm font-semibold text-[var(--color-foreground)]">
              {application.company}
            </strong>
            <time
              className={`text-[0.65rem] font-bold uppercase tracking-wide whitespace-nowrap ${
                urgent ? "text-red-600" : "text-amber-600"
              }`}
              dateTime={followUp.dueAt}
            >
              {formatDate(followUp.dueAt)}
            </time>
          </div>
          <span className="block text-xs text-[var(--color-muted-foreground)] mb-2">
            {followUp.note}
          </span>
          <Button
            className="w-full h-7 text-xs"
            variant="outline"
            onClick={() =>
              void onCompleteFollowUp({
                applicationId: application.id,
                reminderId: followUp.id
              })
            }
            type="button"
          >
            Complete follow-up for {application.company}
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
