import { type ComponentProps, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The shell's outer flex row: global navigation, then whatever the route lays
 * out beside it.
 */
export function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen min-h-0 w-full overflow-hidden bg-background text-foreground"
      data-sidebar-wrapper
    >
      {children}
    </div>
  );
}

/**
 * Global navigation. One element in both presentations: a labelled vertical
 * rail from 768px up, and a persistent bottom tab bar below it. It never
 * collapses to icons and it is never hidden behind a trigger — recognising a
 * destination is its whole job.
 */
export function Sidebar({ className, children, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label={props["aria-label"] ?? "Global navigation"}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex shrink-0 border-t border-border bg-background",
        "md:static md:h-screen md:w-46 md:flex-col md:border-r md:border-t-0",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("hidden shrink-0 border-b border-border px-3 py-3 md:block", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 md:min-h-0 md:flex-col md:overflow-y-auto md:p-2",
        className
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("hidden shrink-0 border-t border-border p-2 md:block", className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "m-0 flex w-full flex-1 list-none gap-0 p-0",
        "md:grid md:flex-none md:auto-rows-min md:content-start md:gap-0.5",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("min-w-0 flex-1 md:flex-none", className)} {...props} />;
}

type SidebarNavButtonProps = ComponentProps<"button"> & {
  isActive?: boolean;
  label: string;
  count?: number;
  icon: ReactNode;
};

/**
 * A destination. Always labelled, counted where the destination can carry a
 * count, and marked active by an accent bar rather than by weight alone.
 */
export function SidebarNavButton({
  className,
  isActive = false,
  label,
  count,
  icon,
  ...props
}: SidebarNavButtonProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-0.5 px-2 py-1 text-sm font-semibold transition-colors",
        "min-h-11 md:min-h-9 md:flex-row md:justify-start md:gap-2.5 md:px-2.5 md:py-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        isActive
          ? "bg-selected text-foreground shadow-[inset_0_2px_0_var(--color-accent)] md:shadow-[inset_2px_0_0_var(--color-accent)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      <span className="min-w-0 truncate text-[11px] md:text-[13px]">{label}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "text-[11px] font-bold tabular-nums md:ml-auto md:text-[11px]",
            isActive ? "text-accent" : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("min-w-0 flex-1 overflow-hidden", className)} {...props} />
  );
}

type SecondarySidebarProps = {
  label: string;
  title: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
};

export function SecondarySidebar({
  label,
  title,
  isOpen,
  onOpenChange,
  children
}: SecondarySidebarProps) {
  if (!isOpen) {
    return (
      <div className="hidden shrink-0 border-r border-border bg-background md:flex md:w-10 md:flex-col">
        <button
          type="button"
          aria-label="Expand secondary navigation"
          className="flex min-h-10 w-full items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => onOpenChange(true)}
        >
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label={label}
      className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex"
    >
      <div className="flex min-h-11 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-bold meta-label tracking-widest text-muted-foreground">
          {title}
        </span>
        <button
          type="button"
          aria-label="Collapse secondary navigation"
          className="flex min-h-8 min-w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => onOpenChange(false)}
        >
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
