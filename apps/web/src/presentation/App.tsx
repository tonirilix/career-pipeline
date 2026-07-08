import { type FormEvent, lazy, Suspense, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Briefcase, Database, Plus, Search } from "lucide-react";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type { UsePipelineControls } from "./ports/pipelineControls";
import { ApplicationDetails } from "./components/ApplicationDetails";
import { FollowUpWork } from "./components/FollowUpWork";
import { OpportunityForm } from "./components/OpportunityForm";
import { PipelineBoard } from "./components/PipelineBoard";
import { PipelineControls } from "./components/PipelineControls";
import { FunnelChart } from "./components/FunnelChart";
import { StatsBar } from "./components/StatsBar";
import { Button } from "./components/ui/button";
import { ErrorNotice } from "./components/ui/error-notice";
import { Sidebar } from "./components/ui/sidebar";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeWorkspace = workspaceFromPathname(pathname);
  const navigate = useNavigate();
  const workspace = usePipelineWorkspace(gateway, usePipelineControls);

  function navigateToWorkspace(workspaceRoute: Workspace) {
    void navigate({ to: `/${workspaceRoute}` });
    setIsSidebarOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const didSubmit = await workspace.submitOpportunity(event);
    if (didSubmit) {
      setIsFormOpen(false);
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <div className="border-b border-border px-4 py-4 shrink-0">
          <p className="text-xs text-muted-foreground uppercase tracking-widest m-0 mb-0.5">
            Pipeline workspace
          </p>
          <h1 className="text-xl font-bold text-foreground leading-tight m-0 mb-3">
            Career Pipeline
          </h1>
          <Button
            type="button"
            onClick={() => setIsFormOpen(true)}
            variant="outline"
            className="w-full bg-transparent hover:bg-muted rounded-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add opportunity
          </Button>
          <nav className="mt-3 grid grid-cols-3 gap-2" aria-label="Workspace navigation">
            <Button
              type="button"
              variant={activeWorkspace === "pipeline" ? "default" : "outline"}
              onClick={() => navigateToWorkspace("pipeline")}
              aria-current={activeWorkspace === "pipeline" ? "page" : undefined}
              className="rounded-none"
            >
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              Pipeline
            </Button>
            <Button
              type="button"
              variant={activeWorkspace === "memory" ? "default" : "outline"}
              onClick={() => navigateToWorkspace("memory")}
              aria-current={activeWorkspace === "memory" ? "page" : undefined}
              className="rounded-none"
            >
              <Database className="h-4 w-4" aria-hidden="true" />
              Memory
            </Button>
            <Button
              type="button"
              variant={activeWorkspace === "roles" ? "default" : "outline"}
              onClick={() => navigateToWorkspace("roles")}
              aria-current={activeWorkspace === "roles" ? "page" : undefined}
              className="rounded-none"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Roles
            </Button>
          </nav>
        </div>

        <StatsBar
          activeCount={workspace.activeApplicationCount}
          overdueCount={workspace.overdueFollowUpItems.length}
          upcomingCount={workspace.upcomingFollowUpItems.length}
        />

        <PipelineControls
          searchTerm={workspace.searchTerm}
          setSearchTerm={workspace.setSearchTerm}
          setSortBy={workspace.setSortBy}
          setSourceFilter={workspace.setSourceFilter}
          setStageFilter={workspace.setStageFilter}
          sortBy={workspace.sortBy}
          sourceFilter={workspace.sourceFilter}
          stageFilter={workspace.stageFilter}
        />

        <FollowUpWork
          completingFollowUpReminderIds={workspace.completingFollowUpReminderIds}
          onCompleteFollowUp={workspace.completeFollowUp}
          overdueItems={workspace.overdueFollowUpItems}
          upcomingItems={workspace.upcomingFollowUpItems}
        />
      </Sidebar>

      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border md:hidden shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            className="min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-colors"
          >
            ☰
          </button>
          <span className="text-sm font-bold text-foreground">Career Pipeline</span>
        </div>
        <div className="flex-1 overflow-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1180px]">
            {activeWorkspace === "pipeline" ? (
              <>
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
              </>
            ) : activeWorkspace === "memory" ? (
              <Suspense fallback={null}>
                <CandidateMemoryWorkspace gateway={candidateContextGateway} />
              </Suspense>
            ) : activeWorkspace === "roles" ? (
              <Suspense fallback={null}>
                <RoleDiscoveryWorkspace gateway={roleDiscoveryGateway} />
              </Suspense>
            ) : (
              <div
                role="status"
                className="border border-border bg-card px-4 py-6 text-sm text-muted-foreground"
              >
                Workspace not found.
              </div>
            )}
          </div>
        </div>
      </main>

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
    </div>
  );
}
