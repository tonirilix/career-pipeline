import type { JobApplication } from "../../../domain/jobOpportunity";
import type {
  DetailsActionState,
  DetailsCommandStatus,
  FollowUpActionState,
  OutcomeRecordingState,
  ScheduleInterviewState
} from "./types";

export function detailsActionState(
  isActive: boolean,
  status: DetailsCommandStatus
): DetailsActionState {
  return isActive ? { kind: "active", status } : { kind: "idle" };
}

export function followUpState({
  isActive,
  isClosed,
  status
}: {
  isActive: boolean;
  isClosed: boolean;
  status: DetailsCommandStatus;
}): FollowUpActionState {
  if (isClosed) {
    return {
      kind: "blocked",
      reason: "Reopen this application to create follow-ups."
    };
  }

  return detailsActionState(isActive, status);
}

export function scheduleState({
  application,
  isActive,
  isClosed,
  status
}: {
  application: JobApplication;
  isActive: boolean;
  isClosed: boolean;
  status: DetailsCommandStatus;
}): ScheduleInterviewState {
  if (isClosed || application.stage === "Saved" || application.stage === "Offer") {
    return {
      kind: "blocked",
      reason:
        "Interviews can only be scheduled for active applications before the offer stage."
    };
  }

  return detailsActionState(isActive, status);
}

export function outcomeState({
  interviewId,
  isActive,
  status
}: {
  interviewId: string;
  isActive: boolean;
  status: DetailsCommandStatus;
}): OutcomeRecordingState {
  return isActive ? { kind: "active", interviewId, status } : { kind: "idle" };
}
