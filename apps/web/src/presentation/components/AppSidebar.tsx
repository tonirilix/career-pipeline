import { Briefcase, Command, Database, LayoutGrid, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarIconButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "./ui/sidebar";

type Workspace = "pipeline" | "memory" | "roles";

type AppSidebarProps = {
  activeWorkspace: Workspace | "not-found";
  onOpenCommand: () => void;
};

const navItems = [
  {
    label: "Pipeline",
    route: "pipeline",
    icon: Briefcase
  },
  {
    label: "Memory",
    route: "memory",
    icon: Database
  },
  {
    label: "Roles",
    route: "roles",
    icon: Search
  }
] as const;

export function AppSidebar({ activeWorkspace, onOpenCommand }: AppSidebarProps) {
  const navigate = useNavigate();
  const { isCollapsed, setIsMobileOpen } = useSidebar();

  function navigateToWorkspace(workspace: Workspace) {
    setIsMobileOpen(false);
    void navigate({ to: `/${workspace}` });
  }

  return (
    <Sidebar>
      <SidebarHeader
        className={cn(
          "flex items-center justify-center",
          isCollapsed && "md:px-2 md:py-2"
        )}
      >
        <div
          className={cn(
            "hidden items-center justify-center border border-border bg-primary text-primary-foreground",
            isCollapsed ? "md:flex md:min-h-10 md:min-w-10" : "md:hidden"
          )}
          aria-hidden="true"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className={cn(isCollapsed && "md:sr-only")}>
          <p className="m-0 mb-0.5 text-center text-xs uppercase tracking-widest text-muted-foreground">
            OS
          </p>
          <h1 className="m-0 text-center text-sm font-bold leading-tight text-foreground">
            Career Pipeline
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Workspace navigation" className="grid justify-center">
          <SidebarMenu className="w-10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeWorkspace === item.route;

              return (
                <SidebarMenuItem key={item.route}>
                  <SidebarIconButton
                    aria-label={item.label}
                    title={item.label}
                    isActive={isActive}
                    onClick={() => navigateToWorkspace(item.route)}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="sr-only">{item.label}</span>
                  </SidebarIconButton>
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <SidebarIconButton
                aria-label="Open command palette"
                title="Open command palette"
                onClick={() => {
                  setIsMobileOpen(false);
                  onOpenCommand();
                }}
              >
                <Command className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">Open command palette</span>
              </SidebarIconButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </nav>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
