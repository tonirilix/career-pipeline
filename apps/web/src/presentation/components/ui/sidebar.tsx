import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  children: ReactNode;
};

export function Sidebar({ className, isOpen = false, onClose, children }: SidebarProps) {
  return (
    <>
      {/* Backdrop — mobile only, shown when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <nav
        aria-label="Sidebar"
        className={cn(
          "hidden md:flex w-[220px] shrink-0 border-r border-border flex-col h-screen overflow-y-auto",
          isOpen && "fixed inset-y-0 left-0 z-50 flex w-[280px] md:static md:w-[220px]",
          className
        )}
      >
        {/* Close button — mobile drawer only */}
        {isOpen && (
          <div className="flex justify-end px-3 pt-3 md:hidden shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </nav>
    </>
  );
}
