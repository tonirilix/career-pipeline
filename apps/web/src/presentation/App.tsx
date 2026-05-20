import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  addNoteToApplication,
  advanceApplicationStage,
  completeApplicationFollowUpReminder,
  createApplicationFollowUpReminder,
  createSavedOpportunity,
  listApplications,
  scheduleApplicationInterview
} from "../application/jobApplications";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import { type ApplicationStage } from "../domain/applicationStage";
import { isActiveApplication } from "../domain/closedWork";
import type { AddApplicationNoteCommand } from "../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../domain/followUpReminder";
import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  type FollowUpReminder,
  type JobApplication
} from "../domain/jobOpportunity";
import type { ScheduleInterviewCommand } from "../domain/interviewScheduling";
import type {
  PipelineSortOption,
  UsePipelineControls
} from "./ports/pipelineControls";
import { ApplicationDetails } from "./components/ApplicationDetails";
import { FollowUpWork } from "./components/FollowUpWork";
import { OpportunityForm } from "./components/OpportunityForm";
import { PipelineBoard } from "./components/PipelineBoard";
import { PipelineControls } from "./components/PipelineControls";
import { StatsBar } from "./components/StatsBar";
import { Button } from "./components/ui/button";
import { Sidebar } from "./components/ui/sidebar";
import { SlideOver } from "./components/ui/slide-over";

type AppProps = {
  gateway: JobApplicationGateway;
  usePipelineControls: UsePipelineControls;
};

