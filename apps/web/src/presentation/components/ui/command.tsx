import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { cn } from "@/lib/utils";

type CommandDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function CommandDialog({
  isOpen,
  onClose,
  children,
  title = "Command palette"
}: CommandDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 px-4 pt-20">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[81] w-full max-w-2xl border border-border bg-background shadow-xl"
      >
        {children}
      </section>
    </div>
  );
}

type CommandProps = ComponentProps<"div"> & {
  onEscape?: () => void;
};

export function Command({ className, onEscape, ...props }: CommandProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onEscape?.();
    }
  }

  return (
    <div
      className={cn("grid max-h-[70vh] grid-rows-[auto_1fr]", className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

type CommandInputProps = ComponentProps<"input">;

export function CommandInput({ className, ...props }: CommandInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <input
      ref={ref}
      className={cn(
        "h-12 border-0 border-b border-border bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function CommandList({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("max-h-[calc(70vh-3rem)] overflow-y-auto p-2", className)}
      {...props}
    />
  );
}

export function CommandEmpty({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("m-0 px-3 py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type CommandGroupProps = ComponentProps<"section"> & {
  heading: string;
};

export function CommandGroup({
  className,
  heading,
  children,
  ...props
}: CommandGroupProps) {
  return (
    <section className={cn("py-1", className)} {...props}>
      <h3 className="m-0 px-2 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {heading}
      </h3>
      <div className="grid gap-1">{children}</div>
    </section>
  );
}

export function CommandSeparator(props: ComponentProps<"div">) {
  return <div aria-hidden="true" className="my-1 border-t border-border" {...props} />;
}

type CommandItemProps = ComponentProps<"button"> & {
  keywords?: string[];
};

export function CommandItem({
  className,
  keywords: _keywords,
  ...props
}: CommandItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function useCommandFilter<T extends { label: string; keywords?: string[] }>(
  items: T[]
) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;

    return items.filter((item) =>
      [item.label, ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [items, normalizedQuery]);

  return { filteredItems, query, setQuery };
}
