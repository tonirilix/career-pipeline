import { FormEvent, useEffect, useMemo, useState } from "react";

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
import {
  type ApplicationStage,
  applicationStages
} from "../domain/applicationStage";
import { isActiveApplication, isClosedApplication } from "../domain/closedWork";
import type { AddApplicationNoteCommand } from "../domain/applicationNote";
import type {
  CompleteFollowUpReminderCommand,
  CreateFollowUpReminderCommand
} from "../domain/followUpReminder";
import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  employmentTypes,
  type ApplicationNote,
  type FollowUpReminder,
  type Interview,
  interviewOutcomes,
  interviewTypes,
  type JobApplication,
  jobSources,
  type TimelineEvent
} from "../domain/jobOpportunity";
import type { ScheduleInterviewCommand } from "../domain/interviewScheduling";
import { getNextStages } from "../domain/stageTransition";
import "./App.css";
import type {
  PipelineSortOption,
  UsePipelineControls
} from "./ports/pipelineControls";

type AppProps = {
  gateway: JobApplicationGateway;
  usePipelineControls: UsePipelineControls;
};

export function App({ gateway, usePipelineControls }: AppProps) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [commandError, setCommandError] = useState<string | null>(null);
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
        if (isMounted) {
          setApplications(loadedApplications);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCommandError("Could not load saved opportunities.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [stableGateway]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors([]);
    setCommandError(null);

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
      setCommandError("Could not save the opportunity. Try again.");
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

  async function handleStageChange(
    application: JobApplication,
    toStage: ApplicationStage
  ) {
    setCommandError(null);

    const result = await advanceApplicationStage(stableGateway, {
      applicationId: application.id,
      toStage
    });

    if (!result.ok) {
      setCommandError(result.failure.message);
      return;
    }

    setApplications((current) =>
      current.map((candidate) =>
        candidate.id === result.application.id ? result.application : candidate
      )
    );
  }

  async function handleScheduleInterview(command: ScheduleInterviewCommand) {
    setCommandError(null);

    const result = await scheduleApplicationInterview(stableGateway, command);

    if (!result.ok) {
      setCommandError(result.failure.message);
      return;
    }

    setApplications((current) =>
      current.map((candidate) =>
        candidate.id === result.application.id ? result.application : candidate
      )
    );
  }

  async function handleCreateFollowUp(command: CreateFollowUpReminderCommand) {
    setCommandError(null);

    const result = await createApplicationFollowUpReminder(
      stableGateway,
      command
    );

    if (!result.ok) {
      setCommandError(result.failure.message);
      return;
    }

    setApplications((current) =>
      current.map((candidate) =>
        candidate.id === result.application.id ? result.application : candidate
      )
    );
  }

  async function handleCompleteFollowUp(
    command: CompleteFollowUpReminderCommand
  ) {
    setCommandError(null);

    const result = await completeApplicationFollowUpReminder(
      stableGateway,
      command
    );

    if (!result.ok) {
      setCommandError(result.failure.message);
      return;
    }

    setApplications((current) =>
      current.map((candidate) =>
        candidate.id === result.application.id ? result.application : candidate
      )
    );
  }

  async function handleAddNote(command: AddApplicationNoteCommand) {
    setCommandError(null);

    const result = await addNoteToApplication(stableGateway, command);

    if (!result.ok) {
      setCommandError(result.failure.message);
      return;
    }

    setApplications((current) =>
      current.map((candidate) =>
        candidate.id === result.application.id ? result.application : candidate
      )
    );
  }

  return (
    <main className="app-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Pipeline workspace</p>
          <h1>Job Application Tracker</h1>
        </div>
        <button type="button" onClick={() => setIsFormOpen(true)}>
          Add opportunity
        </button>
      </header>

      {isFormOpen ? (
        <section aria-label="New saved opportunity" className="entry-panel">
          <form noValidate onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Company
                <input
                  name="company"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      company: event.target.value
                    }))
                  }
                  value={form.company}
                />
              </label>
              <label>
                Role title
                <input
                  name="roleTitle"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roleTitle: event.target.value
                    }))
                  }
                  value={form.roleTitle}
                />
              </label>
              <label>
                Posting URL
                <input
                  name="postingUrl"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      postingUrl: event.target.value
                    }))
                  }
                  type="url"
                  value={form.postingUrl}
                />
              </label>
              <label>
                Source
                <select
                  name="source"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      source: event.target.value as CreateSavedJobOpportunityCommand["source"]
                    }))
                  }
                  value={form.source}
                >
                  {jobSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input
                  name="location"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value
                    }))
                  }
                  value={form.location}
                />
              </label>
              <label>
                Compensation
                <input
                  name="compensation"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      compensation: event.target.value
                    }))
                  }
                  value={form.compensation}
                />
              </label>
              <label>
                Employment type
                <select
                  name="employmentType"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      employmentType:
                        event.target.value as CreateSavedJobOpportunityCommand["employmentType"]
                    }))
                  }
                  value={form.employmentType}
                >
                  {employmentTypes.map((employmentType) => (
                    <option key={employmentType} value={employmentType}>
                      {employmentType}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {fieldErrors.length > 0 ? (
              <ul className="form-errors">
                {fieldErrors.map((error) => (
                  <li key={`${error.field}-${error.message}`}>
                    {error.message}
                  </li>
                ))}
              </ul>
            ) : null}

            {commandError ? (
              <p className="form-errors" role="alert">
                {commandError}
              </p>
            ) : null}

            <div className="form-actions">
              <button type="button" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
              <button type="submit">Save opportunity</button>
            </div>
          </form>
        </section>
      ) : null}

      {commandError ? (
        <p className="command-error" role="alert">
          {commandError}
        </p>
      ) : null}

      <section aria-label="Active work summary" className="work-summary">
        <strong>
          {activeApplicationCount} active{" "}
          {activeApplicationCount === 1 ? "application" : "applications"}
        </strong>
      </section>

      <section aria-label="Pipeline controls" className="pipeline-controls">
        <label>
          Filter by stage
          <select
            onChange={(event) =>
              setStageFilter(event.target.value as typeof stageFilter)
            }
            value={stageFilter}
          >
            <option value="All">All stages</option>
            {applicationStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <label>
          Filter by source
          <select
            onChange={(event) =>
              setSourceFilter(event.target.value as typeof sourceFilter)
            }
            value={sourceFilter}
          >
            <option value="All">All sources</option>
            {jobSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search applications
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            type="search"
            value={searchTerm}
          />
        </label>
        <label>
          Sort applications
          <select
            onChange={(event) =>
              setSortBy(event.target.value as typeof sortBy)
            }
            value={sortBy}
          >
            <option value="created">Created order</option>
            <option value="lastActivity">Last activity</option>
            <option value="followUpDate">Follow-up date</option>
          </select>
        </label>
      </section>

      <FollowUpWork
        onCompleteFollowUp={handleCompleteFollowUp}
        overdueItems={overdueFollowUpItems}
        upcomingItems={upcomingFollowUpItems}
      />

      <section
        aria-label="Application pipeline"
        className="pipeline-board"
      >
        {applicationStages.map((stage) => {
          const stageApplications = visibleApplications.filter(
            (application) => application.stage === stage
          );

          return (
          <article className="stage-column" key={stage}>
            <header>
              <h2>{stage}</h2>
              <span aria-label={`${stage} applications`}>
                {stageApplications.length}
              </span>
            </header>
            {stageApplications.length > 0 ? (
              <div className="opportunity-list">
                {stageApplications.map((application) => (
                  <ApplicationCard
                    application={application}
                    key={application.id}
                    onStageChange={handleStageChange}
                    onViewDetails={setSelectedApplicationId}
                  />
                ))}
              </div>
            ) : (
              <p>No applications yet</p>
            )}
          </article>
          );
        })}
      </section>

      {selectedApplication ? (
        <ApplicationDetails
          application={selectedApplication}
          onAddNote={handleAddNote}
          onCreateFollowUp={handleCreateFollowUp}
          onScheduleInterview={handleScheduleInterview}
        />
      ) : null}
    </main>
  );
}

type ApplicationCardProps = {
  application: JobApplication;
  onStageChange: (
    application: JobApplication,
    toStage: ApplicationStage
  ) => Promise<void>;
  onViewDetails: (applicationId: string) => void;
};

function ApplicationCard({
  application,
  onStageChange,
  onViewDetails
}: ApplicationCardProps) {
  const [selectedStage, setSelectedStage] = useState<ApplicationStage>(
    application.stage
  );
  const nextStages = getNextStages(application.stage);
  const primaryNextStage = nextStages[0];

  return (
    <article
      className={`opportunity-card${
        isClosedApplication(application) ? " closed" : ""
      }`}
    >
      <h3>{application.company}</h3>
      {isClosedApplication(application) ? (
        <span className="status-pill">Closed</span>
      ) : null}
      <p>{application.roleTitle}</p>
      <dl>
        <div>
          <dt>Source</dt>
          <dd>{application.source}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{application.location || "Not set"}</dd>
        </div>
      </dl>
      <button
        className="card-action secondary"
        onClick={() => onViewDetails(application.id)}
        type="button"
      >
        View {application.company} details
      </button>
      {primaryNextStage ? (
        <button
          className="card-action"
          onClick={() => void onStageChange(application, primaryNextStage)}
          type="button"
        >
          {stageActionLabel(application, primaryNextStage)}
        </button>
      ) : null}
      <div className="stage-update">
        <label>
          Move {application.company} to stage
          <select
            onChange={(event) =>
              setSelectedStage(event.target.value as ApplicationStage)
            }
            value={selectedStage}
          >
            {applicationStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <button
          className="card-action secondary"
          onClick={() => void onStageChange(application, selectedStage)}
          type="button"
        >
          Update {application.company} stage
        </button>
      </div>
    </article>
  );
}

function stageActionLabel(
  application: JobApplication,
  nextStage: ApplicationStage
) {
  if (application.stage === "Saved" && nextStage === "Applied") {
    return `Mark ${application.company} as applied`;
  }

  if (
    (application.stage === "Rejected" || application.stage === "Withdrawn") &&
    nextStage === "Applied"
  ) {
    return `Reopen ${application.company}`;
  }

  return `Move ${application.company} to ${nextStage}`;
}

type ApplicationDetailsProps = {
  application: JobApplication;
  onAddNote: (command: AddApplicationNoteCommand) => Promise<void>;
  onCreateFollowUp: (command: CreateFollowUpReminderCommand) => Promise<void>;
  onScheduleInterview: (command: ScheduleInterviewCommand) => Promise<void>;
};

function ApplicationDetails({
  application,
  onAddNote,
  onCreateFollowUp,
  onScheduleInterview
}: ApplicationDetailsProps) {
  const timeline = [...application.timeline].sort(compareTimelineEvents);
  const notes = [...application.notes].sort(compareNotes);
  const interviews = [...application.interviews].sort(compareInterviews);
  const followUps = [...application.followUps].sort(compareFollowUps);
  const [interviewForm, setInterviewForm] = useState<
    Omit<ScheduleInterviewCommand, "applicationId">
  >({
    type: "Recruiter screen",
    scheduledAt: "",
    notes: "",
    outcome: "Scheduled"
  });
  const [followUpForm, setFollowUpForm] = useState<
    Omit<CreateFollowUpReminderCommand, "applicationId">
  >({
    dueAt: "",
    note: ""
  });
  const [noteBody, setNoteBody] = useState("");

  async function handleInterviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onScheduleInterview({
      applicationId: application.id,
      ...interviewForm
    });
    setInterviewForm({
      type: "Recruiter screen",
      scheduledAt: "",
      notes: "",
      outcome: "Scheduled"
    });
  }

  async function handleFollowUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateFollowUp({
      applicationId: application.id,
      ...followUpForm
    });
    setFollowUpForm({
      dueAt: "",
      note: ""
    });
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onAddNote({
      applicationId: application.id,
      body: noteBody
    });
    setNoteBody("");
  }

  return (
    <aside aria-label="Application details" className="detail-panel">
      <header>
        <div>
          <p className="eyebrow">Application details</p>
          <h2>{application.company}</h2>
        </div>
        <span>{application.stage}</span>
      </header>
      <p>{application.roleTitle}</p>

      <dl className="detail-grid">
        <div>
          <dt>Source</dt>
          <dd>{application.source}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{application.location || "Not set"}</dd>
        </div>
        <div>
          <dt>Compensation</dt>
          <dd>{application.compensation || "Not set"}</dd>
        </div>
        <div>
          <dt>Employment type</dt>
          <dd>{application.employmentType}</dd>
        </div>
        <div>
          <dt>Posting URL</dt>
          <dd>
            <a href={application.postingUrl}>{application.postingUrl}</a>
          </dd>
        </div>
      </dl>

      <section aria-label="Notes">
        <h3>Notes</h3>
        {notes.length > 0 ? (
          <ol aria-label="Application notes" className="note-list">
            {notes.map((note) => (
              <li key={note.id}>
                <time dateTime={note.createdAt}>
                  {formatTimelineDate(note.createdAt)}
                </time>
                <span>{note.body}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>No notes yet</p>
        )}

        <form className="note-form" onSubmit={handleNoteSubmit}>
          <label>
            Application note
            <textarea
              onChange={(event) => setNoteBody(event.target.value)}
              value={noteBody}
            />
          </label>
          <button type="submit">Add note</button>
        </form>
      </section>

      <section aria-label="Follow-ups">
        <h3>Follow-ups</h3>
        {followUps.length > 0 ? (
          <ol aria-label="Application follow-ups" className="follow-up-list">
            {followUps.map((followUp) => (
              <li key={followUp.id}>
                <time dateTime={followUp.dueAt}>
                  {formatTimelineDate(followUp.dueAt)}
                </time>
                <span>{followUp.note}</span>
                {followUp.completedAt ? <strong>Complete</strong> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p>No follow-ups scheduled</p>
        )}

        <form className="follow-up-form" onSubmit={handleFollowUpSubmit}>
          <label>
            Follow-up due date
            <input
              onChange={(event) =>
                setFollowUpForm((current) => ({
                  ...current,
                  dueAt: event.target.value
                }))
              }
              type="datetime-local"
              value={followUpForm.dueAt}
            />
          </label>
          <label>
            Follow-up note
            <textarea
              onChange={(event) =>
                setFollowUpForm((current) => ({
                  ...current,
                  note: event.target.value
                }))
              }
              value={followUpForm.note}
            />
          </label>
          <button type="submit">Create follow-up</button>
        </form>
      </section>

      <section aria-label="Interviews">
        <h3>Interviews</h3>
        {interviews.length > 0 ? (
          <ol aria-label="Scheduled interviews" className="interview-list">
            {interviews.map((interview) => (
              <li key={interview.id}>
                <strong>{interview.type}</strong>
                <time dateTime={interview.scheduledAt}>
                  {formatTimelineDate(interview.scheduledAt)}
                </time>
                <span>{interview.outcome}</span>
                {interview.notes ? <p>{interview.notes}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p>No interviews scheduled</p>
        )}

        <form className="interview-form" onSubmit={handleInterviewSubmit}>
          <label>
            Interview type
            <select
              onChange={(event) =>
                setInterviewForm((current) => ({
                  ...current,
                  type: event.target.value as Interview["type"]
                }))
              }
              value={interviewForm.type}
            >
              {interviewTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date and time
            <input
              onChange={(event) =>
                setInterviewForm((current) => ({
                  ...current,
                  scheduledAt: event.target.value
                }))
              }
              type="datetime-local"
              value={interviewForm.scheduledAt}
            />
          </label>
          <label>
            Interview notes
            <textarea
              onChange={(event) =>
                setInterviewForm((current) => ({
                  ...current,
                  notes: event.target.value
                }))
              }
              value={interviewForm.notes}
            />
          </label>
          <label>
            Outcome
            <select
              onChange={(event) =>
                setInterviewForm((current) => ({
                  ...current,
                  outcome: event.target.value as Interview["outcome"]
                }))
              }
              value={interviewForm.outcome}
            >
              {interviewOutcomes.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Schedule interview</button>
        </form>
      </section>

      <section aria-label="Timeline">
        <h3>Timeline</h3>
        {timeline.length > 0 ? (
          <ol aria-label="Timeline events" className="timeline-list">
            {timeline.map((event) => (
              <li key={event.id}>
                <time dateTime={event.occurredAt}>
                  {formatTimelineDate(event.occurredAt)}
                </time>
                <span>{event.description}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>No timeline events yet</p>
        )}
      </section>
    </aside>
  );
}

type FollowUpWorkItem = {
  application: JobApplication;
  followUp: FollowUpReminder;
};

type FollowUpWorkProps = {
  overdueItems: FollowUpWorkItem[];
  upcomingItems: FollowUpWorkItem[];
  onCompleteFollowUp: (
    command: CompleteFollowUpReminderCommand
  ) => Promise<void>;
};

function FollowUpWork({
  overdueItems,
  upcomingItems,
  onCompleteFollowUp
}: FollowUpWorkProps) {
  return (
    <section aria-label="Follow-up work" className="follow-up-work">
      <div>
        <h2>Overdue follow-ups</h2>
        {overdueItems.length > 0 ? (
          <FollowUpWorkList
            items={overdueItems}
            label="Overdue follow-ups"
            onCompleteFollowUp={onCompleteFollowUp}
          />
        ) : (
          <p>No overdue follow-ups</p>
        )}
      </div>
      <div>
        <h2>Upcoming follow-ups</h2>
        {upcomingItems.length > 0 ? (
          <FollowUpWorkList
            items={upcomingItems}
            label="Upcoming follow-ups"
            onCompleteFollowUp={onCompleteFollowUp}
          />
        ) : (
          <p>No upcoming follow-ups</p>
        )}
      </div>
    </section>
  );
}

type FollowUpWorkListProps = {
  items: FollowUpWorkItem[];
  label: string;
  onCompleteFollowUp: (
    command: CompleteFollowUpReminderCommand
  ) => Promise<void>;
};

function FollowUpWorkList({
  items,
  label,
  onCompleteFollowUp
}: FollowUpWorkListProps) {
  return (
    <ol aria-label={label} className="follow-up-work-list">
      {items.map(({ application, followUp }) => (
        <li key={followUp.id}>
          <strong>{application.company}</strong>
          <span>{followUp.note}</span>
          <time dateTime={followUp.dueAt}>
            {formatTimelineDate(followUp.dueAt)}
          </time>
          <button
            className="card-action secondary"
            onClick={() =>
              void onCompleteFollowUp({
                applicationId: application.id,
                reminderId: followUp.id
              })
            }
            type="button"
          >
            Complete follow-up for {application.company}
          </button>
        </li>
      ))}
    </ol>
  );
}

function compareTimelineEvents(left: TimelineEvent, right: TimelineEvent) {
  return (
    new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime()
  );
}

function compareNotes(left: ApplicationNote, right: ApplicationNote) {
  return (
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );
}

function compareInterviews(left: Interview, right: Interview) {
  return (
    new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );
}

function compareFollowUps(left: FollowUpReminder, right: FollowUpReminder) {
  return (
    new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
  );
}

function compareFollowUpItems(left: FollowUpWorkItem, right: FollowUpWorkItem) {
  return compareFollowUps(left.followUp, right.followUp);
}

function sortApplications(
  applications: JobApplication[],
  sortBy: PipelineSortOption
) {
  if (sortBy === "created") {
    return applications;
  }

  return [...applications].sort((left, right) => {
    if (sortBy === "lastActivity") {
      return latestActivityTime(right) - latestActivityTime(left);
    }

    return (
      earliestActiveFollowUpTime(left) - earliestActiveFollowUpTime(right)
    );
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

  if (activeDueTimes.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

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

function formatTimelineDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
