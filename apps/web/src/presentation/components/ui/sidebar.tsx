import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  children: ReactNode;
};

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <nav
      aria-label="Sidebar"
      className={cn(
        "w-[220px] shrink-0 border-r border-border flex flex-col h-screen overflow-y-auto",
        className
      )}
    >
      {children}
    </nav>
  );
}
