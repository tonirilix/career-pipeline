import { type FormEvent, useState } from "react";

import type { CreateFollowUpReminderCommand } from "../../../domain/followUpReminder";
import type { FollowUpReminder } from "../../../domain/jobOpportunity";
import { Textarea } from "../ui/textarea";
import { combineDateAndTime, formatDate } from "./dateHelpers";
import {
  DateTimeFields,
  DetailsError,
  FormActions,
  SectionHeader
} from "./primitives";
import type {
  DetailsCommandError,
  FollowUpActionState,
  FollowUpFormState
} from "./types";

const emptyFollowUpForm: FollowUpFormState = {
  dueDate: "",
  dueTime: "",
  note: ""
};

export function useFollowUpWorkflow({
  applicationId,
  onComplete,
  onCreateFollowUp
}: {
  applicationId: string;
  onComplete: () => void;
  onCreateFollowUp: (command: CreateFollowUpReminderCommand) => Promise<boolean>;
}) {
  const [form, setForm] = useState<FollowUpFormState>(emptyFollowUpForm);
  const [localError, setLocalError] = useState<DetailsCommandError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!form.dueDate || !form.dueTime) {
      setLocalError({
        workflow: "followUp",
        message: "Follow-up date and time are required."
      });
      return;
    }

    const didCreate = await onCreateFollowUp({
      applicationId,
      dueAt: combineDateAndTime(form.dueDate, form.dueTime),
      note: form.note
    });
    if (didCreate) {
      setForm(emptyFollowUpForm);
      onComplete();
    }
  }

  return {
    form,
    handleSubmit,
    localError,
    setDueDate: (dueDate: string) => setForm((current) => ({ ...current, dueDate })),
    setDueTime: (dueTime: string) => setForm((current) => ({ ...current, dueTime })),
    setNote: (note: string) => setForm((current) => ({ ...current, note })),
    clearLocalError: () => setLocalError(null)
  };
}

export function FollowUpsSection({
  actionState,
  error,
  followUps,
  form,
  onAction,
  onCancel,
  onDateChange,
  onNoteChange,
  onSubmit,
  onTimeChange
}: {
  actionState: FollowUpActionState;
  error: DetailsCommandError | null;
  followUps: FollowUpReminder[];
  form: FollowUpFormState;
  onAction: () => void;
  onCancel: () => void;
  onDateChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTimeChange: (value: string) => void;
}) {
  const isBlocked = actionState.kind === "blocked";
  const isActive = actionState.kind === "active";
  const isPending = isActive && actionState.status === "pending";

  return (
    <section aria-label="Follow-ups" className="grid gap-4">
      <SectionHeader
        actionLabel="Create follow-up"
        canAct={!isBlocked}
        disabledReason={isBlocked ? actionState.reason : undefined}
        hideAction={isActive}
        title="Follow-ups"
        onAction={onAction}
      />
      {error ? (
        <DetailsError error={error} title="Follow-up was not created">
          Your due date and note are still here. Adjust them and try again.
        </DetailsError>
      ) : null}
      {isActive ? (
        <form className="grid gap-3" onSubmit={onSubmit}>
          <DateTimeFields
            date={form.dueDate}
            groupLabel="Follow-up due date"
            time={form.dueTime}
            onDateChange={onDateChange}
            onTimeChange={onTimeChange}
          />
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Follow-up note
            <Textarea
              className="min-h-[80px]"
              onChange={(e) => onNoteChange(e.target.value)}
              value={form.note}
            />
          </label>
          <FormActions
            isPending={isPending}
            submitLabel="Create follow-up"
            onCancel={onCancel}
          />
        </form>
      ) : null}
      <FollowUpList followUps={followUps} />
    </section>
  );
}

function FollowUpList({ followUps }: { followUps: FollowUpReminder[] }) {
  if (followUps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No follow-ups scheduled</p>
    );
  }

  return (
    <ol aria-label="Application follow-ups" className="list-none p-0 m-0 grid gap-2">
      {followUps.map((followUp) => (
        <li
          key={followUp.id}
          className="bg-background border border-border px-3 py-2 flex items-start justify-between gap-2"
        >
          <div>
            <time
              className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5"
              dateTime={followUp.dueAt}
            >
              {formatDate(followUp.dueAt)}
            </time>
            <span className="text-sm text-foreground">{followUp.note}</span>
          </div>
          {followUp.completedAt ? (
            <span className="text-xs font-bold text-accent border border-accent/30 px-1.5 py-0.5 whitespace-nowrap uppercase tracking-wider">
              done
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