export function App({ gateway, usePipelineControls }: AppProps) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [formCommandError, setFormCommandError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateSavedJobOpportunityCommand>({
    company: "",
    roleTitle: "",
    postingUrl: "",
    source: "LinkedIn",
    location: "",
    compensation: "",
    employmentType: "Full-time"
  });

  const {
    stageFilter,
    sourceFilter,
    searchTerm,
    sortBy,
    setStageFilter,
    setSourceFilter,
    setSearchTerm,
    setSortBy
  } = usePipelineControls();

  useEffect(() => {
    let isMounted = true;

    void listApplications(stableGateway)
      .then((loadedApplications) => {
        if (isMounted) setApplications(loadedApplications);
      })
      .catch(() => {
        if (isMounted) setCommandError("Could not load saved opportunities.");
      });

    return () => { isMounted = false; };
  }, [stableGateway]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors([]);
    setFormCommandError(null);

    try {
      const result = await createSavedOpportunity(stableGateway, form);

      if (!result.ok) {
        setFieldErrors(result.errors);
        return;
      }

      setApplications((current) => [...current, result.opportunity]);
      setIsFormOpen(false);
      setForm({
        company: "",
        roleTitle: "",
        postingUrl: "",
        source: "LinkedIn",
        location: "",
        compensation: "",
        employmentType: "Full-time"
      });
    } catch {
      setFormCommandError("Could not save the opportunity. Try again.");
    }
  }

  const activeApplicationCount = applications.filter(isActiveApplication).length;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleApplications = sortApplications(
    applications.filter(
      (application) =>
        (stageFilter === "All" || application.stage === stageFilter) &&
        (sourceFilter === "All" || application.source === sourceFilter) &&
        (!normalizedSearchTerm ||
          application.company.toLowerCase().includes(normalizedSearchTerm) ||
          application.roleTitle.toLowerCase().includes(normalizedSearchTerm))
    ),
    sortBy
  );

  const selectedApplication = applications.find(
    (application) => application.id === selectedApplicationId
  );

  const activeFollowUpItems = applications
    .filter(isActiveApplication)
    .flatMap((application) =>
      application.followUps
        .filter((followUp) => !followUp.completedAt)
        .map((followUp) => ({ application, followUp }))
    )
    .sort(compareFollowUpItems);

  const now = Date.now();
  const overdueFollowUpItems = activeFollowUpItems.filter(
    ({ followUp }) => new Date(followUp.dueAt).getTime() < now
  );
  const upcomingFollowUpItems = activeFollowUpItems.filter(
    ({ followUp }) => new Date(followUp.dueAt).getTime() >= now
  );

  async function handleStageChange(application: JobApplication, toStage: ApplicationStage) {
    setCommandError(null);
    const result = await advanceApplicationStage(stableGateway, {
      applicationId: application.id,
      toStage
    });
    if (!result.ok) { setCommandError(result.failure.message); return; }
    setApplications((current) =>
      current.map((c) => c.id === result.application.id ? result.application : c)
    );
  }

  async function handleScheduleInterview(command: ScheduleInterviewCommand) {
    setCommandError(null);
    const result = await scheduleApplicationInterview(stableGateway, command);
    if (!result.ok) { setCommandError(result.failure.message); return; }
    setApplications((current) =>
      current.map((c) => c.id === result.application.id ? result.application : c)
    );
  }

  async function handleCreateFollowUp(command: CreateFollowUpReminderCommand) {
    setCommandError(null);
    const result = await createApplicationFollowUpReminder(stableGateway, command);
    if (!result.ok) { setCommandError(result.failure.message); return; }
    setApplications((current) =>
      current.map((c) => c.id === result.application.id ? result.application : c)
    );
  }

  async function handleCompleteFollowUp(command: CompleteFollowUpReminderCommand) {
    setCommandError(null);
    const result = await completeApplicationFollowUpReminder(stableGateway, command);
    if (!result.ok) { setCommandError(result.failure.message); return; }
    setApplications((current) =>
      current.map((c) => c.id === result.application.id ? result.application : c)
    );
  }

  async function handleAddNote(command: AddApplicationNoteCommand) {
    setCommandError(null);
    const result = await addNoteToApplication(stableGateway, command);
    if (!result.ok) { setCommandError(result.failure.message); return; }
    setApplications((current) =>
      current.map((c) => c.id === result.application.id ? result.application : c)
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <div className="border-b border-border px-4 py-4 shrink-0">
          <p className="text-[0.6rem] text-muted-foreground uppercase tracking-widest m-0 mb-0.5">
            Pipeline workspace
          </p>
          <h1 className="text-xl font-bold text-foreground leading-tight m-0 mb-3">
            Job Application Tracker
          </h1>
          <Button
            type="button"
            onClick={() => setIsFormOpen(true)}
            variant="outline"
            className="w-full bg-transparent hover:bg-muted rounded-none"
          >
            Add opportunity
          </Button>
        </div>

        <section aria-label="Active work summary" className="px-4 py-3 border-b border-border shrink-0">
          <span className={`inline-flex items-center text-xs uppercase tracking-widest ${
            activeApplicationCount > 0 ? "text-accent" : "text-muted-foreground"
          }`}>
            {activeApplicationCount} active {activeApplicationCount === 1 ? "application" : "applications"}
          </span>
        </section>

        <StatsBar
          activeCount={activeApplicationCount}
          overdueCount={overdueFollowUpItems.length}
          upcomingCount={upcomingFollowUpItems.length}
        />

        <PipelineControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSortBy={setSortBy}
          setSourceFilter={setSourceFilter}
          setStageFilter={setStageFilter}
          sortBy={sortBy}
          sourceFilter={sourceFilter}
          stageFilter={stageFilter}
        />

        <FollowUpWork
          onCompleteFollowUp={handleCompleteFollowUp}
          overdueItems={overdueFollowUpItems}
          upcomingItems={upcomingFollowUpItems}
        />
      </Sidebar>

      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border md:hidden shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-colors"
          >
            ☰
          </button>
          <span className="text-sm font-bold text-foreground">Job Application Tracker</span>
        </div>
        <div className="flex-1 overflow-auto px-6 py-6">
          {commandError ? (
            <p
              className="border border-border text-destructive text-xs px-4 py-3 mb-5"
              role="alert"
            >
              <span className="font-bold uppercase tracking-widest">Error:</span> {commandError}
            </p>
          ) : null}

        <PipelineBoard
          applications={visibleApplications}
          onStageChange={handleStageChange}
          onViewDetails={setSelectedApplicationId}
        />
        </div>
      </main>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setFieldErrors([]); setFormCommandError(null); }}
        title="Add opportunity"
      >
        <OpportunityForm
          commandError={formCommandError}
          fieldErrors={fieldErrors}
          form={form}
          onChange={setForm}
          onCancel={() => { setIsFormOpen(false); setFieldErrors([]); setFormCommandError(null); }}
          onSubmit={handleSubmit}
        />
      </SlideOver>

      <SlideOver
        isOpen={!!selectedApplicationId}
        onClose={() => setSelectedApplicationId(null)}
        title="Application details"
      >
        {selectedApplication ? (
          <ApplicationDetails
            application={selectedApplication}
            onAddNote={handleAddNote}
            onCreateFollowUp={handleCreateFollowUp}
            onScheduleInterview={handleScheduleInterview}
          />
        ) : null}
      </SlideOver>
    </div>
  );
}

type FollowUpWorkItem = {
  application: JobApplication;
  followUp: FollowUpReminder;
};

function compareFollowUpItems(left: FollowUpWorkItem, right: FollowUpWorkItem) {
  return new Date(left.followUp.dueAt).getTime() - new Date(right.followUp.dueAt).getTime();
}

function sortApplications(applications: JobApplication[], sortBy: PipelineSortOption) {
  if (sortBy === "created") return applications;

  return [...applications].sort((left, right) => {
    if (sortBy === "lastActivity") {
      return latestActivityTime(right) - latestActivityTime(left);
    }
    return earliestActiveFollowUpTime(left) - earliestActiveFollowUpTime(right);
  });
}

function latestActivityTime(application: JobApplication) {
  return Math.max(
    ...application.timeline.map((event) => dateTimeOrZero(event.occurredAt)),
    0
  );
}

function earliestActiveFollowUpTime(application: JobApplication) {
  const activeDueTimes = application.followUps
    .filter((followUp) => !followUp.completedAt)
    .map((followUp) => dateTimeOrInfinity(followUp.dueAt));

  if (activeDueTimes.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...activeDueTimes);
}

function dateTimeOrZero(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function dateTimeOrInfinity(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}
