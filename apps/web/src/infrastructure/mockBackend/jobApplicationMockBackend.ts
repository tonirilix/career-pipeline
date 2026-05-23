import {
  type AddApplicationNoteCommand,
  addApplicationNote
} from "../../domain/applicationNote";
import {
  type CompleteFollowUpReminderCommand,
  type CreateFollowUpReminderCommand,
  completeFollowUpReminder,
  createFollowUpReminder
} from "../../domain/followUpReminder";
import {
  type CreateSavedJobOpportunityCommand,
  type JobApplication,
  type SavedJobOpportunity
} from "../../domain/jobOpportunity";
import {
  type ScheduleInterviewCommand,
  scheduleInterview
} from "../../domain/interviewScheduling";
import {
  type StageTransitionCommand,
  transitionApplicationStage
} from "../../domain/stageTransition";

export class JobApplicationMockBackend {
  private applications: JobApplication[] = [];
  private nextApplicationId = 1;
  private nextTimelineEventId = 1;
  private nextInterviewId = 1;
  private nextFollowUpReminderId = 1;
  private nextNoteId = 1;

  listApplications() {
    return this.applications;
  }

  createSavedOpportunity(
    command: CreateSavedJobOpportunityCommand
  ): SavedJobOpportunity {
    const opportunity: SavedJobOpportunity = {
      id: String(this.nextApplicationId),
      ...command,
      stage: "Saved",
      timeline: [
        {
          id: String(this.nextTimelineEventId),
          occurredAt: this.now(),
          description: "Saved opportunity"
        }
      ],
      interviews: [],
      followUps: [],
      notes: []
    };

    this.nextApplicationId += 1;
    this.nextTimelineEventId += 1;
    this.applications = [...this.applications, opportunity];
    return opportunity;
  }

  advanceApplicationStage(command: StageTransitionCommand) {
    const application = this.findApplication(command.applicationId);
    const result = transitionApplicationStage(application, command, {
      id: String(this.nextTimelineEventId),
      occurredAt: this.now(),
      description: `Moved from ${application.stage} to ${command.toStage}`
    });

    if (!result.ok) {
      throw new Error(result.failure.message);
    }

    this.nextTimelineEventId += 1;
    this.replaceApplication(result.application);
    return result.application;
  }

  scheduleInterview(command: ScheduleInterviewCommand) {
    const application = this.findApplication(command.applicationId);
    const result = scheduleInterview(application, command, {
      interviewId: String(this.nextInterviewId),
      timelineEventId: String(this.nextTimelineEventId),
      occurredAt: this.now()
    });

    if (!result.ok) {
      throw new Error(result.failure.message);
    }

    this.nextInterviewId += 1;
    this.nextTimelineEventId += 1;
    this.replaceApplication(result.application);
    return result.application;
  }

  createFollowUpReminder(command: CreateFollowUpReminderCommand) {
    const application = this.findApplication(command.applicationId);
    const result = createFollowUpReminder(application, command, {
      reminderId: String(this.nextFollowUpReminderId),
      timelineEventId: String(this.nextTimelineEventId),
      occurredAt: this.now()
    });

    if (!result.ok) {
      throw new Error(result.failure.message);
    }

    this.nextFollowUpReminderId += 1;
    this.nextTimelineEventId += 1;
    this.replaceApplication(result.application);
    return result.application;
  }

  completeFollowUpReminder(command: CompleteFollowUpReminderCommand) {
    const application = this.findApplication(command.applicationId);
    const result = completeFollowUpReminder(application, command, {
      timelineEventId: String(this.nextTimelineEventId),
      completedAt: this.now()
    });

    if (!result.ok) {
      throw new Error(result.failure.message);
    }

    this.nextTimelineEventId += 1;
    this.replaceApplication(result.application);
    return result.application;
  }

  addApplicationNote(command: AddApplicationNoteCommand) {
    const application = this.findApplication(command.applicationId);
    const result = addApplicationNote(application, command, {
      noteId: String(this.nextNoteId),
      timelineEventId: String(this.nextTimelineEventId),
      occurredAt: this.now()
    });

    if (!result.ok) {
      throw new Error(result.failure.message);
    }

    this.nextNoteId += 1;
    this.nextTimelineEventId += 1;
    this.replaceApplication(result.application);
    return result.application;
  }

  reset() {
    this.applications = [];
    this.nextApplicationId = 1;
    this.nextTimelineEventId = 1;
    this.nextInterviewId = 1;
    this.nextFollowUpReminderId = 1;
    this.nextNoteId = 1;
  }

  private findApplication(applicationId: string) {
    const application = this.applications.find(
      (candidate) => candidate.id === applicationId
    );

    if (!application) {
      throw new Error("Application could not be found.");
    }

    return application;
  }

  private replaceApplication(application: JobApplication) {
    this.applications = this.applications.map((candidate) =>
      candidate.id === application.id ? application : candidate
    );
  }

  private now() {
    return new Date().toISOString();
  }
}

export const jobApplicationMockBackend = new JobApplicationMockBackend();
