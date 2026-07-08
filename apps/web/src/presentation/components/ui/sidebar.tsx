import {
  createContext,
  type ComponentProps,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarContextValue = {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be rendered inside SidebarProvider.");
  }

  return context;
}

type SidebarProviderProps = {
  children: ReactNode;
  defaultCollapsed?: boolean;
};

export function SidebarProvider({
  children,
  defaultCollapsed = false
}: SidebarProviderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const value = useMemo(
    () => ({
      isMobileOpen,
      setIsMobileOpen,
      isCollapsed,
      setIsCollapsed
    }),
    [isMobileOpen, isCollapsed]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        className="flex h-screen min-h-0 w-full overflow-hidden bg-background text-foreground"
        data-sidebar-wrapper
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ className, children, ...props }: ComponentProps<"nav">) {
  const { isMobileOpen, setIsMobileOpen, isCollapsed } = useSidebar();

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <nav
        aria-label={props["aria-label"] ?? "Global navigation"}
        data-collapsed={isCollapsed}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-border bg-background transition-transform md:static md:z-auto md:translate-x-0",
          isMobileOpen && "translate-x-0",
          isCollapsed ? "md:w-16" : "md:w-56",
          className
        )}
        {...props}
      >
        {isMobileOpen ? (
          <div className="flex justify-end px-3 pt-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation"
              className="flex min-h-11 min-w-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        {children}
      </nav>
    </>
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-b border-border px-3 py-3", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-t border-border px-3 py-3", className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("m-0 grid list-none gap-1 p-0", className)} {...props} />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("min-w-0", className)} {...props} />;
}

type SidebarMenuButtonProps = ComponentProps<"button"> & {
  isActive?: boolean;
};

export function SidebarMenuButton({
  className,
  isActive = false,
  ...props
}: SidebarMenuButtonProps) {
  const { isCollapsed } = useSidebar();

  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className={cn(
        "flex min-h-10 w-full items-center gap-2 border border-transparent px-3 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        isActive && "border-border bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        isCollapsed && "md:justify-center md:px-0",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuLabel({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  const { isCollapsed } = useSidebar();

  return (
    <span
      className={cn(isCollapsed && "md:sr-only", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("min-w-0 flex-1 overflow-hidden", className)} {...props} />
  );
}

export function SidebarTrigger({ className, ...props }: ComponentProps<"button">) {
  const { setIsMobileOpen } = useSidebar();

  return (
    <button
      type="button"
      onClick={() => setIsMobileOpen(true)}
      aria-label="Open navigation"
      className={cn(
        "flex min-h-11 min-w-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden",
        className
      )}
      {...props}
    >
      <Menu className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export function SidebarRail({ className, ...props }: ComponentProps<"button">) {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <button
      type="button"
      aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={cn(
        "hidden min-h-10 w-full items-center justify-center border-t border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex",
        className
      )}
      {...props}
    >
      {isCollapsed ? (
        <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
      ) : (
        <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
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
      className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex"
    >
      <div className="flex min-h-11 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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

export function SidebarIconButton({
  className,
  isActive = false,
  ...props
}: SidebarMenuButtonProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className={cn(
        "flex min-h-10 min-w-10 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        isActive && "border-border bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}
