import type { Interview } from "../../../domain/jobOpportunity";

export type DetailsCommandError = {
  workflow: "note" | "followUp" | "interview";
  message: string;
};

export type DetailsSection =
  | "overview"
  | "notes"
  | "followUps"
  | "interviews"
  | "timeline";

export type DetailsAction = "note" | "followUp" | "interview" | "outcome" | null;

export type DetailsCommandStatus = "idle" | "pending" | "error" | "success";

export type DetailsActionState =
  | { kind: "idle" }
  | { kind: "active"; status: DetailsCommandStatus };

export type FollowUpActionState =
  | { kind: "blocked"; reason: string }
  | DetailsActionState;

export type ScheduleInterviewState =
  | { kind: "blocked"; reason: string }
  | DetailsActionState;

export type OutcomeRecordingState =
  | { kind: "idle" }
  | {
      kind: "active";
      interviewId: string;
      status: DetailsCommandStatus;
    };

export type FollowUpFormState = {
  dueDate: string;
  dueTime: string;
  note: string;
};

export type InterviewFormState = {
  type: Interview["type"];
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
};

export type OutcomeFormState = {
  interviewId: string;
  outcome: Exclude<Interview["outcome"], "Scheduled">;
};
