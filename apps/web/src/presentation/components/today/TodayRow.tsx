import { useEffect, useRef } from "react";

import type { TodayItem } from "../../todayProjections";
import { Button } from "../ui/button";

type TodayRowProps = {
  item: TodayItem;
  isSelected: boolean;
  isOpen: boolean;
  isActionPending: boolean;
  actionLabel: string;
  onOpen: () => void;
  onAction: () => void;
};

export function TodayRow({
  item,
  isSelected,
  isOpen,
  isActionPending,
  actionLabel,
  onOpen,
  onAction
}: TodayRowProps) {
  const marked = isSelected || isOpen;
  const rowRef = useRef<HTMLLIElement>(null);

  // Keyboard selection moves without moving focus, so the row has to bring
  // itself into view.
  useEffect(() => {
    if (!isSelected) return;
    rowRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [isSelected]);

  return (
    <li
      ref={rowRef}
      data-selected={marked || undefined}
      className={[
        "grid grid-cols-[76px_minmax(0,1fr)] items-start gap-2 border-b border-border-subtle px-3 py-3 last:border-b-0",
        "@lg:grid-cols-[76px_minmax(0,1fr)_76px_auto] @lg:items-center",
        // Selection is carried by surface plus an accent bar, so it never reads
        // as the focus ring.
        marked
          ? "bg-selected shadow-[inset_2px_0_0_var(--color-accent)]"
          : "hover:bg-muted"
      ].join(" ")}
    >
      <span className="border border-border-strong px-1.5 py-0.5 text-center text-[10px] font-bold meta-label tracking-wide text-muted-foreground">
        {item.type}
      </span>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block truncate text-sm font-bold text-foreground">
          {item.action} · {item.company}
        </span>
        <span className="block truncate text-xs text-foreground-secondary">
          {item.roleTitle}
          {item.stage ? (
            <span className="text-muted-foreground"> · {item.stage}</span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {item.rationale}
        </span>
      </button>

      <div className="col-start-2 @lg:col-start-3 @lg:text-right">
        {item.dueAt ? (
          <time
            dateTime={item.dueAt}
            className={`text-xs font-bold meta-label tracking-wide tabular-nums ${
              item.isOverdue ? "text-accent" : "text-muted-foreground"
            }`}
          >
            {formatDue(item.dueAt)}
          </time>
        ) : null}
      </div>

      <div className="col-start-2 @lg:col-start-4">
        <Button
          type="button"
          variant="outline"
          disabled={isActionPending}
          onClick={onAction}
          className="min-h-9 w-full bg-transparent text-xs hover:bg-muted @lg:w-auto"
        >
          {actionLabel}
        </Button>
      </div>
    </li>
  );
}

function formatDue(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}
