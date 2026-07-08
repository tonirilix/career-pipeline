import { type FormEvent, lazy, Suspense, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type { UsePipelineControls } from "./ports/pipelineControls";
import { ApplicationDetails } from "./components/ApplicationDetails";
import { FollowUpWork } from "./components/FollowUpWork";
import { OpportunityForm } from "./components/OpportunityForm";
import { PipelineBoard } from "./components/PipelineBoard";
import { FunnelChart } from "./components/FunnelChart";
import { StatsBar } from "./components/StatsBar";
import { AppSidebar } from "./components/AppSidebar";
import { AppCommandPalette } from "./components/AppCommandPalette";
import { PipelineSavedViews } from "./components/PipelineSavedViews";
import { PipelineViewOptions } from "./components/PipelineViewOptions";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { Button } from "./components/ui/button";
import { ErrorNotice } from "./components/ui/error-notice";
import {
  SecondarySidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "./components/ui/sidebar";
import { SlideOver } from "./components/ui/slide-over";
import { usePipelineWorkspace } from "./pipelineWorkspace";

const CandidateMemoryWorkspace = lazy(() =>
  import("./components/CandidateMemoryWorkspace").then((module) => ({
    default: module.CandidateMemoryWorkspace
  }))
);

const RoleDiscoveryWorkspace = lazy(() =>
  import("./components/RoleDiscoveryWorkspace").then((module) => ({
    default: module.RoleDiscoveryWorkspace
  }))
);

type AppProps = {
  candidateContextGateway: CandidateContextGateway;
  gateway: JobApplicationGateway;
  roleDiscoveryGateway: RoleDiscoveryGateway;
  usePipelineControls: UsePipelineControls;
};

type Workspace = "pipeline" | "memory" | "roles";
type WorkspaceRoute = Workspace | "not-found";

function workspaceFromPathname(pathname: string): WorkspaceRoute {
  if (pathname === "/" || pathname === "/pipeline") {
    return "pipeline";
  }

  if (pathname === "/memory") {
    return "memory";
  }

  if (pathname === "/roles") {
    return "roles";
  }

  return "not-found";
}

export function App({
  candidateContextGateway,
  gateway,
  roleDiscoveryGateway,
  usePipelineControls
}: AppProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(true);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeWorkspace = workspaceFromPathname(pathname);
  const workspace = usePipelineWorkspace(gateway, usePipelineControls);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const didSubmit = await workspace.submitOpportunity(event);
    if (didSubmit) {
      setIsFormOpen(false);
    }
  }

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

  return (
    <SidebarProvider defaultCollapsed>
      <AppSidebar
        activeWorkspace={activeWorkspace}
        onOpenCommand={() => setIsCommandOpen(true)}
      />
      {activeWorkspace === "pipeline" ? (
        <SecondarySidebar
          label="Pipeline saved views"
          title="Views"
          isOpen={isSecondaryNavOpen}
          onOpenChange={setIsSecondaryNavOpen}
        >
          <PipelineSavedViews
            activeView={workspace.savedView}
            counts={workspace.savedViewCounts}
            onSelectView={workspace.setSavedView}
          />
        </SecondarySidebar>
      ) : null}
      <SidebarInset>
      <main className="flex h-screen flex-col overflow-auto">
        {/* Mobile top bar */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-bold text-foreground">Career Pipeline</span>
        </div>
        <div className="flex-1 overflow-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1240px]">
            {activeWorkspace === "pipeline" ? (
              <WorkspaceShell
                title="Pipeline"
                description="Track active applications, follow-ups, interviews, and stage movement."
                actions={
                  <Button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent hover:bg-muted md:w-auto"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add opportunity
                  </Button>
                }
                summary={
                  <StatsBar
                    activeCount={workspace.activeApplicationCount}
                    overdueCount={workspace.overdueFollowUpItems.length}
                    upcomingCount={workspace.upcomingFollowUpItems.length}
                  />
                }
                tools={
                  <PipelineViewOptions
                    isOpen={isViewOptionsOpen}
                    onClearFilters={workspace.clearFilters}
                    onToggle={() => setIsViewOptionsOpen((isOpen) => !isOpen)}
                    searchTerm={workspace.searchTerm}
                    setSearchTerm={workspace.setSearchTerm}
                    setSortBy={workspace.setSortBy}
                    setSourceFilter={workspace.setSourceFilter}
                    setStageFilter={workspace.setStageFilter}
                    sortBy={workspace.sortBy}
                    sourceFilter={workspace.sourceFilter}
                    stageFilter={workspace.stageFilter}
                  />
                }
              >
                {workspace.commandError ? (
                  <ErrorNotice
                    className="mb-5"
                    message={workspace.commandError.message}
                    title={workspace.commandError.title}
                  />
                ) : null}

                <FunnelChart
                  stageCounts={workspace.stageCounts}
                  activeStage={workspace.stageFilter}
                  onStageClick={workspace.setStageFilter}
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="border border-border bg-card px-2 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {workspace.savedViewLabel}
                  </span>
                </div>

                {workspace.savedView === "needs-attention" ? (
                <div className="mt-4">
                  <FollowUpWork
                    completingFollowUpReminderIds={workspace.completingFollowUpReminderIds}
                    onCompleteFollowUp={workspace.completeFollowUp}
                    overdueItems={workspace.overdueFollowUpItems}
                    upcomingItems={workspace.upcomingFollowUpItems}
                  />
                </div>
                ) : null}

                <div className="mt-6" />

                {workspace.isLoadingApplications ? (
                  <div
                    role="status"
                    className="border border-border bg-card px-4 py-6 text-sm text-muted-foreground"
                  >
                    Loading applications...
                  </div>
                ) : (
                  <PipelineBoard
                    applications={workspace.visibleApplications}
                    changingStageApplicationIds={workspace.changingStageApplicationIds}
                    onStageChange={workspace.changeStage}
                    onViewDetails={workspace.viewDetails}
                  />
                )}
              </WorkspaceShell>
            ) : activeWorkspace === "memory" ? (
              <WorkspaceShell
                title="Memory"
                description="Maintain candidate context, approved memory, and AI artifacts."
              >
                <Suspense fallback={null}>
                  <CandidateMemoryWorkspace gateway={candidateContextGateway} />
                </Suspense>
              </WorkspaceShell>
            ) : activeWorkspace === "roles" ? (
              <WorkspaceShell
                title="Roles"
                description="Capture role opportunities, search topics, and promotion decisions."
              >
                <Suspense fallback={null}>
                  <RoleDiscoveryWorkspace gateway={roleDiscoveryGateway} />
                </Suspense>
              </WorkspaceShell>
            ) : (
              <WorkspaceShell
                title="Workspace not found"
                description="Choose a workspace from global navigation."
              >
                <div
                  role="status"
                  className="border border-border bg-card px-4 py-6 text-sm text-muted-foreground"
                >
                  Workspace not found.
                </div>
              </WorkspaceShell>
            )}
          </div>
        </div>
      </main>
      </SidebarInset>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); workspace.clearOpportunityFormErrors(); }}
        title="Add opportunity"
      >
        <OpportunityForm
          commandError={workspace.formCommandError}
          fieldErrors={workspace.fieldErrors}
          form={workspace.form}
          submitStatus={workspace.submitOpportunityStatus}
          onChange={workspace.setForm}
          onCancel={() => { setIsFormOpen(false); workspace.clearOpportunityFormErrors(); }}
          onSubmit={handleSubmit}
        />
      </SlideOver>

      <AppCommandPalette
        isOpen={isCommandOpen}
        onClearPipelineFilters={workspace.clearFilters}
        onClose={() => setIsCommandOpen(false)}
        onOpenOpportunityForm={() => {
          workspace.clearOpportunityFormErrors();
          setIsFormOpen(true);
        }}
        onSelectPipelineView={workspace.setSavedView}
        setPipelineSortBy={workspace.setSortBy}
        setPipelineSourceFilter={workspace.setSourceFilter}
        setPipelineStageFilter={workspace.setStageFilter}
      />

      <SlideOver
        isOpen={!!workspace.selectedApplicationId}
        onClose={workspace.closeDetails}
        title="Application details"
      >
        {workspace.selectedApplication ? (
          <ApplicationDetails
            application={workspace.selectedApplication}
            commandError={workspace.detailsCommandError}
            addNoteStatus={workspace.addNoteStatus}
            createFollowUpStatus={workspace.createFollowUpStatus}
            scheduleInterviewStatus={workspace.scheduleInterviewStatus}
            recordInterviewOutcomeStatus={workspace.recordInterviewOutcomeStatus}
            onAddNote={workspace.addNote}
            onCreateFollowUp={workspace.createFollowUp}
            onRecordInterviewOutcome={workspace.recordInterviewOutcome}
            onScheduleInterview={workspace.scheduleInterview}
          />
        ) : null}
      </SlideOver>
    </SidebarProvider>
  );
}
