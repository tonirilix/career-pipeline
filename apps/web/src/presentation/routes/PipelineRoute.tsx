import { type FormEvent, useState } from "react";
import { Plus } from "lucide-react";

import { useAppShell } from "../appShellContext";
import { ApplicationDetails } from "../components/ApplicationDetails";
import { FollowUpWork } from "../components/FollowUpWork";
import { FunnelChart } from "../components/FunnelChart";
import { OpportunityForm } from "../components/OpportunityForm";
import { PipelineBoard } from "../components/PipelineBoard";
import { PipelineSavedViews } from "../components/PipelineSavedViews";
import { PipelineViewOptions } from "../components/PipelineViewOptions";
import { StatsBar } from "../components/StatsBar";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { WorkspaceViewport } from "../components/WorkspaceViewport";
import { Button } from "../components/ui/button";
import { ErrorNotice } from "../components/ui/error-notice";
import { SecondarySidebar } from "../components/ui/sidebar";
import { SlideOver } from "../components/ui/slide-over";

export function PipelineRoute() {
  const { workspace, isOpportunityFormOpen, setIsOpportunityFormOpen } = useAppShell();
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(true);

  function closeOpportunityForm() {
    setIsOpportunityFormOpen(false);
    workspace.clearOpportunityFormErrors();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const didSubmit = await workspace.submitOpportunity(event);
    if (didSubmit) {
      setIsOpportunityFormOpen(false);
    }
  }

  return (
    <>
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

      <WorkspaceViewport>
        <WorkspaceShell
          title="Pipeline"
          description="Track active applications, follow-ups, interviews, and stage movement."
          actions={
            <Button
              type="button"
              onClick={() => setIsOpportunityFormOpen(true)}
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
            <span className="border border-border-strong bg-card px-2 py-1 text-xs font-bold meta-label tracking-widest text-muted-foreground">
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
              className="border border-border bg-card px-4 py-6 text-sm text-foreground-secondary"
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
      </WorkspaceViewport>

      <SlideOver
        isOpen={isOpportunityFormOpen}
        onClose={closeOpportunityForm}
        title="Add opportunity"
      >
        <OpportunityForm
          commandError={workspace.formCommandError}
          fieldErrors={workspace.fieldErrors}
          form={workspace.form}
          submitStatus={workspace.submitOpportunityStatus}
          onChange={workspace.setForm}
          onCancel={closeOpportunityForm}
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
    </>
  );
}
