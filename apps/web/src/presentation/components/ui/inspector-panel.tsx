import { useEffect, useRef, useState, type ReactNode } from "react";

/** Long enough to cover the exit animation defined in `index.css`. */
const EXIT_DURATION_MS = 200;

type InspectorPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  /** The subject of the panel — a company, a role, whatever the row named. */
  title: string;
  /** What kind of item this is, echoing the row's type chip. */
  type: string;
  /** The application stage, where the subject has one. */
  stage?: string | null;
  children: ReactNode;
};

/**
 * An inline detail pane that DISPLACES the main content region rather than
 * overlaying it.
 *
 * Deliberately not a `SlideOver` variant: this panel holds no focus trap, locks
 * no body scroll, and renders no backdrop, so list keyboard navigation keeps
 * working while it is open. `SlideOver` requires the opposite on all three
 * counts, and both contracts are correct for their own users.
 *
 * The parent must lay this out as a flex sibling of a `flex-1 min-w-0` main
 * region — see `WorkspaceViewport`.
 */
export function InspectorPanel({
  isOpen,
  onClose,
  title,
  type,
  stage,
  children
}: InspectorPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  // The panel outlives its own close by one animation, so the list widens back
  // rather than snapping.
  const [phase, setPhase] = useState<"closed" | "open" | "closing">(
    isOpen ? "open" : "closed"
  );

  useEffect(() => {
    if (isOpen) {
      setPhase("open");
      return;
    }

    setPhase((current) => (current === "closed" ? "closed" : "closing"));
  }, [isOpen]);

  useEffect(() => {
    if (phase !== "closing") return;

    // With reduced motion there is no exit animation to wait for, so the panel
    // should not linger.
    const timer = setTimeout(
      () => setPhase("closed"),
      prefersReducedMotion() ? 0 : EXIT_DURATION_MS
    );

    return () => clearTimeout(timer);
  }, [phase]);

  // On its way out the panel is decoration: it leaves the accessibility tree
  // and stops taking focus or clicks.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (phase === "closing") {
      panel.setAttribute("inert", "");
    } else {
      panel.removeAttribute("inert");
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      // A modal surface — the command palette or a slide-over — sits above the
      // inspector and owns Escape while it is open.
      if (document.querySelector('[aria-modal="true"]')) return;

      onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [phase, onClose]);

  if (phase === "closed") return null;

  const isClosing = phase === "closing";

  return (
    <aside
      ref={panelRef}
      aria-label={isClosing ? undefined : `${type} details`}
      aria-hidden={isClosing || undefined}
      className={[
        isClosing ? "inspector-exit pointer-events-none" : "inspector-enter",
        "absolute inset-0 z-30 flex w-full min-w-0 flex-col overflow-hidden border-border bg-card",
        "md:static md:z-auto md:w-[clamp(340px,34%,440px)] md:flex-none md:border-l"
      ].join(" ")}
    >
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to list"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center border border-border text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="m-0 mb-0.5 text-xs font-bold meta-label tracking-widest text-muted-foreground">
            {type}
            {stage && stage !== type ? (
              <span className="text-foreground-secondary"> · {stage}</span>
            ) : null}
          </p>
          <h2 className="m-0 truncate text-sm font-bold leading-tight text-foreground">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="hidden min-h-9 min-w-9 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {/* One scrolling column, ordered by what the user is expected to do. No tabs. */}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
