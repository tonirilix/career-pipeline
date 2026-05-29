import { type ChangeEvent, type FormEvent, type ReactNode } from "react";

import { Button } from "../ui/button";
import { ErrorNotice } from "../ui/error-notice";
import { Input } from "../ui/input";
import type { DetailsCommandError } from "./types";

export function SectionButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-12 border-r border-border px-2 text-[11px] font-bold uppercase tracking-wide transition-colors last:border-r-0 ${
        active
          ? "bg-muted text-foreground"
          : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="flex flex-col items-center gap-0.5 leading-tight">
        {children}
      </span>
    </button>
  );
}

export function SectionHeader({
  actionLabel,
  canAct,
  disabledReason,
  hideAction = false,
  title,
  onAction
}: {
  actionLabel: string;
  canAct: boolean;
  disabledReason?: string;
  hideAction?: boolean;
  title: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </h3>
        {!canAct && disabledReason ? (
          <p className="m-0 mt-1 text-xs text-muted-foreground">{disabledReason}</p>
        ) : null}
      </div>
      {canAct && !hideAction ? (
        <Button className="h-8 px-3 text-xs" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function DateTimeFields({
  date,
  groupLabel,
  time,
  onDateChange,
  onTimeChange
}: {
  date: string;
  groupLabel: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  function handleDateInput(
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) {
    onDateChange(event.currentTarget.value);
  }

  function handleTimeInput(
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) {
    onTimeChange(event.currentTarget.value);
  }

  return (
    <div
      aria-label={groupLabel}
      className="grid min-w-0 grid-cols-2 gap-3"
      role="group"
    >
      <label className="grid min-w-0 gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Date
        <Input
          onChange={handleDateInput}
          onInput={handleDateInput}
          type="date"
          value={date}
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Time
        <Input
          onChange={handleTimeInput}
          onInput={handleTimeInput}
          type="time"
          value={time}
        />
      </label>
    </div>
  );
}

export function FormActions({
  isPending,
  submitLabel,
  onCancel
}: {
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
    </div>
  );
}

export function DetailsError({
  children,
  error,
  title
}: {
  children: string;
  error: DetailsCommandError;
  title: string;
}) {
  return (
    <ErrorNotice className="mb-1" message={error.message} title={title}>
      <p className="m-0 mt-1 text-xs text-foreground/80">{children}</p>
    </ErrorNotice>
  );
}
