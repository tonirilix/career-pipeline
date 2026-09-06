import { useEffect, useMemo, useState } from "react";
import { Outlet } from "@tanstack/react-router";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import { AppShellProvider, type AppShellValue } from "./appShellContext";
import { AppCommandPalette } from "./components/AppCommandPalette";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarLayout } from "./components/ui/sidebar";
import { usePipelineWorkspace } from "./pipelineWorkspace";
import type { UsePipelineControls } from "./ports/pipelineControls";
import { projectToday } from "./todayProjections";
import { useUndecidedRoles } from "./useUndecidedRoles";
import { useWorkspaceChords } from "./useWorkspaceChords";

type AppProps = {
  candidateContextGateway: CandidateContextGateway;
  gateway: JobApplicationGateway;
  roleDiscoveryGateway: RoleDiscoveryGateway;
  usePipelineControls: UsePipelineControls;
};

/**
 * The application shell: global navigation, the command palette, and the slot
 * the active route renders into. Which workspace is active is decided by the
 * router, not by inspecting the pathname here.
 */
export function App({
  candidateContextGateway,
  gateway,
  roleDiscoveryGateway,
  usePipelineControls
}: AppProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isOpportunityFormOpen, setIsOpportunityFormOpen] = useState(false);
  const workspace = usePipelineWorkspace(gateway, usePipelineControls);
  const undecidedRoles = useUndecidedRoles(roleDiscoveryGateway);

  useWorkspaceChords();

  const { applications } = workspace;
  const { roles } = undecidedRoles;
  const today = useMemo(
    () => projectToday({ applications, roles, now: Date.now() }),
    [applications, roles]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // The rail and the Today screen read the same derivation, so they cannot
  // disagree about how much needs doing.
  const navigationCounts = useMemo(
    () => ({
      today: today.actionableCount,
      pipeline: workspace.activeApplicationCount,
      roles: roles.length
    }),
    [today.actionableCount, workspace.activeApplicationCount, roles.length]
  );

  const shell = useMemo<AppShellValue>(
    () => ({
      candidateContextGateway,
      roleDiscoveryGateway,
      workspace,
      today,
      isTodayLoading: workspace.isLoadingApplications || undecidedRoles.isLoading,
      isOpportunityFormOpen,
      setIsOpportunityFormOpen
    }),
    [
      candidateContextGateway,
      roleDiscoveryGateway,
      workspace,
      today,
      undecidedRoles.isLoading,
      isOpportunityFormOpen
    ]
  );

  return (
    <SidebarLayout>
      <AppSidebar
        counts={navigationCounts}
        onOpenCommand={() => setIsCommandOpen(true)}
      />

      <AppShellProvider value={shell}>
        <Outlet />
      </AppShellProvider>

      <AppCommandPalette
        isOpen={isCommandOpen}
        onClearPipelineFilters={workspace.clearFilters}
        onClose={() => setIsCommandOpen(false)}
        onOpenOpportunityForm={() => {
          workspace.clearOpportunityFormErrors();
          setIsOpportunityFormOpen(true);
        }}
        onSelectPipelineView={workspace.setSavedView}
        setPipelineSortBy={workspace.setSortBy}
        setPipelineSourceFilter={workspace.setSourceFilter}
        setPipelineStageFilter={workspace.setStageFilter}
      />
    </SidebarLayout>
  );
}
