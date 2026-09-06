import { Briefcase, Command, Database, ListChecks, Search } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarNavButton
} from "./ui/sidebar";

export type NavigationCounts = {
  today: number;
  pipeline: number;
  roles: number;
};

type AppSidebarProps = {
  counts: NavigationCounts;
  onOpenCommand: () => void;
};

const navItems = [
  {
    label: "Today",
    to: "/today",
    // The index route renders Today, so it marks the Today destination.
    matchPaths: ["/", "/today"],
    countKey: "today",
    icon: ListChecks
  },
  {
    label: "Pipeline",
    to: "/pipeline",
    matchPaths: ["/pipeline"],
    countKey: "pipeline",
    icon: Briefcase
  },
  {
    label: "Memory",
    to: "/memory",
    matchPaths: ["/memory"],
    countKey: null,
    icon: Database
  },
  {
    label: "Roles",
    to: "/roles",
    matchPaths: ["/roles"],
    countKey: "roles",
    icon: Search
  }
] as const;

export function AppSidebar({ counts, onOpenCommand }: AppSidebarProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <Sidebar>
      <SidebarHeader>
        <p className="m-0 mb-0.5 text-[10px] meta-label tracking-widest text-muted-foreground">
          OS
        </p>
        <h1 className="m-0 text-[13px] font-bold leading-tight text-foreground">
          Career Pipeline
        </h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.to}>
                <SidebarNavButton
                  label={item.label}
                  count={item.countKey ? counts[item.countKey] : undefined}
                  icon={<Icon className="h-4 w-4" aria-hidden="true" />}
                  isActive={item.matchPaths.some((path) => path === pathname)}
                  onClick={() => void navigate({ to: item.to })}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <button
          type="button"
          aria-label="Open command palette"
          onClick={onOpenCommand}
          className="flex min-h-9 w-full items-center gap-2.5 px-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <Command className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Commands</span>
          <span
            aria-hidden="true"
            className="ml-auto text-[10px] meta-label tracking-wide text-muted-foreground"
          >
            &#8984;K
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
