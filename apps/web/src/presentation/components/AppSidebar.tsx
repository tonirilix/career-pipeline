import { Briefcase, Database, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarRail,
  useSidebar
} from "./ui/sidebar";

type Workspace = "pipeline" | "memory" | "roles";

type AppSidebarProps = {
  activeWorkspace: Workspace | "not-found";
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

export function AppSidebar({ activeWorkspace }: AppSidebarProps) {
  const navigate = useNavigate();
  const { setIsMobileOpen } = useSidebar();

  function navigateToWorkspace(workspace: Workspace) {
    setIsMobileOpen(false);
    void navigate({ to: `/${workspace}` });
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <p className="m-0 mb-0.5 text-xs uppercase tracking-widest text-muted-foreground">
          Career OS
        </p>
        <h1 className="m-0 text-lg font-bold leading-tight text-foreground">
          Career Pipeline
        </h1>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Workspace navigation">
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeWorkspace === item.route;

              return (
                <SidebarMenuItem key={item.route}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => navigateToWorkspace(item.route)}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
